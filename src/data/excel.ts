import * as XLSX from 'xlsx'
import {
  type AuditItem,
  type AuditMeta,
  type AreaId,
  type PillarId,
  type Response,
} from './audit'

const AREA_MAP: Record<string, AreaId> = {
  corte: 'corte',
  'corte y patronaje': 'corte',
  confección: 'confeccion',
  confeccion: 'confeccion',
  bodega: 'bodega',
  general: 'general',
}

const PILLAR_MAP: Record<string, PillarId> = {
  '1s': 'seiri',
  '2s': 'seiton',
  '3s': 'seiso',
  '4s': 'seiketsu',
  '5s': 'shitsuke',
  seiri: 'seiri',
  seiton: 'seiton',
  seiso: 'seiso',
  seiketsu: 'seiketsu',
  shitsuke: 'shitsuke',
  clasificar: 'seiri',
  ordenar: 'seiton',
  limpieza: 'seiso',
  estandarizar: 'seiketsu',
  disciplina: 'shitsuke',
  sort: 'seiri',
  'set in order': 'seiton',
  shine: 'seiso',
  standardize: 'seiketsu',
  sustain: 'shitsuke',
}

const RESPONSE_MAP: Record<string, Response> = {
  sí: 'si',
  si: 'si',
  yes: 'si',
  no: 'no',
  'n/a': 'na',
  na: 'na',
  '—': 'na',
}

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

function pillarFromText(question: string): PillarId | null {
  const q = norm(question)
  if (/clasif|innecesario|retir|separ|rechaz|retazos|sobrantes/i.test(q)) return 'seiri'
  if (/orden|organiz|herramient|lugar|identif|estante|pasillo|despej|cable|estacion|contenedor/i.test(q)) return 'seiton'
  if (/limpi/i.test(q)) return 'seiso'
  if (/señal|señalet|extintor|botiquín|iluminac|uniforme|ficha|emergencia|norma|procedimient|estandar/i.test(q)) return 'seiketsu'
  if (/cronograma|disciplina|mantenimient|fecha.*vigencia|buen estado|operativ|funcionando|chapa|tomacorrient/i.test(q)) return 'shitsuke'
  return null
}

export interface ParseResult {
  items: AuditItem[]
  meta: AuditMeta
  errors: string[]
}

export function parseExcelWorkbook(data: ArrayBuffer, filename: string): ParseResult {
  const errors: string[] = []
  const wb = XLSX.read(data, { type: 'array' })

  const sheetName = wb.SheetNames[0]
  if (!sheetName) {
    errors.push('El archivo no contiene hojas')
    return { items: [], meta: defaultMeta(filename), errors }
  }

  const ws = wb.Sheets[sheetName]
  const raw: Record<string, string>[] = XLSX.utils.sheet_to_json(ws, { defval: '' })

  if (raw.length === 0) {
    errors.push('La hoja está vacía')
    return { items: [], meta: defaultMeta(filename), errors }
  }

  const headers = Object.keys(raw[0]).map((h) => norm(h))

  const colArea =
    headers.find((h) => /^area/.test(h)) ||
    headers.find((h) => /departamento/.test(h)) ||
    headers.find((h) => /seccion/.test(h))

  const colPillar =
    headers.find((h) => /^pilar/.test(h)) ||
    headers.find((h) => /^pillar/.test(h)) ||
    headers.find((h) => /^s$/.test(h)) ||
    headers.find((h) => /^1s|2s|3s|4s|5s$/.test(h))

  const colQuestion =
    headers.find((h) => /pregunta/.test(h)) ||
    headers.find((h) => /question/.test(h)) ||
    headers.find((h) => /item/.test(h)) ||
    headers.find((h) => /preg/.test(h)) ||
    headers[Math.max(0, headers.length - 3)]

  const colResponse =
    headers.find((h) => /respuesta/.test(h)) ||
    headers.find((h) => /response/.test(h)) ||
    headers.find((h) => /resultado/.test(h)) ||
    headers.find((h) => /resp/.test(h)) ||
    headers[Math.max(0, headers.length - 2)]

  if (!colArea || !colQuestion || !colResponse) {
    errors.push(
      `No se encontraron las columnas esperadas (Área, Pregunta, Respuesta). Columnas detectadas: ${headers.join(', ')}`,
    )
    return { items: [], meta: defaultMeta(filename), errors }
  }

  const items: AuditItem[] = []
  let nextId = 1

  for (let i = 0; i < raw.length; i++) {
    const row = raw[i]
    const rowNum = i + 2

    const areaRaw = norm(row[colArea] || '')
    const pillarRaw = colPillar ? norm(row[colPillar] || '') : ''
    const questionRaw = row[colQuestion] || ''
    const responseRaw = norm(row[colResponse] || '')

    if (!questionRaw && !responseRaw) continue

    const area = AREA_MAP[areaRaw]
    if (!area) {
      errors.push(`Fila ${rowNum}: área "${row[colArea]}" no reconocida`)
      continue
    }

    let pillar: PillarId | null = pillarRaw ? (PILLAR_MAP[pillarRaw] ?? null) : null
    if (!pillar) {
      pillar = pillarFromText(questionRaw)
    }
    if (!pillar) {
      errors.push(`Fila ${rowNum}: no se pudo determinar el pilar 5S - "${questionRaw.slice(0, 60)}"`)
      continue
    }

    const response = RESPONSE_MAP[responseRaw]
    if (!response) {
      errors.push(`Fila ${rowNum}: respuesta "${row[colResponse]}" no reconocida (use Sí/No/N/A)`)
      continue
    }

    const observationRaw = headers.find((h) => /observ/.test(h) || /nota/.test(h))
    const observation = observationRaw ? (row[observationRaw] || '').trim() : undefined

    items.push({ id: nextId++, area, pillar, question: questionRaw.trim(), response, observation })
  }

  if (items.length === 0) {
    errors.push('No se pudo importar ningún ítem')
  }

  return {
    items,
    meta: {
      company: 'Palestra Couture',
      responsible: 'Importado desde Excel',
      date: new Date().toISOString().slice(0, 10),
      location: filename.replace(/\.xlsx?$/i, ''),
      standardGreen: 0.85,
      standardYellow: 0.7,
    },
    errors,
  }
}

function defaultMeta(filename: string): AuditMeta {
  return {
    company: 'Palestra Couture',
    responsible: 'Import — ' + filename,
    date: new Date().toISOString().slice(0, 10),
    location: filename,
    standardGreen: 0.85,
    standardYellow: 0.7,
  }
}
