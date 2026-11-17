import { shallowRef } from 'vue'

export const catalogRecords = shallowRef([])
let pending

export function loadCatalogRecords() {
  if (catalogRecords.value.length) return Promise.resolve(catalogRecords.value)
  if (!pending) {
    pending = Promise.all([
      import('../data/records.json'),
      import('../data/realartArchive.json'),
      import('../data/limitedOfficial.json'),
      import('./recordNames.js')
    ]).then(([records, archive, limited, { normalizeRecordName }]) => {
      catalogRecords.value = [...records.default, ...archive.default, ...limited.default].map(normalizeRecordName)
      return catalogRecords.value
    }).finally(() => { pending = null })
  }
  return pending
}
