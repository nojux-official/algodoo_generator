<script setup lang="ts">
import NotificationList from './components/NotificationList.vue'
</script>

<template>
  <div id="app" class="app-container">
    <RouterView />
    <NotificationList />
  </div>
</template>

<style scoped>
#app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>
