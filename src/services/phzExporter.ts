import JSZip from 'jszip'
import type { Circle } from '@/composables/useEquationParser'

// Simple CRC32 implementation for checksums
function crc32(data: string | Uint8Array): string {
  const polynomial = 0xedb88320
  let crc = 0xffffffff

  const bytes: Uint8Array = typeof data === 'string' ? new TextEncoder().encode(data) : data

  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i]!
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (polynomial & -(crc & 1))
    }
  }

  return ((crc ^ 0xffffffff) >>> 0).toString(16).padStart(8, '0')
}

// Cache for loaded template
let cachedTemplate: string | null = null

// Load template from reference scene
async function loadTemplatePhz(): Promise<string> {
  if (cachedTemplate) return cachedTemplate

  try {
    const response = await fetch('/template-scene.phn')
    if (!response.ok) throw new Error('Template not found')
    cachedTemplate = await response.text()
    return cachedTemplate
  } catch (error) {
    console.error('Could not load template PHN file:', error)
    throw new Error(
      'Template file not found. Make sure template-scene.phn is in the public folder'
    )
  }
}

interface SceneStructure {
  inheritedScene: string
  maxGeomID: number
  maxEntityID: number
}

// Parse template to preserve all scene properties but remove circles and axles
function extractSceneStructure(phnContent: string): SceneStructure {
  const lines = phnContent.split('\n')
  const preservedLines: string[] = []
  let maxGeomID = 99
  let maxEntityID = 199
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    if (line === undefined) {
      i++
      continue
    }

    // Skip Scene.addCircle blocks (will be replaced with generated circles)
    if (line.includes('Scene.addCircle')) {
      while (i < lines.length) {
        const currentLine = lines[i]
        if (!currentLine) {
          i++
          continue
        }
        // Extract max IDs before skipping
        const geomMatch = currentLine.match(/geomID\s*:=\s*(\d+)/)
        const entityMatch = currentLine.match(/entityID\s*:=\s*(\d+)/)
        if (geomMatch && geomMatch[1]) maxGeomID = Math.max(maxGeomID, parseInt(geomMatch[1]))
        if (entityMatch && entityMatch[1]) maxEntityID = Math.max(maxEntityID, parseInt(entityMatch[1]))

        // Check if line is ONLY }; (not part of inline code like update := (e)=>{};)
        if (currentLine.trim() === '};') {
          i++
          break
        }
        i++
      }
    }
    // Skip Scene.addHinge blocks (axles - will be replaced with generated axles)
    else if (line.includes('Scene.addHinge')) {
      while (i < lines.length) {
        const currentLine = lines[i]
        if (!currentLine) {
          i++
          continue
        }
        // Extract max ID before skipping
        const entityMatch = currentLine.match(/entityID\s*:=\s*(\d+)/)
        if (entityMatch && entityMatch[1]) maxEntityID = Math.max(maxEntityID, parseInt(entityMatch[1]))

        // Check if line is ONLY }; (not part of inline code)
        if (currentLine.trim() === '};') {
          i++
          break
        }
        i++
      }
    }
    // Skip Scene.addGroup (will add new group with generated entities)
    else if (line.includes('Scene.addGroup')) {
      while (i < lines.length) {
        const currentLine = lines[i]
        if (!currentLine) {
          i++
          continue
        }
        // End of group can be }; or just }
        if (currentLine.trim() === '};' || currentLine.trim() === '}') {
          i++
          break
        }
        i++
      }
    }
    // Preserve everything else (Sim, Palette, App, Camera, Planes, Layers, etc.)
    else {
      preservedLines.push(line)
      i++
    }
  }

  return {
    inheritedScene: preservedLines.join('\n'),
    maxGeomID,
    maxEntityID
  }
}

function rgbToHsva(r: number, g: number, b: number, a: number = 1): [number, number, number, number] {
  r = Math.max(0, Math.min(1, r))
  g = Math.max(0, Math.min(1, g))
  b = Math.max(0, Math.min(1, b))

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  let h = 0
  if (delta !== 0) {
    if (max === r) {
      h = 60 * (((g - b) / delta) % 6)
    } else if (max === g) {
      h = 60 * ((b - r) / delta + 2)
    } else {
      h = 60 * ((r - g) / delta + 4)
    }
    if (h < 0) h += 360
  }

  const s = max === 0 ? 0 : delta / max
  const v = max

  return [h, s, v, a]
}

function hexToRgb(hex: string): [number, number, number] {
  const cleaned = hex.replace(/^#/, '')
  const r = parseInt(cleaned.substring(0, 2), 16) / 255
  const g = parseInt(cleaned.substring(2, 4), 16) / 255
  const b = parseInt(cleaned.substring(4, 6), 16) / 255
  return [r, g, b]
}

function createCirclePhysics(circle: Circle, geomID: number, entityID: number, zDepth: number): string {
  const [r, g, b] = hexToRgb(circle.color)
  const [h, s, v, a] = rgbToHsva(r, g, b, 1)

  return `
Scene.addCircle {
    geomID := ${geomID};
    entityID := ${entityID};
    pos := [${circle.x}, ${circle.y}];
    radius := ${circle.radius};
    color := [${r.toFixed(8)}, ${g.toFixed(8)}, ${b.toFixed(8)}, 1];
    colorHSVA := [${h.toFixed(5)}, ${s.toFixed(8)}, ${v.toFixed(8)}, 1];
    density := 2;
    friction := 0.5;
    restitution := 0.5;
    body := 0;
    angle := 0;
    zDepth := ${zDepth};
    layer := 0;
    vel := [0, 0];
    angvel := 0;
    inertiaMultiplier := 1;
    resources := [];
    timeToLive := +inf;
    textureClamped := [false, false];
    adhesion := 0;
    attractionType := 2;
    attraction := 0;
    texture := "";
    update := (e)=>{};
    showMomentum := false;
    killer := false;
    materialVelocity := 0;
    showForceArrows := false;
    refractiveIndex := 1.5;
    textureMatrix := [1, 0, 0, 0, 1, 0, 0, 0, 1];
    protractor := false;
    immortal := false;
    collideSet := 1;
    drawBorder := true;
    reflectiveness := 1;
    velocityDamping := [0, 0, 0];
    onClick := (e)=>{};
    collideWater := true;
    onSpawn := (e)=>{};
    materialName := "";
    onHitByLaser := (e)=>{};
    drawCake := true;
    onDie := (e)=>{};
    airFrictionMult := 1;
    heteroCollide := false;
    glued := false;
    onKey := (e)=>{};
    showVelocity := false;
    postStep := (e)=>{};
    opaqueBorders := true;
    edgeBlur := 0;
    onCollide := (e)=>{}
};`
}

function createIdleAxle(geomID: number, entityID: number, circleX: number, circleY: number, radius: number, axleZDepth: number): string {
  // Create an idle axle (hinge) connecting the circle to the layer (geomID 0)
  const hingeR = 0.99
  const hingeG = 0.35
  const hingeB = 0.63
  const [h, s, v] = rgbToHsva(hingeR, hingeG, hingeB, 1)

  return `
Scene.addHinge {
    geom0 := ${geomID};
    geom0pos := [0, 0];
    geom1 := 0;
    geom1pos := [${circleX}, ${circleY}];
    entityID := ${entityID};
    color := [${hingeR.toFixed(8)}, ${hingeG.toFixed(8)}, ${hingeB.toFixed(8)}, 1];
    colorHSVA := [${h.toFixed(5)}, ${s.toFixed(8)}, ${v.toFixed(8)}, 1];
    motor := false;
    motorTorque := 0;
    motorSpeed := 0;
    bend := false;
    autoBend := false;
    ccw := false;
    allowDirectSolve := true;
    forceDirectSolve := false;
    autoBrake := false;
    opaqueBorders := true;
    timeToLive := +inf;
    update := (e)=>{};
    onSpawn := (e)=>{};
    onDie := (e)=>{};
    onClick := (e)=>{};
    postStep := (e)=>{};
    onKey := (e)=>{};
    hingeConstant := NaN;
    bendConstant := NaN;
    bendTarget := NaN;
    impulseLimit := +inf;
    distanceLimit := +inf;
    size := ${Math.max(0.3, radius * 0.8).toFixed(8)};
    resources := [];
    zDepth := ${axleZDepth};
    legacyMode := 1;
    layer := 0;
    totImp3 := [0, 0, 0]
};`
}

export async function exportCirclesToPhz(circles: Circle[]): Promise<Blob> {
  if (circles.length === 0) {
    throw new Error('No circles to export')
  }

  // Load and parse template scene
  const templatePhn = await loadTemplatePhz()
  const { inheritedScene, maxGeomID, maxEntityID } = extractSceneStructure(templatePhn)

  // Generate new IDs for generated circles (no conflicts with template)
  const generatedCirclesStartGeomID = maxGeomID + 1
  const generatedCirclesStartEntityID = maxEntityID + 1
  const generatedAxlesStartEntityID = generatedCirclesStartEntityID + circles.length + 10

  const generatedCircles: string[] = []
  const generatedEntityIDs: number[] = []

  // Create circles from equations with new IDs
  circles.forEach((circle, index) => {
    const geomID = generatedCirclesStartGeomID + index
    const entityID = generatedCirclesStartEntityID + index
    const zDepth = 10 + index

    generatedCircles.push(createCirclePhysics(circle, geomID, entityID, zDepth))
    generatedEntityIDs.push(entityID)

    // Create axle for each generated circle
    const axleEntityID = generatedAxlesStartEntityID + index
    const axleZDepth = zDepth + circles.length + 10
    generatedCircles.push(
      createIdleAxle(geomID, axleEntityID, circle.x, circle.y, circle.radius, axleZDepth)
    )
    generatedEntityIDs.push(axleEntityID)
  })

  // Build final scene: inherited properties + generated circles + group
  let phnContent = inheritedScene
  phnContent += '\n' + generatedCircles.join('\n')
  phnContent += `\nScene.addGroup {
    name := "generated";
    entityIDs := [${generatedEntityIDs.join(', ')}]
};`

  // Create thumbnail
  const pngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  const pngBinary = atob(pngBase64)
  const pngBytes = new Uint8Array(pngBinary.length)
  for (let i = 0; i < pngBinary.length; i++) {
    pngBytes[i] = pngBinary.charCodeAt(i)
  }
  const pngBlob = new Blob([pngBytes], { type: 'image/png' })

  // Calculate checksums
  const phnChecksum = crc32(phnContent)
  const pngChecksum = crc32(pngBytes)
  const checksumContent = `scene.phn\t${phnChecksum}\nthumb.png\t${pngChecksum}`

  // Create and return ZIP archive
  const zip = new JSZip()
  zip.file('scene.phn', phnContent)
  zip.file('thumb.png', pngBlob)
  zip.file('checksums.txt', checksumContent)

  return await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
}

export function downloadPhzFile(blob: Blob, filename: string = 'circles.phz'): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
