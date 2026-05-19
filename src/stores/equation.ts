import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useBackupStore } from './backup'

const STORAGE_KEY = 'algodoo_equation_config'

export const EQUATION_EXAMPLES = {
  orbital_ring: {
    name: 'Orbital Ring',
    yaml: `circles:
  - name: "orbital_ring"
    centerX: 0
    centerY: 0
    count: 12
    equations:
      angle: "i * (2 * PI / count)"
      distance: "100 + 20 * sin(i * 0.5)"
      radius: "10"
      color: "'#FF5733'"
`
  },
  spiral: {
    name: 'Spiral',
    yaml: `circles:
  - name: "spiral"
    centerX: 0
    centerY: 0
    count: 30
    equations:
      angle: "i * 0.5"
      distance: "50 + i * 3"
      radius: "5 + i * 0.2"
      color: "'#00FF00'"
`
  },
  grid: {
    name: 'Grid Pattern',
    yaml: `circles:
  - name: "grid"
    centerX: 0
    centerY: 0
    count: 25
    equations:
      angle: "atan2(i % 5 - 2, floor(i / 5) - 2)"
      distance: "50 * sqrt(pow(i % 5 - 2, 2) + pow(floor(i / 5) - 2, 2))"
      radius: "8"
      color: "'#0099FF'"
`
  },
  wave: {
    name: 'Wave Pattern',
    yaml: `circles:
  - name: "wave"
    centerX: 0
    centerY: 0
    count: 20
    equations:
      angle: "PI / 2 + i * PI / 10"
      distance: "80 + 30 * sin(i * PI / 10)"
      radius: "12"
      color: "'#FF00FF'"
`
  },
  fibonacci: {
    name: 'Fibonacci Spiral',
    yaml: `circles:
  - name: "fibonacci"
    centerX: 0
    centerY: 0
    count: 15
    equations:
      angle: "i * 137.5 * PI / 180"
      distance: "20 * sqrt(i)"
      radius: "3 + i * 0.5"
      color: "'#FFD700'"
`
  }
}

export const useEquationStore = defineStore('equation', () => {
  const backupStore = useBackupStore()

  // Load from localStorage on init
  const loadFromStorage = (): string => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored || EQUATION_EXAMPLES.orbital_ring.yaml
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
      return EQUATION_EXAMPLES.orbital_ring.yaml
    }
  }

  const yamlContent = ref<string>(loadFromStorage())

  const setYamlContent = (content: string) => {
    yamlContent.value = content
    try {
      localStorage.setItem(STORAGE_KEY, content)
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }

  const loadExample = (exampleKey: keyof typeof EQUATION_EXAMPLES) => {
    const example = EQUATION_EXAMPLES[exampleKey]
    if (example) {
      // Create backup before switching example
      backupStore.createBackup(yamlContent.value, `Before switching to ${example.name}`)
      setYamlContent(example.yaml)
    }
  }

  const resetToDefault = () => {
    // Create backup before reset
    backupStore.createBackup(yamlContent.value, 'Before reset to default')
    setYamlContent(EQUATION_EXAMPLES.orbital_ring.yaml)
  }

  const clearContent = () => {
    // Create backup before clearing
    backupStore.createBackup(yamlContent.value, 'Before clear action')
    setYamlContent('')
  }

  const restoreFromBackup = (backupId: string) => {
    const backup = backupStore.restoreBackup(backupId)
    if (backup) {
      setYamlContent(backup.content)
      return true
    }
    return false
  }

  const clearStorage = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      yamlContent.value = EQUATION_EXAMPLES.orbital_ring.yaml
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
    }
  }

  // Start auto-backup when store is created
  backupStore.startAutoBackup(() => yamlContent.value)

  return {
    yamlContent,
    setYamlContent,
    loadExample,
    resetToDefault,
    clearContent,
    restoreFromBackup,
    clearStorage,
    EQUATION_EXAMPLES
  }
})
