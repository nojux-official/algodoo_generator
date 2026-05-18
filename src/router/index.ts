import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Editor from '@/views/Editor.vue'
import PageNotFound from '@/views/404.vue'

const routes: RouteRecordRaw[] = [
  {
    name: 'Editor',
    path: '/',
    component: Editor
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: PageNotFound
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
