import { useState, useEffect } from 'react'
import { useAppStore } from '../store'
import './StartScreen.css'

export default function StartScreen() {
  const isStarted = useAppStore(s => s.isStarted)
  const setStarted = useAppStore(s => s.setStarted)
  const [loadingText, setLoadingText] = useState('INITIALIZING COMM LINK...')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (isStarted) return

    let currentProg = 0
    
    const interval = setInterval(() => {
      currentProg += Math.random() * 5
      if (currentProg > 100) currentProg = 100
      setProgress(currentProg)
      
      if (currentProg < 30) setLoadingText('ESTABLISHING SECURE CONNECTION...')
      else if (currentProg < 60) setLoadingText('DOWNLOADING ORBITAL EPHEMERIDES...')
      else if (currentProg < 90) setLoadingText('CALIBRATING SENSORS...')
      else setLoadingText('SYSTEM READY.')

      if (currentProg >= 100) {
        clearInterval(interval)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [isStarted])

  if (isStarted) return null

  return (
    <div className="start-screen">
      <div className="start-content">
        <h1 className="title">REAL-WORLD ORBITAL TRACKER</h1>
        <div className="subtitle">GLOBAL SURVEILLANCE NETWORK</div>
        
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        
        <div className="loading-text">{loadingText}</div>

        <button 
          className="start-button" 
          disabled={progress < 100}
          onClick={() => setStarted(true)}
        >
          {progress >= 100 ? 'ENTER SYSTEM' : 'PLEASE WAIT'}
        </button>
      </div>
      <div className="background-noise"></div>
    </div>
  )
}
