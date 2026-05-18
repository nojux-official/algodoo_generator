import { ref, computed } from 'vue'
import YAML from 'js-yaml'
import { evaluate } from 'mathjs'

export interface Circle {
  x: number
  y: number
  radius: number
  color: string
  name?: string
}

export interface CircleConfig {
  name: string
  centerX: number
  centerY: number
  count: number
  equations: {
    angle: string
    distance: string
    radius: string
    color: string
  }
}

export interface ParseResult {
  circles: Circle[]
  error?: string
}

export function useEquationParser() {
  const yamlContent = ref<string>('')
  const parseError = ref<string>('')

  const parseCircles = (yaml: string): ParseResult => {
    try {
      parseError.value = ''

      if (!yaml.trim()) {
        return { circles: [] }
      }

      const config = YAML.load(yaml) as { circles: CircleConfig[] }

      if (!config || !config.circles || !Array.isArray(config.circles)) {
        throw new Error('YAML must contain a "circles" array')
      }

      const allCircles: Circle[] = []

      for (const circleGroup of config.circles) {
        const {
          name = 'circle',
          centerX = 0,
          centerY = 0,
          count = 1,
          equations
        } = circleGroup

        if (!equations) {
          throw new Error(`Circle "${name}" is missing "equations" property`)
        }

        const { angle: angleExpr, distance: distanceExpr, radius: radiusExpr, color: colorExpr } = equations

        if (!angleExpr || !distanceExpr || !radiusExpr || !colorExpr) {
          throw new Error(`Circle "${name}" equations must have: angle, distance, radius, and color`)
        }

        // Generate circles using parametric equations
        for (let i = 0; i < count; i++) {
          const context = {
            i,
            count,
            PI: Math.PI,
            sin: Math.sin,
            cos: Math.cos,
            tan: Math.tan,
            sqrt: Math.sqrt,
            abs: Math.abs,
            pow: Math.pow,
            exp: Math.exp,
            log: Math.log
          }

          const angle = evaluate(angleExpr, context) as number
          const distance = evaluate(distanceExpr, context) as number
          const radius = evaluate(radiusExpr, context) as number
          const color = evaluate(colorExpr, context) as string

          const x = centerX + distance * Math.cos(angle)
          const y = centerY + distance * Math.sin(angle)

          allCircles.push({
            x,
            y,
            radius: Math.max(1, Math.abs(radius)), // Ensure radius is at least 1
            color: String(color),
            name: `${name}_${i}`
          })
        }
      }

      return { circles: allCircles }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      parseError.value = errorMsg
      console.error('Parse error:', errorMsg)
      return { circles: [], error: errorMsg }
    }
  }

  const circles = computed(() => parseCircles(yamlContent.value).circles)

  return {
    yamlContent,
    parseError,
    circles,
    parseCircles
  }
}
