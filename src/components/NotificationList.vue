<script setup lang="ts">
import { useNotificationStore } from '@/stores/notification'
import { computed } from 'vue'

const notificationStore = useNotificationStore()
const notifications = computed(() => notificationStore.notifications)

const removeNotification = (id: number) => {
  notificationStore.deleteItem(id)
}
</script>

<template>
  <div class="notification-container">
    <div v-for="notif in notifications" :key="notif.id" :class="['notification', `notification-${notif.type}`]">
      <span>{{ notif.message }}</span>
      <button @click="removeNotification(notif.id)" class="close-btn">&times;</button>
    </div>
  </div>
</template>

<style scoped>
.notification-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notification {
  padding: 12px 16px;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification-error {
  background-color: #fee;
  color: #c33;
  border-left: 4px solid #c33;
}

.notification-warning {
  background-color: #ffeaa7;
  color: #d63031;
  border-left: 4px solid #fdcb6e;
}

.notification-success {
  background-color: #d4edda;
  color: #155724;
  border-left: 4px solid #28a745;
}

.notification-info {
  background-color: #d1ecf1;
  color: #0c5460;
  border-left: 4px solid #17a2b8;
}

.close-btn {
  background: none;
  border: none;
  color: inherit;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  margin-left: 10px;
}

.close-btn:hover {
  opacity: 0.7;
}
</style>
