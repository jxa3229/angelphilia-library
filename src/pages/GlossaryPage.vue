<template>
  <article class="glossary-page" lang="zh-CN" aria-labelledby="glossary-title">
    <header class="glossary-header">
      <p class="glossary-eyebrow">LIBRARY GUIDE · 品牌档案</p>
      <h1 id="glossary-title">品牌与运营术语</h1>
      <p class="glossary-intro">从 VMF50 到 Angel Philia，读懂品牌、企划方与素体技术之间的关系。</p>
    </header>

    <nav class="glossary-sections" aria-label="本页章节">
      <button v-for="section in sections" :key="section.id" type="button" @click="goToSection(section.id)">
        {{ section.label }}
      </button>
    </nav>

    <section id="glossary-brands" class="glossary-section" aria-labelledby="brands-title">
      <h2 id="brands-title"><span>01</span> 名称释义</h2>
      <div class="glossary-brand-grid">
        <section v-for="brand in brandGlossary.brands" :key="brand.name" class="glossary-brand">
          <span class="glossary-kind">{{ brand.kind }}</span>
          <h3>{{ brand.name }}</h3>
          <p class="glossary-subtitle">{{ brand.subtitle }}</p>
          <p>{{ brand.text }}</p>
          <p class="glossary-detail">{{ brand.detail }}</p>
          <div class="glossary-citations" aria-label="相关资料">
            <a v-for="id in brand.sources" :key="id" :href="sourceById[id].url" target="_blank" rel="noopener noreferrer">
              {{ sourceById[id].label }} ↗
            </a>
          </div>
        </section>
      </div>
    </section>

    <section id="glossary-relations" class="glossary-section" aria-labelledby="relations-title">
      <h2 id="relations-title"><span>02</span> 品牌关系速读</h2>
      <p class="glossary-caption">按厂商、品牌、企划与技术层次阅读，合作关系不直接代表公司股权关系。</p>
      <dl class="glossary-relations">
        <div v-for="relation in brandGlossary.relations" :key="relation.from">
          <dt>{{ relation.from }}</dt>
          <dd><span>{{ relation.link }} →</span><strong>{{ relation.to }}</strong></dd>
        </div>
      </dl>
    </section>

    <section id="glossary-history" class="glossary-section" aria-labelledby="history-title">
      <h2 id="history-title"><span>03</span> 历史沿革</h2>
      <ol class="glossary-timeline">
        <li v-for="event in brandGlossary.timeline" :key="event.period">
          <span class="glossary-period">{{ event.period }}</span>
          <div>
            <h3>{{ event.title }}</h3><p>{{ event.text }}</p>
            <div class="glossary-citations" aria-label="历史参考资料">
              <a v-for="id in event.sources" :key="id" :href="sourceById[id].url" target="_blank" rel="noopener noreferrer">
                {{ sourceById[id].label }} ↗
              </a>
            </div>
          </div>
        </li>
      </ol>
    </section>

    <section id="glossary-terms" class="glossary-section" aria-labelledby="terms-title">
      <h2 id="terms-title"><span>04</span> 技术与销售术语</h2>
      <dl class="glossary-terms">
        <div v-for="term in brandGlossary.terms" :key="term.name">
          <dt>{{ term.name }}</dt><dd>{{ term.text }}</dd>
        </div>
      </dl>
    </section>

    <section id="glossary-operations" class="glossary-section" aria-labelledby="operations-title">
      <h2 id="operations-title"><span>05</span> 运营方式</h2>
      <section v-for="operation in brandGlossary.operations" :key="operation.name" class="glossary-operation">
        <h3>{{ operation.name }}</h3><p>{{ operation.text }}</p>
        <div class="glossary-citations">
          <a v-for="id in operation.sources" :key="id" :href="sourceById[id].url" target="_blank" rel="noopener noreferrer">
            {{ sourceById[id].label }} ↗
          </a>
        </div>
      </section>
    </section>

    <section id="glossary-sources" class="glossary-section" aria-labelledby="sources-title">
      <h2 id="sources-title"><span>06</span> 参考来源</h2>
      <ul class="glossary-sources">
        <li v-for="source in glossarySources" :key="source.id">
          <span>{{ source.type }}</span>
          <a :href="source.url" target="_blank" rel="noopener noreferrer">{{ source.label }} ↗</a>
        </li>
      </ul>
    </section>
  </article>
</template>

<script setup>
import { brandGlossary, glossarySources } from '../data/brandGlossary'

defineProps({ mainPanel: { type: Object, default: null } })

const sourceById = Object.fromEntries(glossarySources.map((source) => [source.id, source]))
const sections = [
  { id: 'glossary-brands', label: '名称释义' },
  { id: 'glossary-relations', label: '品牌关系' },
  { id: 'glossary-history', label: '历史沿革' },
  { id: 'glossary-terms', label: '常用术语' },
  { id: 'glossary-operations', label: '运营方式' },
  { id: 'glossary-sources', label: '参考来源' }
]

function goToSection(id) {
  document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'instant' })
}
</script>

<style scoped>
.glossary-page { max-width: 1120px; margin: 0 auto; overflow-wrap: anywhere; }
.glossary-header { padding: clamp(24px, 4vw, 46px); border: 1px solid var(--line); border-top: 4px solid var(--primary); border-radius: 8px; background: var(--surface); }
.glossary-eyebrow { margin: 0 0 16px; color: var(--primary); font-size: 12px; font-weight: 800; letter-spacing: .08em; }
h1 { margin: 0 0 16px; font-family: Georgia, "Noto Serif SC", serif; font-size: clamp(30px, 4vw, 44px); line-height: 1.2; }
.glossary-intro { margin: 0 0 12px; max-width: 720px; font-size: 17px; line-height: 1.8; }
.glossary-caption { margin: 0; color: var(--muted); font-size: 13px; line-height: 1.8; }
.glossary-sections { display: flex; flex-wrap: wrap; gap: 8px; margin: 20px 0 32px; }
.glossary-sections button { min-height: 44px; padding: 10px 16px; border: 1px solid var(--line); border-radius: 6px; background: var(--surface); color: var(--ink); cursor: pointer; }
.glossary-sections button:hover { background: var(--primary-soft); border-color: var(--primary); }
.glossary-sections button:focus-visible, a:focus-visible { outline: 2px solid var(--primary); outline-offset: 4px; }
.glossary-section { margin-top: 36px; scroll-margin-top: 24px; }
h2 { display: flex; align-items: baseline; gap: 12px; margin: 0 0 18px; font-size: 22px; }
h2 > span { color: var(--gold); font-family: Georgia, serif; font-size: 16px; }
h3 { margin: 0 0 10px; font-size: 19px; }
p { line-height: 1.85; }
.glossary-brand-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.glossary-brand { min-width: 0; padding: 24px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); }
.glossary-kind { display: inline-block; margin-bottom: 14px; padding: 4px 8px; border-radius: 4px; background: var(--primary-soft); color: var(--primary); font-size: 12px; font-weight: 700; }
.glossary-brand h3 { margin-bottom: 5px; font-family: Georgia, "Noto Serif SC", serif; font-size: 25px; }
.glossary-subtitle { margin: 0 0 18px; color: var(--muted); font-size: 12px; }
.glossary-detail { color: var(--muted); font-size: 14px; }
.glossary-citations { display: flex; flex-wrap: wrap; gap: 8px 16px; padding-top: 10px; font-size: 12px; line-height: 1.8; }
.glossary-relations { margin: 16px 0 0; padding: 0 24px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); }
.glossary-relations > div { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.5fr); gap: 12px; padding: 20px 0; border-bottom: 1px solid var(--line); }
.glossary-relations > div:last-child { border-bottom: 0; }
dt { font-weight: 700; }
dd { margin: 0; line-height: 1.8; }
.glossary-relations dd { display: flex; flex-wrap: wrap; gap: 8px 16px; }
.glossary-relations dd > span { color: var(--muted); font-size: 13px; }
.glossary-timeline { display: grid; gap: 24px; margin: 0; padding: 8px 0 8px 20px; border-left: 2px solid var(--line); list-style: none; }
.glossary-timeline li { display: grid; grid-template-columns: 160px minmax(0, 1fr); gap: 20px; }
.glossary-period { color: var(--primary); font-weight: 800; }
.glossary-timeline p { margin: 0; color: var(--muted); }
.glossary-terms { margin: 0; border-top: 1px solid var(--line); }
.glossary-terms > div { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); gap: 24px; padding: 20px 0; border-bottom: 1px solid var(--line); }
.glossary-terms dd { color: var(--muted); }
.glossary-operation { padding: 24px; margin-bottom: 14px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); }
.glossary-operation p { margin: 0; }
.glossary-sources { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 28px; margin: 16px 0 0; padding: 0; list-style: none; }
.glossary-sources li { display: flex; align-items: baseline; gap: 12px; padding: 14px 0; border-top: 1px solid var(--line); }
.glossary-sources li > span { flex: 0 0 64px; color: var(--muted); font-size: 12px; }
.glossary-sources a { font-size: 14px; line-height: 1.7; }
@media (max-width: 720px) {
  .glossary-brand-grid, .glossary-sources { grid-template-columns: minmax(0, 1fr); }
  .glossary-relations > div, .glossary-terms > div, .glossary-timeline li { grid-template-columns: minmax(0, 1fr); gap: 8px; }
  .glossary-brand, .glossary-operation { padding: 20px; }
  .glossary-sections { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .glossary-sections button { padding: 10px 6px; }
}
</style>
