import Scene from './components/Scene'
import HUD from './components/HUD'
import StartScreen from './components/StartScreen'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

export default function App() {
  return (
    <>
      <ErrorBoundary>
        <Scene />
      </ErrorBoundary>
      <HUD />
      <StartScreen />
    </>
  )
}
