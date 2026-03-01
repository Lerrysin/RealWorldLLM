import { useState } from 'react'
import { useAppStore } from '../store'
import { getOrbitData } from '../utils/mockOrbits'
import './HUD.css'

export default function HUD() {
  const { 
    projectName, version, targetId, setTarget, 
    centerEntity, setCenterEntity, searchCoords, 
    setSearchCoords, rsData 
  } = useAppStore()
  
  const [leftExpanded, setLeftExpanded] = useState(false)
  const [rightExpanded, setRightExpanded] = useState(false)
  const [latInput, setLatInput] = useState('')
  const [lngInput, setLngInput] = useState('')

  const data = getOrbitData()
  const activeTarget = data.all.find(o => o.id === targetId)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const lat = parseFloat(latInput); const lng = parseFloat(lngInput)
    if (!isNaN(lat) && !isNaN(lng)) setSearchCoords({ lat, lng })
  }

  return (
    <div className="hud-container">
      {/* Tactical Top Bar */}
      <div className="tactical-header">
        <div className="header-left">
          <span className="blink-dot">●</span>
          LIVE_STRM // {projectName} v{version}
        </div>
        <div className="header-right">
          DEPT_OF_SPACE // UNOOSA_CONVENTION_COMPLIANT
        </div>
      </div>

      <div className="hud-top-row">
        {/* Expanded Catalog with Glassmorphism */}
        <div className={`cyber-panel left ${leftExpanded ? 'expanded' : ''}`}>
          <div className="panel-header-toggle" onClick={() => setLeftExpanded(!leftExpanded)}>
            <span className="icon">{leftExpanded ? '▽' : '▷'}</span>
            CATALOG: {activeTarget?.name || 'STANDBY'}
          </div>
          {leftExpanded && (
            <div className="scroll-list">
              <div className="category">OPTICAL_REMOTE_SENSING</div>
              {data.rs.map(s => (
                <div key={s.id} className={`list-item ${targetId === s.id ? 'active' : ''}`} onClick={() => setTarget(s.id, s.rsMetadata)}>
                  <span className="marker">»</span> {s.name}
                </div>
              ))}
              <div className="category">ORBITAL_INFRA</div>
              {data.targets.map(s => (
                <div key={s.id} className={`list-item ${targetId === s.id ? 'active' : ''}`} onClick={() => setTarget(s.id)}>
                  <span className="marker">»</span> {s.name}
                </div>
              ))}
              <div className="list-item reset" onClick={() => setTarget(null)}>CLR_TARGET</div>
            </div>
          )}
        </div>

        {/* Tactical Search */}
        <div className="tactical-search">
          <form onSubmit={handleSearch} className="search-form">
            <label>POS_LOCK:</label>
            <input placeholder="LAT" value={latInput} onChange={e => setLatInput(e.target.value)} />
            <input placeholder="LNG" value={lngInput} onChange={e => setLngInput(e.target.value)} />
            <button type="submit">EXECUTE</button>
          </form>
        </div>

        {/* Celestial Switcher */}
        <div className={`cyber-panel right ${rightExpanded ? 'expanded' : ''}`}>
          <div className="panel-header-toggle" onClick={() => setRightExpanded(!rightExpanded)}>
            <span className="icon">{rightExpanded ? '▽' : '◁'}</span>
            FOCUS: {centerEntity.toUpperCase()}
          </div>
          {rightExpanded && (
            <div className="button-group">
              {['earth', 'moon', 'mars'].map((p: any) => (
                <button key={p} className={`cyber-button ${centerEntity === p ? 'active' : ''}`} onClick={() => setCenterEntity(p)}>
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center Left: RS Specs */}
      {rsData && (
        <div className="rs-spec-overlay">
          <div className="spec-title">SENS_INTEL_SIMULATION</div>
          <div className="spec-grid">
            <div className="spec-row"><label>WIDTH</label><span>{rsData.swathWidth}</span></div>
            <div className="spec-row"><label>RVST</label><span>{rsData.revisitTime}</span></div>
            <div className="spec-row"><label>RES</label><span>{rsData.resolution}</span></div>
            <div className="spec-row"><label>TYPE</label><span>{rsData.sensorType}</span></div>
          </div>
          <div className="scan-line-anim"></div>
        </div>
      )}

      {/* Center Right: Visual Feed */}
      {rsData && (
        <div className="visual-feed-overlay">
          <div className="feed-header">EO_OPTICAL_FEED // NADIR</div>
          <div className="feed-frame">
            <img src={rsData.groundImage} alt="feed" />
            <div className="feed-reticle"></div>
            <div className="feed-telemetry">
              LAT: {searchCoords?.lat.toFixed(4) || '---'} | LNG: {searchCoords?.lng.toFixed(4) || '---'}
            </div>
          </div>
        </div>
      )}

      {/* Bottom: Legal Ticker */}
      <div className="hud-bottom-ticker">
        <div className="ticker-label">UNOOSA_REGISTRY_COMPLIANCE:</div>
        <div className="ticker-content">
          {data.targets.map(t => `[ ${t.name}: REGISTERED_OK ]`).join(' --- ')}
        </div>
      </div>
    </div>
  )
}
