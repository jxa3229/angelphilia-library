<template>
  <article class="purchase-link-card">
    <div class="purchase-link-card-head"><div><span>{{ category }}</span><h3>{{ shop.name }}</h3></div></div>
    <p>{{ shop.notes }}</p>
    <div class="purchase-card-footer">
      <small>{{ shop.region }} · {{ platform }} · {{ confidence }}</small>
      <a :href="shop.url" target="_blank" rel="noreferrer noopener">打开网站</a>
    </div>
  </article>
</template>

<script setup>
defineProps({
  shop: { type: Object, required: true }, category: { type: String, default: '' },
  platform: { type: String, default: '' }, confidence: { type: String, default: '' }
})
</script>
