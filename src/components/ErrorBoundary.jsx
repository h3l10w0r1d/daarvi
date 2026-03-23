import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-8">
          <div className="max-w-lg w-full border border-red/30 p-8">
            <p className="text-[10px] tracking-widest text-red font-sans mb-4">RENDER ERROR</p>
            <p className="font-serif text-xl text-cream mb-4">Something crashed</p>
            <pre className="text-[11px] text-gray/80 font-mono bg-white/5 p-4 overflow-auto whitespace-pre-wrap">
              {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack?.split('\n').slice(0, 8).join('\n')}
            </pre>
            <button
              onClick={() => { this.setState({ error: null }); window.location.reload() }}
              className="mt-6 px-6 py-3 border border-gold text-gold text-xs tracking-widest font-sans hover:bg-gold hover:text-black transition-all"
            >
              RELOAD
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
