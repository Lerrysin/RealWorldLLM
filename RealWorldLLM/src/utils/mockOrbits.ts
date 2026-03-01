export type OrbitType = 'debris' | 'satellite' | 'target' | 'rs'
export type OrbitRegion = 'leo' | 'meo' | 'geo'

export interface OrbitalObject {
  id: number
  type: OrbitType
  region: OrbitRegion
  radius: number
  inclination: number
  raan: number
  initialAngle: number
  speed: number
  cosInc: number
  sinInc: number
  cosRaan: number
  sinRaan: number
  name?: string
  rsMetadata?: {
    swathWidth: string
    revisitTime: string
    resolution: string
    sensorType: string
    groundImage: string
  }
}

export interface OrbitData {
  all: OrbitalObject[]
  debris: OrbitalObject[]
  satellites: OrbitalObject[]
  targets: OrbitalObject[]
  rs: OrbitalObject[]
}

const DEG = Math.PI / 180
const TWO_PI = Math.PI * 2

let _data: OrbitData | null = null

export function getOrbitData(): OrbitData {
  if (!_data) _data = generateAllOrbits()
  return _data
}

function push(
  arr: OrbitalObject[],
  id: number,
  type: OrbitType,
  region: OrbitRegion,
  radius: number,
  inclination: number,
  raan: number,
  initialAngle: number,
  speed: number,
  name?: string,
  rsMetadata?: OrbitalObject['rsMetadata']
): OrbitalObject {
  const o: OrbitalObject = {
    id,
    type,
    region,
    radius,
    inclination,
    raan,
    initialAngle,
    speed,
    cosInc: Math.cos(inclination),
    sinInc: Math.sin(inclination),
    cosRaan: Math.cos(raan),
    sinRaan: Math.sin(raan),
    name,
    rsMetadata,
  }
  arr.push(o)
  return o
}

function generateAllOrbits(): OrbitData {
  const all: OrbitalObject[] = []
  let id = 0

  // 1. Debris (~25,000 pieces)
  for (let p = 0; p < 60; p++) {
    const baseInc = (45 + Math.random() * 55) * DEG
    const baseRaan = (p / 60) * TWO_PI
    const baseR = 1.05 + Math.random() * 0.25
    for (let j = 0; j < 400; j++) {
      push(all, id++, 'debris', 'leo', baseR + (Math.random() - 0.5) * 0.04, baseInc + (Math.random() - 0.5) * 0.08, baseRaan, Math.random() * TWO_PI, (0.15 + Math.random() * 0.15) / Math.sqrt(baseR))
    }
  }

  // 2. Starlink Shell
  for (let p = 0; p < 24; p++) {
    const raan = (p / 24) * TWO_PI
    for (let j = 0; j < 50; j++) {
      push(all, id++, 'satellite', 'leo', 1.086, 53 * DEG, raan, (j / 50) * TWO_PI, 0.22 / Math.sqrt(1.086))
    }
  }

  // 3. GEO Ring
  for (let i = 0; i < 1500; i++) {
    push(all, id++, 'satellite', 'geo', 3.22, (Math.random() * 2) * DEG, Math.random() * TWO_PI, Math.random() * TWO_PI, 0.018)
  }

  // 4. Remote Sensing Targets (RS)
  const rsTargets = [
    { 
      name: 'LANDSAT-8', radius: 1.11, inc: 98.2, 
      metadata: { 
        swathWidth: '185 km', revisitTime: '16 days', resolution: '15-30 m', sensorType: 'OLI / TIRS',
        groundImage: 'https://landsat.gsfc.nasa.gov/wp-content/uploads/2013/01/L8_City_Chicago.jpg'
      } 
    },
    { 
      name: 'SENTINEL-2A', radius: 1.12, inc: 98.5, 
      metadata: { 
        swathWidth: '290 km', revisitTime: '5 days', resolution: '10-60 m', sensorType: 'MSI (Multi-Spectral Instrument)',
        groundImage: 'https://sentinels.copernicus.eu/documents/247904/349449/Sentinel-2_Paris.jpg'
      } 
    },
    { 
      name: 'GAOFEN-1', radius: 1.10, inc: 98.0, 
      metadata: { 
        swathWidth: '800 km (Wide)', revisitTime: '4 days', resolution: '2-8 m', sensorType: 'PMC / WFI',
        groundImage: 'https://www.cresda.com/CN/images/gf1_big.jpg'
      } 
    },
    { 
      name: 'TERRA (MODIS)', radius: 1.11, inc: 98.2, 
      metadata: { 
        swathWidth: '2330 km', revisitTime: '1-2 days', resolution: '250m-1km', sensorType: 'MODIS',
        groundImage: 'https://modis.gsfc.nasa.gov/gallery/images/image08252021_main.jpg'
      } 
    },
  ]

  for (const t of rsTargets) {
    push(all, id++, 'rs', 'leo', t.radius, t.inc * DEG, Math.random() * TWO_PI, Math.random() * TWO_PI, 0.2 / Math.sqrt(t.radius), t.name, t.metadata)
  }

  // 5. Classic Targets
  const targetDefs = [
    { name: 'ISS (ZARYA)', radius: 1.064, inc: 51.6, region: 'leo' as OrbitRegion },
    { name: 'HUBBLE HST', radius: 1.085, inc: 28.5, region: 'leo' as OrbitRegion },
    { name: 'TIANGONG', radius: 1.062, inc: 41.5, region: 'leo' as OrbitRegion },
  ]
  for (const def of targetDefs) {
    push(all, id++, 'target', def.region, def.radius, def.inc * DEG, Math.random() * TWO_PI, Math.random() * TWO_PI, 0.22 / Math.sqrt(def.radius), def.name)
  }

  return {
    all,
    debris: all.filter(o => o.type === 'debris'),
    satellites: all.filter(o => o.type === 'satellite'),
    targets: all.filter(o => o.type === 'target'),
    rs: all.filter(o => o.type === 'rs')
  }
}

export function computePosition(orbit: OrbitalObject, time: number): [number, number, number] {
  const theta = orbit.initialAngle + time * orbit.speed
  const lx = orbit.radius * Math.cos(theta)
  const lz = orbit.radius * Math.sin(theta)
  const ry = lz * orbit.sinInc
  const rz = lz * orbit.cosInc
  return [
    lx * orbit.cosRaan - rz * orbit.sinRaan,
    ry,
    lx * orbit.sinRaan + rz * orbit.cosRaan,
  ]
}

export function computeOrbitPoints(orbit: OrbitalObject, steps = 192): [number, number, number][] {
  const pts: [number, number, number][] = []
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * TWO_PI
    const lx = orbit.radius * Math.cos(angle)
    const lz = orbit.radius * Math.sin(angle)
    const ry = lz * orbit.sinInc
    const rz = lz * orbit.cosInc
    pts.push([lx * orbit.cosRaan - rz * orbit.sinRaan, ry, lx * orbit.sinRaan + rz * orbit.cosRaan])
  }
  return pts
}
