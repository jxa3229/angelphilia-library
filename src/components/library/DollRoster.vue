<template>
  <details class="doll-roster">
    <summary class="roster-heading">{{ labels.title }}<span>{{ labels.byBrand }}</span></summary>
    <div class="roster-content">
      <p class="roster-intro">{{ labels.intro }}</p>
      <details v-for="group in groups" :key="group.id" class="roster-group" :data-brand="group.id">
        <summary class="roster-group-heading">
          <span><small>{{ group.company }}</small>{{ group.brand }}{{ group.kind === 'collab' ? ` · ${labels.collab}` : '' }}</span>
          <span class="roster-count">{{ group.entries.length }}</span>
        </summary>
        <ul class="roster-entries">
          <li v-for="entry in group.entries" :key="entry.id" :data-entry="entry.id">
            <span class="roster-number">{{ entry.number === null ? '—' : `#${String(entry.number).padStart(2, '0')}` }}</span>
            <div class="roster-entry-body">
              <button v-if="entry.records.length === 1" class="roster-link" @click="$emit('open', entry.records[0])">{{ entryName(entry) }}</button>
              <details v-else-if="entry.records.length > 1" class="roster-versions">
                <summary class="roster-link">{{ entryName(entry) }}<small>{{ labels.versions.replace('{count}', entry.records.length) }}</small></summary>
                <ul>
                  <li v-for="record in entry.records" :key="record.folder">
                    <button class="roster-link roster-version-link" @click="$emit('open', record)">
                      <span>{{ recordYear(record) }}</span>{{ displayName(record) }}
                    </button>
                  </li>
                </ul>
              </details>
              <template v-else>
                <span>{{ entryName(entry) }}</span>
                <small v-if="entry.aliases.length" class="roster-unavailable">{{ labels.unavailable }}</small>
              </template>
            </div>
          </li>
        </ul>
      </details>
    </div>
  </details>
</template>

<script setup>
import { computed } from 'vue'
import { usePreferencesStore } from '../../stores/preferences'
import { dollRosterGroups } from '../../data/dollRoster'
import { resolveDollRoster } from '../../utils/dollRoster'
import { localizeLimitedRecord } from '../../i18n/limited'

const props = defineProps({ records: { type: Array, required: true } })
defineEmits(['open'])
const preferences = usePreferencesStore()
const copy = {
  zh: {
    title: '编号与角色名录', byBrand: '按公司 / 品牌浏览', collab: '角色联动 · 无编号',
    intro: '展开品牌查看编号与名称；有馆藏的名称可打开详情，同名多版本可展开选择。',
    versions: '{count} 个馆藏版本', unavailable: '暂无匹配馆藏', noName: '名称待补充', unknown: '未明'
  },
  en: {
    title: 'Doll number & name directory', byBrand: 'Browse by company / brand', collab: 'Character collaborations · unnumbered',
    intro: 'Expand a brand to browse numbers and names. Linked names open collection details; expand a name to choose a version.',
    versions: '{count} collection versions', unavailable: 'No matching record', noName: 'Name not documented', unknown: 'Unknown'
  },
  ja: {
    title: '品番・キャラクター名一覧', byBrand: 'メーカー / ブランド別', collab: 'キャラクターコラボ · 品番なし',
    intro: 'ブランドを開くと品番と名前を確認できます。リンクから収蔵資料を表示し、複数のバージョンがある場合は選択できます。',
    versions: '収蔵資料 {count} 件', unavailable: '該当する収蔵資料なし', noName: '名称未確認', unknown: '不明'
  }
}
const labels = computed(() => copy[preferences.lang] || copy.zh)
const groups = computed(() => resolveDollRoster(dollRosterGroups, props.records))

function entryName(entry) {
  const name = entry.names[preferences.lang] || entry.names.en || entry.names.ja
  if (!name) return labels.value.noName
  return preferences.lang === 'zh' && entry.names.en && name !== entry.names.en
    ? `${name} · ${entry.names.en}` : name
}

function displayName(record) {
  return localizeLimitedRecord(record, preferences.lang).name
}

function recordYear(record) {
  return /^\d{4}$/.test(record.year) ? record.year : labels.value.unknown
}
</script>

<style scoped>
.doll-roster { margin-bottom: 24px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); color: var(--ink); }
summary { cursor: pointer; }
.roster-heading { min-height: 52px; padding: 16px 20px; font-weight: 700; line-height: 1.6; }
.roster-heading > span { margin-left: 16px; color: var(--muted); font-size: 12px; font-weight: 400; }
.roster-content { padding: 0 20px 16px; }
.roster-intro { margin: 0 0 16px; color: var(--muted); font-size: 13px; line-height: 1.8; }
.roster-group { border-top: 1px solid var(--line); }
.roster-group-heading { display: flex; align-items: center; gap: 12px; min-height: 64px; padding: 12px 0; font-weight: 600; }
.roster-group-heading::before { content: '+'; color: var(--primary); font-size: 20px; }
.roster-group[open] > .roster-group-heading::before { content: '−'; }
.roster-group-heading small { display: block; color: var(--muted); font-size: 11px; font-weight: 400; margin-bottom: 4px; }
.roster-count { margin-left: auto; color: var(--muted); font-size: 12px; }
.roster-entries { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0 24px; padding: 0; margin: 0 0 16px; list-style: none; }
.roster-entries > li { display: flex; align-items: baseline; gap: 12px; min-width: 0; padding: 10px 0; border-top: 1px solid var(--line); line-height: 1.7; }
.roster-number { flex: 0 0 34px; font-size: 12px; color: var(--muted); font-variant-numeric: tabular-nums; }
.roster-entry-body { min-width: 0; overflow-wrap: anywhere; font-size: 14px; }
.roster-link { padding: 0; border: 0; background: transparent; color: var(--primary); text-align: left; font: inherit; line-height: 1.8; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
button.roster-link { min-height: 44px; }
.roster-link:hover { color: var(--accent); }
.roster-versions > summary { min-height: 44px; }
.roster-versions small, .roster-unavailable { display: block; color: var(--muted); font-size: 11px; text-decoration: none; }
.roster-versions ul { padding: 8px 0 0; margin: 0; list-style: none; }
.roster-versions li + li { margin-top: 8px; }
.roster-version-link { font-size: 12px; }
.roster-version-link > span { margin-right: 8px; color: var(--muted); }
summary:focus-visible, button:focus-visible { outline: 2px solid var(--primary); outline-offset: 3px; }
@media (max-width: 1100px) { .roster-entries { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 640px) {
  .roster-entries { grid-template-columns: minmax(0, 1fr); }
  .roster-heading { padding: 14px 16px; }
  .roster-heading > span { display: block; margin: 4px 0 0 16px; }
  .roster-content { padding: 0 16px 12px; }
}
</style>
