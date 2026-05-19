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

// Minimal PHN template (compatible with Algodoo v2.1.0)
const PHN_TEMPLATE = `// FileVersion 21
// Algodoo scene created by Algodoo v2.1.0

FileInfo -> {
    title = "generated_circles";
    author = "CircleGenerator";
    version = 21
};
Sim -> {
    gravitySwitch = true;
    gravityStrength = 9.8000002;
    gravityAngleOffset = 0;
    airSwitch = true;
    airFrictionMultiplier = 1;
    airFrictionLinear = 0.0099999998;
    airFrictionQuadratic = 0.001;
    rotFrictionLinear = 0.031399999;
    airDensity = 0.0099999998;
    windStrength = 0;
    windAngle = 0;
    airFrictionVersion = 3;
    legacyMode = 2;
    timeFactor = 1;
    geomAttraction = true;
    multipleContactEventPerPair = false;
    collideCallbacksEveryStep = true;
    scriptUpdatesEveryStep = true;
    cables = false;
    limitAngVel = 0.25;
    directContactSolveAll = false;
    direct_friction = false;
    directHingeSolve = true;
    directSpringSolve = false;
    solveIter = 30;
    directSolveIters = 3;
    dsFirst = true;
    dsLast = true;
    iterativeContactsToo = true;
    iterativeHingesToo = true;
    iterativeSpringsToo = true;
    pureIterativeFinish = true;
    direct_lcp = true;
    mlcp_tolerance = 1e-006;
    mlcp_maxIter = 7;
    positionsLast = true;
    timeFactor = 1;
    frequency = 60;
    targetPenetration = 9.9999997e-005
};
Palette -> {
    opaqueBorders = true;
    drawCircleCakes = true;
    colorRangesHSVA = [[[0, 0, 0, 1], [359.89999, 1, 1, 1]]];
    skyColor = [0.44999999, 0.55000001, 1, 1];
    waterColor = [0.1, 0.1, 1, 0.69999999]
};
App -> {
    showGravityField = false;
    laserEvents = true;
    numColorsInRainbow = 12;
    waterColor = [0.1, 0.1, 1, 0.69999999];
    borderWidth = 0.029999999;
    currentPalette = "default"
};
App.GUI -> {
    drawHingesWhenRunning = true
};
Scene -> {
    gravityRotationOffset = NaN;
    textures = [];
    sounds = []
};
Scene.Camera -> {
    pan = [0, 0];
    rotation = 0;
    zoom = 100
};
Scene.addLayer {
    visible := true;
    color := [1, 1, 1, 1];
    id := 0;
    dynamic := true
};
// CIRCLES_PLACEHOLDER
Scene.addGroup {
    name := "generated";
    entityIDs := [ENTITYIDS_PLACEHOLDER]
}
`

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

export async function exportCirclesToPhz(circles: Circle[]): Promise<Blob> {
  if (circles.length === 0) {
    throw new Error('No circles to export')
  }

  // Build the circles section
  const circlesStartGeomID = 100
  const circlesStartEntityID = 200
  const circleDefinitions: string[] = []
  const entityIDs: number[] = []

  circles.forEach((circle, index) => {
    const geomID = circlesStartGeomID + index
    const entityID = circlesStartEntityID + index
    const zDepth = 10 + index

    circleDefinitions.push(createCirclePhysics(circle, geomID, entityID, zDepth))
    entityIDs.push(entityID)
  })

  // Replace placeholders
  let phnContent = PHN_TEMPLATE.replace(
    '// CIRCLES_PLACEHOLDER',
    circleDefinitions.join('\n')
  )
  phnContent = phnContent.replace('ENTITYIDS_PLACEHOLDER', entityIDs.join(', '))

  // Create a simple placeholder thumbnail (1x1 transparent PNG)
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

  // Create ZIP archive
  const zip = new JSZip()
  zip.file('scene.phn', phnContent)
  zip.file('thumb.png', pngBlob)
  zip.file('checksums.txt', checksumContent)

  // Generate and return the ZIP file
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
