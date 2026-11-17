import { createRouter, createWebHashHistory } from 'vue-router'

const OverviewPage = () => import('../pages/OverviewPage.vue')
const LibraryPage = () => import('../pages/LibraryPage.vue')
const IndexPage = () => import('../pages/IndexPage.vue')
const RepositoryPage = () => import('../pages/RepositoryPage.vue')
const BodyBuilderPage = () => import('../pages/BodyBuilderPage.vue')
const OutfitsPage = () => import('../pages/OutfitsPage.vue')
const GlossaryPage = () => import('../pages/GlossaryPage.vue')
const LimitedPage = () => import('../pages/LimitedPage.vue')
const ImagePage = () => import('../pages/ImagePage.vue')

export const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: { name: 'overview' } },
    { path: '/overview', name: 'overview', component: OverviewPage },
    { path: '/library', name: 'library', component: LibraryPage },
    { path: '/limited', name: 'limited', component: LimitedPage },
    { path: '/body-builder', name: 'body-builder', component: BodyBuilderPage },
    { path: '/outfits', name: 'outfits', component: OutfitsPage },
    { path: '/index', name: 'index', component: IndexPage },
    { path: '/glossary', name: 'glossary', component: GlossaryPage },
    { path: '/repository', name: 'repository', component: RepositoryPage },
    { path: '/image/:id', name: 'image', component: ImagePage },
    { path: '/:pathMatch(.*)*', redirect: { name: 'overview' } }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})
