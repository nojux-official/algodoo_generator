/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'vue-star-rating' {
  import { DefineComponent } from 'vue'
  const StarRating: DefineComponent<any, any, any>
  export { StarRating }
}