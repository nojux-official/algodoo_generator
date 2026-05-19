import { defineStore } from 'pinia'
import { ref } from 'vue'

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
      setYamlContent(example.yaml)
    }
  }

  const resetToDefault = () => {
    setYamlContent(EQUATION_EXAMPLES.orbital_ring.yaml)
  }

  const clearStorage = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      yamlContent.value = EQUATION_EXAMPLES.orbital_ring.yaml
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
    }
  }

  return {
    yamlContent,
    setYamlContent,
    loadExample,
    resetToDefault,
    clearStorage,
    EQUATION_EXAMPLES
  }
})
