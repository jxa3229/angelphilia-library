import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const bodyParts = readJson('src/data/bodyParts.json')
const headParts = readJson('src/data/headParts.json')
const sources = readJson('src/data/partSources.json')
const errors = []
const allowedLevels = new Set(['A', 'B', 'C', 'D', 'E'])
const forbiddenSourceText = /(https?:\/\/|quarantotto|jiwu|小红书|FaithZ|Parabox|论坛)/i

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'))
}

function fail(message) {
  errors.push(message)
}

function ensureUnique(items, label, getId = (item) => item.id) {
  const seen = new Set()
  items.forEach((item) => {
    const id = getId(item)
    if (!id) fail(`${label} missing id`)
    if (seen.has(id)) fail(`${label} duplicate id: ${id}`)
    seen.add(id)
  })
}

ensureUnique(bodyParts.parts, 'part')
ensureUnique(headParts, 'head')
ensureUnique(sources, 'source', (source) => source.sourceId || source.id)

const sourceIds = new Set(sources.map((source) => source.sourceId || source.id))
sources.forEach((source) => {
  const sourceId = source.sourceId || source.id
  if (!source.sourceId) fail(`source ${sourceId} must use sourceId`)
  if (source.id) fail(`source ${sourceId} must not use id`)
  if (source.label !== '网络数据') fail(`source ${sourceId} label must be 网络数据`)
  if (!allowedLevels.has(source.level)) fail(`source ${sourceId} has invalid level`)
  if (forbiddenSourceText.test(JSON.stringify(source))) fail(`source ${sourceId} contains specific source text`)
})

const partIds = new Set(bodyParts.parts.map((part) => part.id))
Object.entries(bodyParts.defaults).forEach(([key, value]) => {
  if (key === 'initialSelection') return
  if (value && !partIds.has(value)) fail(`defaults.${key} missing part reference: ${value}`)
})

const initial = bodyParts.defaults.initialSelection
if (bodyParts.bodyCodes.defaultCode !== 'GHH') fail('bodyCodes.defaultCode must be GHH')
if (!initial.upperTorso?.includes('g')) fail('initial upperTorso must be G')
if (!initial.lowerTorso?.includes('h')) fail('initial lowerTorso must be H')
if (!initial.thigh?.includes('h')) fail('initial thigh must be H')
if (initial.head !== null) fail('initial head must be null')
if (initial.includeHeadMeasurements !== false) fail('initial includeHeadMeasurements must be false')

Object.entries(initial).forEach(([key, value]) => {
  if (key === 'head' || key === 'includeHeadMeasurements') return
  if (!partIds.has(value)) fail(`initialSelection.${key} missing part reference: ${value}`)
})

bodyParts.presets.forEach((preset) => {
  Object.entries(preset.parts || {}).forEach(([slot, partId]) => {
    if (!partIds.has(partId)) fail(`preset ${preset.id} ${slot} missing part reference: ${partId}`)
  })
})

bodyParts.parts.forEach((part) => validateMeasurements(part.measurements || {}, `part ${part.id}`))
headParts.forEach((head) => {
  validateMeasurements(head.measurements || {}, `head ${head.id}`)
  ;(head.eyeSizeOptions || []).forEach((eye) => {
    if (!eye.raw || !sourceIds.has(eye.sourceId)) fail(`head ${head.id} eye option missing valid source`)
    if (typeof eye.outerDiameterMm !== 'number' || typeof eye.irisDiameterMm !== 'number') {
      fail(`head ${head.id} eye option ${eye.raw} has invalid numeric fields`)
    }
  })
})

const pHead = headParts.find((head) => head.type === 'P')
if (!pHead) fail('P head is missing')
if (pHead && pHead.eyeSizeOptions?.length > 0) fail('P head eyeSizeOptions must stay empty')
if (pHead && pHead.eyeSizeStatus !== 'pending') fail('P head eyeSizeStatus must be pending')

function validateMeasurements(measurements, owner) {
  Object.entries(measurements).forEach(([key, measurement]) => {
    if (typeof measurement.value !== 'number') fail(`${owner}.${key} value must be number`)
    if (measurement.unit !== 'cm') fail(`${owner}.${key} unit must be cm`)
    if (!sourceIds.has(measurement.sourceId)) fail(`${owner}.${key} missing valid sourceId`)
  })
}

if (forbiddenSourceText.test(JSON.stringify(bodyParts)) || forbiddenSourceText.test(JSON.stringify(headParts))) {
  fail('data files contain specific source text')
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join('\n'))
  process.exit(1)
}

console.log('body parts validation passed')
