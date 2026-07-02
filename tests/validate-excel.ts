// ============================================================================
//  Batería de validación del parser de Excel (parseMatrixWorkbook).
//
//  Corre con:  npm run test:excel
//
//  Casos:
//   - fixtures sintéticos en tests/fixtures/ (año completo, huecos #DIV/0!,
//     valores en % vs fracción, matriz vacía, libro sin matriz)
//   - los Excel reales de la carpeta padre, si existen (se saltan si no)
// ============================================================================
import { parseMatrixWorkbook } from '../src/data/excel'
import fs from 'fs'
import path from 'path'

const FIX = path.join(__dirname, 'fixtures')
const REAL = path.join(__dirname, '..', '..')

type Result = ReturnType<typeof parseMatrixWorkbook>
interface Case {
  file: string
  optional?: boolean
  expect: (r: Result) => string[]
}

const monthsOf = (r: Result, name: string) => {
  const def = r.dashboard?.definitions.find((d) => d.name.toLowerCase().includes(name))
  if (!def || !r.dashboard) return null
  return (r.dashboard.data[def.id] || []).filter((m) => m.result !== null)
}

const cases: Case[] = [
  {
    file: path.join(FIX, 'test-anio-completo.xlsx'),
    expect: (r) => {
      const errs: string[] = []
      if (!r.dashboard) return ['sin dashboard']
      if (r.dashboard.definitions.length !== 5) errs.push(`defs=${r.dashboard.definitions.length}, esperaba 5`)
      const pub = monthsOf(r, 'publicaciones')
      if (!pub || pub.length !== 12) errs.push(`publicaciones meses=${pub?.length}, esperaba 12`)
      if (pub && pub[0].status !== 'ideal') errs.push(`enero pub=${pub[0].status}, esperaba ideal (0.95)`)
      if (pub && pub[4].status !== 'deficient') errs.push(`mayo pub=${pub[4].status}, esperaba deficient (0.50)`)
      const vta = monthsOf(r, 'ventas')
      if (vta && vta[2].status !== 'ideal') errs.push(`marzo ventas=${vta[2].status}, esperaba ideal (33.6%)`)
      if (vta && vta[5].status !== 'deficient') errs.push(`junio ventas=${vta[5].status}, esperaba deficient (1%)`)
      const acc = monthsOf(r, 'accidentabilidad')
      if (acc && acc[0].status !== 'ideal') errs.push(`enero accidentes=${acc[0].status}, esperaba ideal (0)`)
      if (acc && acc[2].status !== 'deficient') errs.push(`marzo accidentes=${acc[2].status}, esperaba deficient (100%)`)
      return errs
    },
  },
  {
    file: path.join(FIX, 'test-sin-ventas-con-huecos.xlsx'),
    expect: (r) => {
      const errs: string[] = []
      if (!r.dashboard) return ['sin dashboard']
      const vta = monthsOf(r, 'ventas')
      if (vta === null) errs.push('la definición de ventas debe existir aunque falte su hoja')
      else if (vta.length !== 0) errs.push(`ventas sin hoja debería quedar vacío, tiene ${vta.length}`)
      const pub = monthsOf(r, 'publicaciones')
      if (!pub || pub.length !== 2) errs.push(`pub con huecos: ${pub?.length} meses con dato, esperaba 2`)
      const pubDef = r.dashboard.definitions.find((d) => d.name.toLowerCase().includes('publicaciones'))!
      const all = r.dashboard.data[pubDef.id] || []
      if (all.some((m) => /total|promedio/i.test(m.period))) errs.push('no filtró filas Total/Promedio')
      return errs
    },
  },
  {
    file: path.join(FIX, 'test-en-porcentajes.xlsx'),
    expect: (r) => {
      const errs: string[] = []
      const pub = monthsOf(r, 'publicaciones')
      if (!pub?.length) return ['pub sin datos']
      const mayo = pub[pub.length - 1]
      if (Math.abs((mayo.result ?? 0) - 0.5) > 0.001) errs.push(`pub Mayo=${mayo.result}, esperaba 0.5 (normalizado de 50)`)
      const conf = monthsOf(r, 'conformidad')
      if (conf?.length && conf[0].status !== 'acceptable') errs.push(`conformidad=${conf[0].status}, esperaba acceptable (87)`)
      return errs
    },
  },
  {
    file: path.join(FIX, 'test-matriz-vacia.xlsx'),
    expect: (r) => (r.dashboard === null && r.errors.length > 0 ? [] : ['esperaba error y dashboard null']),
  },
  {
    file: path.join(FIX, 'test-sin-matriz.xlsx'),
    expect: (r) => (r.dashboard === null && r.errors.some((e) => /matriz/i.test(e)) ? [] : ['esperaba error de hoja matriz']),
  },
  {
    file: path.join(REAL, 'MATRIZ DE INDICADORES PALESTRA.xlsx'),
    optional: true,
    expect: (r) => (r.dashboard?.definitions.length === 5 ? [] : [`defs=${r.dashboard?.definitions.length ?? 'null'}`]),
  },
  {
    file: path.join(REAL, 'MATRIZ DE INDICADORES PALESTRA (1).xlsx'),
    optional: true,
    expect: (r) => (r.dashboard?.definitions.length === 5 ? [] : [`defs=${r.dashboard?.definitions.length ?? 'null'}`]),
  },
  {
    file: path.join(REAL, '5S PALESTRA COUTURE.xlsx'),
    optional: true,
    expect: (r) => (r.dashboard === null ? [] : ['un archivo de auditoría no debe parsear como matriz']),
  },
  {
    file: path.join(REAL, 'Formato auditoria 5´Ss MMH (1).xlsx'),
    optional: true,
    expect: (r) => (r.dashboard === null ? [] : ['el formato MMH no debe parsear como matriz']),
  },
]

let pass = 0
let fail = 0
let skip = 0

for (const c of cases) {
  const name = path.basename(c.file)
  if (!fs.existsSync(c.file)) {
    if (c.optional) {
      skip++
      console.log(`SKIP  ${name} (no está en esta máquina)`)
      continue
    }
    fail++
    console.log(`FAIL  ${name}: fixture no encontrado`)
    continue
  }
  try {
    const buf = fs.readFileSync(c.file)
    const r = parseMatrixWorkbook(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), name)
    const errs = c.expect(r)
    if (errs.length === 0) {
      pass++
      console.log(`PASS  ${name}`)
    } else {
      fail++
      console.log(`FAIL  ${name}`)
      errs.forEach((e) => console.log(`      - ${e}`))
    }
  } catch (e) {
    fail++
    console.log(`CRASH ${name}: ${(e as Error).message}`)
  }
}

console.log(`\n${pass} PASS / ${fail} FAIL / ${skip} SKIP  (${cases.length} casos)`)
process.exit(fail ? 1 : 0)
