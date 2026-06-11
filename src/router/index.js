import { createRouter, createWebHashHistory } from 'vue-router'
import OverviewPage from '../pages/OverviewPage.vue'
import LibraryPage from '../pages/LibraryPage.vue'
import IndexPage from '../pages/IndexPage.vue'
import RepositoryPage from '../pages/RepositoryPage.vue'

export const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: { name: 'overview' } },
    { path: '/overview', name: 'overview', component: OverviewPage },
    { path: '/library', name: 'library', component: LibraryPage },
    { path: '/index', name: 'index', component: IndexPage },
    { path: '/repository', name: 'repository', component: RepositoryPage },
    { path: '/:pathMatch(.*)*', redirect: { name: 'overview' } }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})
