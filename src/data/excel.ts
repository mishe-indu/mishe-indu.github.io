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

const RESPONSE_TEXT: Record<string, Response> = {
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

function parseResponseText(v: string): Response | null {
  return RESPONSE_TEXT[norm(v)] ?? null
}

export interface ParseResult {
  items: AuditItem[]
  meta: AuditMeta
  errors: string[]
}

/**
 * Detecta y parsea ambos formatos de Excel:
 *
 * Formato A (checkboxes SI/NO/N/A):
 *   Hoja AUDITORÍA — Columnas: ÁREA (B), TEMA (E), SI (F), NO (G), N/A (H)
 *
 * Formato B (texto si/no/na):
 *   Hoja CHECK LIST — Columnas: RUTA CRÍTICA (B), TEMA (D), CALIFICACIÓN (E)
 *
 * También busca metadatos (empresa, responsable, fecha) en cubierta/formulario.
 */
export function parseExcelWorkbook(data: ArrayBuffer, filename: string): ParseResult {
  const errors: string[] = []
  const wb = XLSX.read(data, { type: 'array' })

  let empresa = ''
  let responsable = ''
  let fecha = ''

  // ── 1. Extraer metadatos de todas las hojas ─────────────────────────
  for (const sn of wb.SheetNames) {
    const rows: any[][] = XLSX.utils.sheet_to_json(wb.Sheets[sn], { header: 1, defval: '' })
    for (const row of rows) {
      const j = row.map((c: any) => norm(String(c))).join('|')
      if (j.includes('empresa') && !j.includes('5')) {
        const v = row.find((c: any, i: number) => i > 0 && String(c).trim().length > 2 && !/empresa/i.test(String(c)))
        if (v) empresa = String(v).trim()
      }
      if (j.includes('responsable')) {
        const v = row.find((c: any, i: number) => i > 0 && String(c).trim().length > 2 && !/responsable|fecha|audit/i.test(String(c)))
        if (v) responsable = String(v).trim()
      }
      if (j.includes('fecha')) {
        const v = row.find((c: any, i: number) => i > 0 && String(c).trim().length > 2 && !/fecha|responsable/i.test(String(c)))
        if (v) {
          const d = new Date(v)
          fecha = isNaN(d.getTime()) ? String(v).trim() : d.toISOString().slice(0, 10)
        }
      }
    }
  }

  // ── 2. Encontrar la hoja de datos (CHECK LIST o AUDITORÍA) ─────────
  const dataSheet = wb.SheetNames.find(
    (n) => /check/i.test(n) || /audit/i.test(n) || /lista/i.test(n),
  ) || wb.SheetNames[0]

  const rows: any[][] = XLSX.utils.sheet_to_json(wb.Sheets[dataSheet], { header: 1, defval: '' })

  // ── 3. Detectar formato ─────────────────────────────────────────────
  // Buscamos la primera fila que contiene una pregunta 5S (texto largo)
  let dataStartRow = -1
  for (let i = 0; i < Math.min(15, rows.length); i++) {
    for (let c = 0; c < (rows[i] || []).length; c++) {
      const v = String(rows[i][c] || '').trim()
      if (v.length > 20 && /\?/.test(v)) {
        dataStartRow = i
        break
      }
    }
    if (dataStartRow >= 0) break
  }

  // try alternate: look for SI/NO/N/A boolean columns
  let isCheckboxFormat = false
  if (dataStartRow < 0) {
    for (let r = 0; r < Math.min(12, rows.length); r++) {
      for (let c = 0; c < (rows[r] || []).length; c++) {
        if (String(rows[r][c]).trim().toUpperCase() === 'SI') {
          for (let r2 = r + 1; r2 < Math.min(rows.length, r + 8); r2++) {
            if (rows[r2] && (rows[r2][c] === true || rows[r2][c] === false)) {
              isCheckboxFormat = true
              dataStartRow = r + 1
              break
            }
          }
          if (isCheckboxFormat) break
        }
      }
      if (isCheckboxFormat) break
    }
  }

  if (dataStartRow < 0) {
    errors.push('No se encontraron datos de auditoría 5S en el archivo')
    return { items: [], meta: defaultMeta(empresa || filename, responsable, fecha), errors }
  }

  // ── 4. Parsear según formato ───────────────────────────────────────
  const items: AuditItem[] = []
  let nextId = 1
  let currentAreaRaw = 'General'
  let currentPillarRaw = ''

  if (isCheckboxFormat) {
    // Formato A: columnas fijas B=ÁREA, E=TEMA, F=SI, G=NO, H=N/A, I=OBS
    for (let r = dataStartRow; r < rows.length; r++) {
      const row = rows[r] || []
      const areaCandidate = String(row[1] || '').trim()
      if (areaCandidate.length > 2) currentAreaRaw = areaCandidate
      const question = String(row[4] || '').trim()
      if (question.length < 5) continue

      const area = AREA_MAP[norm(currentAreaRaw)] || 'general'
      const pillar = pillarFromText(question) || 'shitsuke'
      const si = row[5] === true
      const no = row[6] === true
      const na = row[7] === true
      const response: Response = si ? 'si' : no ? 'no' : na ? 'na' : 'na'
      const obs = String(row[8] || '').trim()

      items.push({ id: nextId++, area, pillar, question, response, observation: obs || undefined })
    }
  } else {
    // Formato B: columnas B=RUTA_CRÍTICA/pilar, D=TEMA, E=CALIFICACIÓN, F=OBS
    let colQuestion = -1
    let colResponse = -1
    let colPillar = -1
    let colObs = -1

    // Scan header row (dataStartRow - 1 or dataStartRow itself if header is on same row)
    for (let i = Math.max(0, dataStartRow - 2); i <= dataStartRow; i++) {
      const row = rows[i] || []
      for (let c = 0; c < row.length; c++) {
        const h = norm(String(row[c]))
        if (/tema|pregunta|item/.test(h)) colQuestion = c
        if (/calific|respuesta|resultado/.test(h)) colResponse = c
        if (/ruta|critic|pilar/.test(h)) colPillar = c
        if (/observ/i.test(h)) colObs = c
      }
    }

    // Fallback heuristic: question is usually the longest text column, response is si/no short text
    if (colQuestion < 0 || colResponse < 0) {
      for (let c = 0; c < (rows[dataStartRow] || []).length; c++) {
        const v = String(rows[dataStartRow][c] || '').trim()
        const vn = norm(v)
        if (vn === 'si' || vn === 'no' || vn === 'na') {
          colResponse = c
        }
      }
      // question is usually the column just before response
      if (colResponse > 0 && colQuestion < 0) colQuestion = colResponse - 1
    }

    if (colQuestion < 0) colQuestion = 3  // default: column D
    if (colResponse < 0) colResponse = 4  // default: column E

    for (let r = dataStartRow; r < rows.length; r++) {
      const row = rows[r] || []
      const pillarCandidate = colPillar >= 0 ? String(row[colPillar] || '').trim() : ''
      if (pillarCandidate.length > 2 && pillarCandidate.length < 25) {
        currentPillarRaw = pillarCandidate
      }
      const question = String(row[colQuestion] || '').trim()
      if (question.length < 5) continue

      const area = 'general'
      let pillar: PillarId | null = currentPillarRaw ? (PILLAR_MAP[norm(currentPillarRaw)] ?? null) : null
      if (!pillar) pillar = pillarFromText(question)
      if (!pillar) pillar = 'shitsuke'

      const respRaw = String(row[colResponse] || '').trim()
      const response = parseResponseText(respRaw) || 'si'
      const obs = colObs >= 0 ? String(row[colObs] || '').trim() : ''

      items.push({ id: nextId++, area, pillar, question, response, observation: obs || undefined })
    }
  }

  if (items.length === 0) {
    errors.push('No se pudo importar ningún ítem de auditoría')
  }

  return {
    items,
    meta: {
      company: empresa || 'Palestra Couture',
      responsible: responsable || 'Importado desde Excel',
      date: fecha || new Date().toISOString().slice(0, 10),
      location: filename.replace(/\.xlsx?$/i, ''),
      standardGreen: 0.85,
      standardYellow: 0.7,
    },
    errors,
  }
}

function defaultMeta(company: string, responsible: string, date: string): AuditMeta {
  return {
    company: company || 'Palestra Couture',
    responsible: responsible || 'Import — Excel',
    date: date || new Date().toISOString().slice(0, 10),
    location: 'Import',
    standardGreen: 0.85,
    standardYellow: 0.7,
  }
}
