<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBackupStore } from '@/stores/backup'
import { useEquationStore } from '@/stores/equation'
import { useNotificationStore } from '@/stores/notification'

const backupStore = useBackupStore()
const equationStore = useEquationStore()
const notificationStore = useNotificationStore()

const isOpen = ref(false)
const expandedBackupId = ref<string | null>(null)

const visibleBackups = computed(() => backupStore.backups.slice(0, 10))

const toggleBackupHistory = () => {
  isOpen.value = !isOpen.value
}

const toggleBackupDetails = (backupId: string) => {
  expandedBackupId.value = expandedBackupId.value === backupId ? null : backupId
}

const restoreBackup = (backupId: string) => {
  if (confirm('Restore this backup? Current content will be saved first.')) {
    equationStore.restoreFromBackup(backupId)
    notificationStore.createNewItem({
      id: -1,
      message: 'Backup restored successfully',
      type: 'success'
    })
    isOpen.value = false
  }
}

const deleteBackup = (backupId: string) => {
  if (confirm('Delete this backup permanently?')) {
    backupStore.deleteBackup(backupId)
    expandedBackupId.value = null
    notificationStore.createNewItem({
      id: -1,
      message: 'Backup deleted',
      type: 'info'
    })
  }
}

const clearAllBackups = () => {
  if (confirm('Delete all backups? This cannot be undone.')) {
    backupStore.clearAllBackups()
    expandedBackupId.value = null
    isOpen.value = false
    notificationStore.createNewItem({
      id: -1,
      message: 'All backups cleared',
      type: 'warning'
    })
  }
}
</script>

<template>
  <div class="backup-container">
    <button @click="toggleBackupHistory" class="backup-toggle">
      📋 {{ backupStore.backupCount }} backups
    </button>

    <div v-if="isOpen" class="backup-panel">
      <div class="backup-header">
        <h3>Backup History</h3>
        <button @click="toggleBackupHistory" class="close-btn">&times;</button>
      </div>

      <div class="backup-list">
        <div v-if="backupStore.backups.length === 0" class="no-backups">
          No backups yet. They will be created automatically every 2 minutes and on key actions.
        </div>

        <div v-for="backup in visibleBackups" :key="backup.id" class="backup-item">
          <div class="backup-header-item" @click="toggleBackupDetails(backup.id)">
            <span class="backup-label">{{ backup.label }}</span>
            <span class="backup-time">{{ backupStore.formatTime(backup.timestamp) }}</span>
            <span class="expand-icon">{{ expandedBackupId === backup.id ? '▼' : '▶' }}</span>
          </div>

          <div v-if="expandedBackupId === backup.id" class="backup-details">
            <div class="backup-preview">
              <p class="preview-label">Preview (first 200 chars):</p>
              <pre class="preview-text">{{ backup.content.substring(0, 200) }}...</pre>
            </div>

            <div class="backup-actions">
              <button @click="restoreBackup(backup.id)" class="btn-restore">Restore</button>
              <button @click="deleteBackup(backup.id)" class="btn-delete">Delete</button>
            </div>
          </div>
        </div>
      </div>

      <div class="backup-footer">
        <div class="backup-info">
          Keeping last {{ backupStore.backups.length }} of 30 backups
        </div>
        <button
          v-if="backupStore.backups.length > 0"
          @click="clearAllBackups"
          class="btn-clear-all"
        >
          Clear All
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.backup-container {
  position: relative;
}

.backup-toggle {
  padding: 6px 12px;
  background-color: #17a2b8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.backup-toggle:hover {
  background-color: #138496;
}

.backup-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  width: 90%;
  max-width: 500px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.backup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.backup-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.close-btn:hover {
  color: #333;
}

.backup-list {
  flex: 1;
  overflow-y: auto;
}

.no-backups {
  padding: 16px;
  text-align: center;
  color: #999;
  font-size: 12px;
}

.backup-item {
  border-bottom: 1px solid #f0f0f0;
}

.backup-header-item {
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9f9f9;
  transition: background-color 0.2s;
}

.backup-header-item:hover {
  background-color: #f0f0f0;
}

.backup-label {
  font-weight: 500;
  color: #333;
  flex: 1;
}

.backup-time {
  font-size: 11px;
  color: #999;
  margin: 0 12px;
}

.expand-icon {
  font-size: 10px;
  color: #666;
}

.backup-details {
  padding: 12px 16px;
  background-color: #fafafa;
}

.preview-label {
  margin: 0 0 8px 0;
  font-size: 11px;
  font-weight: 500;
  color: #666;
}

.preview-text {
  margin: 0;
  padding: 8px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 10px;
  line-height: 1.4;
  color: #333;
  overflow-x: auto;
  max-height: 100px;
}

.backup-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.btn-restore,
.btn-delete {
  flex: 1;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-restore {
  background-color: #28a745;
  color: white;
}

.btn-restore:hover {
  background-color: #218838;
}

.btn-delete {
  background-color: #dc3545;
  color: white;
}

.btn-delete:hover {
  background-color: #c82333;
}

.backup-footer {
  padding: 12px 16px;
  border-top: 1px solid #eee;
  background-color: #f9f9f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.backup-info {
  font-size: 11px;
  color: #666;
}

.btn-clear-all {
  padding: 6px 12px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
}

.btn-clear-all:hover {
  background-color: #5a6268;
}
</style>
