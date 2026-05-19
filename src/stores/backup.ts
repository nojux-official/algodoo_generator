import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Backup {
  id: string
  timestamp: number
  content: string
  label: string
}

const STORAGE_KEY = 'algodoo_backups'
const MAX_BACKUPS = 30
const AUTO_BACKUP_INTERVAL = 2 * 60 * 1000 // 2 minutes

export const useBackupStore = defineStore('backup', () => {
  const backups = ref<Backup[]>([])
  let autoBackupTimer: ReturnType<typeof setInterval> | null = null

  // Load backups from localStorage
  const loadBackups = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        backups.value = JSON.parse(stored)
        // Sort by timestamp, newest first
        backups.value.sort((a, b) => b.timestamp - a.timestamp)
      }
    } catch (error) {
      console.error('Failed to load backups:', error)
      backups.value = []
    }
  }

  // Save backups to localStorage
  const saveBackups = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(backups.value))
    } catch (error) {
      console.error('Failed to save backups:', error)
    }
  }

  // Create a new backup
  const createBackup = (content: string, label: string = ''): Backup => {
    const backup: Backup = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      content,
      label: label || new Date().toLocaleString()
    }

    backups.value.unshift(backup) // Add to beginning

    // Keep only last MAX_BACKUPS
    if (backups.value.length > MAX_BACKUPS) {
      backups.value = backups.value.slice(0, MAX_BACKUPS)
    }

    saveBackups()
    return backup
  }

  // Create automatic backup (silently)
  const createAutoBackup = (content: string) => {
    const now = new Date()
    const label = `Auto-backup ${now.toLocaleTimeString()}`
    return createBackup(content, label)
  }

  // Restore a backup
  const restoreBackup = (backupId: string): Backup | null => {
    const backup = backups.value.find(b => b.id === backupId)
    if (backup) {
      // Move restored backup to top with new timestamp
      backups.value = backups.value.filter(b => b.id !== backupId)
      const restoredBackup: Backup = {
        ...backup,
        id: Date.now().toString(),
        timestamp: Date.now(),
        label: `Restored: ${backup.label}`
      }
      backups.value.unshift(restoredBackup)
      saveBackups()
      return restoredBackup
    }
    return null
  }

  // Delete a specific backup
  const deleteBackup = (backupId: string) => {
    backups.value = backups.value.filter(b => b.id !== backupId)
    saveBackups()
  }

  // Clear all backups
  const clearAllBackups = () => {
    backups.value = []
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear backups:', error)
    }
  }

  // Get formatted date/time for display
  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString()
  }

  // Start auto-backup interval
  const startAutoBackup = (getContentFn: () => string) => {
    if (autoBackupTimer) clearInterval(autoBackupTimer)

    autoBackupTimer = setInterval(() => {
      try {
        createAutoBackup(getContentFn())
      } catch (error) {
        console.error('Auto-backup failed:', error)
      }
    }, AUTO_BACKUP_INTERVAL)
  }

  // Stop auto-backup interval
  const stopAutoBackup = () => {
    if (autoBackupTimer) {
      clearInterval(autoBackupTimer)
      autoBackupTimer = null
    }
  }

  // Get backup count
  const backupCount = computed(() => backups.value.length)

  // Load backups on initialization
  loadBackups()

  return {
    backups,
    backupCount,
    createBackup,
    createAutoBackup,
    restoreBackup,
    deleteBackup,
    clearAllBackups,
    formatTime,
    startAutoBackup,
    stopAutoBackup,
    loadBackups
  }
})
