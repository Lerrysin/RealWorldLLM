import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  handleCopy = () => {
    const text = `${this.state.error?.message}\n\n${this.state.error?.stack}`
    navigator.clipboard.writeText(text)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          background: '#000', color: '#ff4444', display: 'flex',
          flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          fontFamily: 'monospace', padding: 40, zIndex: 999,
        }}>
          <h2 style={{ color: '#ff6666', marginBottom: 20 }}>3D RENDER ERROR</h2>
          {this.state.error?.message?.includes('WebGL') && (
            <div style={{ color: '#ffaa44', fontSize: 14, marginBottom: 20, textAlign: 'left', maxWidth: 500, lineHeight: 1.8 }}>
              <p>WebGL context creation failed. Try:</p>
              <p>1. Close other browser tabs using 3D/WebGL</p>
              <p>2. Enable hardware acceleration in browser settings</p>
              <p>3. Update your GPU drivers</p>
              <p>4. Restart your browser</p>
            </div>
          )}
          <button onClick={this.handleCopy} style={{
            background: '#ff4444', color: '#000', border: 'none', padding: '10px 30px',
            cursor: 'pointer', fontFamily: 'monospace', fontSize: 16, marginBottom: 20,
          }}>
            COPY ERROR
          </button>
          <pre style={{ color: '#ff8888', fontSize: 12, maxWidth: '80%', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
            {this.state.error?.message}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}
