import { createRouter, createWebHashHistory } from 'vue-router'
import { ref } from 'vue'
import { loadCatalogRecords } from '../utils/catalogData'

export const navigationLoading = ref(false)
export const navigationFailure = ref('')
let pendingPath = ''
const withCatalog = (page) => async () => {
  const [component] = await Promise.all([page(), loadCatalogRecords()])
  return component
}

const OverviewPage = () => import('../pages/OverviewPage.vue')
const LibraryPage = () => import('../pages/LibraryPage.vue')
const IndexPage = () => import('../pages/IndexPage.vue')
const RepositoryPage = () => import('../pages/RepositoryPage.vue')
const BodyBuilderPage = () => import('../pages/BodyBuilderPage.vue')
const OutfitsPage = () => import('../pages/OutfitsPage.vue')
const GlossaryPage = () => import('../pages/GlossaryPage.vue')
const LimitedPage = () => import('../pages/LimitedPage.vue')
const OfficialFaceupsPage = () => import('../pages/OfficialFaceupsPage.vue')
const ImagePage = () => import('../pages/ImagePage.vue')

export const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: { name: 'overview' } },
    { path: '/overview', name: 'overview', component: OverviewPage },
    { path: '/library', name: 'library', component: withCatalog(LibraryPage) },
    { path: '/limited', name: 'limited', component: withCatalog(LimitedPage) },
    { path: '/official-faceups', name: 'official-faceups', component: OfficialFaceupsPage },
    { path: '/body-builder', name: 'body-builder', component: BodyBuilderPage },
    { path: '/outfits', name: 'outfits', component: OutfitsPage },
    { path: '/index', name: 'index', component: withCatalog(IndexPage) },
    { path: '/glossary', name: 'glossary', component: GlossaryPage },
    { path: '/repository', name: 'repository', component: RepositoryPage },
    { path: '/image/:id', name: 'image', component: ImagePage },
    { path: '/:pathMatch(.*)*', redirect: { name: 'overview' } }
  ],
  scrollBehavior(to, from) {
    return to.name === from.name ? false : { top: 0 }
  }
})

router.beforeEach((to) => {
  pendingPath = to.fullPath
  navigationFailure.value = ''
  navigationLoading.value = true
})
router.afterEach(() => { navigationLoading.value = false })
router.onError(() => {
  navigationLoading.value = false
  navigationFailure.value = pendingPath
})

export function retryNavigation() {
  // 刷新能够恢复失败的动态 import（浏览器可能缓存失败模块），URL 保留原目标。
  window.location.hash = `#${navigationFailure.value}`
  window.location.reload()
}
