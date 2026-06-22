import { createRouter, createWebHashHistory } from 'vue-router'

const OverviewPage = () => import('../pages/OverviewPage.vue')
const LibraryPage = () => import('../pages/LibraryPage.vue')
const IndexPage = () => import('../pages/IndexPage.vue')
const RepositoryPage = () => import('../pages/RepositoryPage.vue')
const BodyBuilderPage = () => import('../pages/BodyBuilderPage.vue')

export const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: { name: 'overview' } },
    { path: '/overview', name: 'overview', component: OverviewPage },
    { path: '/library', name: 'library', component: LibraryPage },
    { path: '/body-builder', name: 'body-builder', component: BodyBuilderPage },
    { path: '/index', name: 'index', component: IndexPage },
    { path: '/repository', name: 'repository', component: RepositoryPage },
    { path: '/:pathMatch(.*)*', redirect: { name: 'overview' } }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})
