import { create } from 'zustand'

export interface Coords {
  lat: number
  lng: number
}

export interface RemoteSensingData {
  swathWidth: string
  revisitTime: string
  resolution: string
  sensorType: string
  groundImage: string
}

interface AppState {
  version: string
  projectName: string
  isStarted: boolean
  targetId: number | null
  centerEntity: 'earth' | 'moon' | 'mars'
  isTransitioning: boolean
  searchCoords: Coords | null
  rsData: RemoteSensingData | null
  setStarted: (val: boolean) => void
  setTarget: (id: number | null, rsData?: RemoteSensingData) => void
  setCenterEntity: (entity: 'earth' | 'moon' | 'mars') => void
  setTransitioning: (val: boolean) => void
  setSearchCoords: (coords: Coords | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  version: '1.5.2-PRO',
  projectName: 'REAL-WORLD ORBITAL TRACKER',
  isStarted: false,
  targetId: null,
  centerEntity: 'earth',
  isTransitioning: false,
  searchCoords: null,
  rsData: null,
  setStarted: (val) => set({ isStarted: val }),
  setTarget: (id, rsData) => set({ targetId: id, rsData: rsData || null }),
  setCenterEntity: (entity) => set({ centerEntity: entity, targetId: null, rsData: null }),
  setTransitioning: (val) => set({ isTransitioning: val }),
  setSearchCoords: (coords) => set({ searchCoords: coords, targetId: null, centerEntity: 'earth', rsData: null }),
}))
