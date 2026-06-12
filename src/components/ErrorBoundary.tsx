import { Component } from 'react'

interface Props {
  children: React.ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex bg-beige-50 min-h-screen items-center justify-center p-8">
          <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md text-center border border-beige-200">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">!</span>
            </div>
            <h2 className="text-xl font-medium text-olive-900 mb-2">Something went wrong</h2>
            <p className="text-sm text-olive-500 mb-6">{this.state.error.message}</p>
            <button
              onClick={() => { this.setState({ error: null }); window.location.href = '/' }}
              className="inline-flex px-6 py-3 rounded-xl bg-olive-600 text-white text-sm font-medium hover:bg-olive-700 transition-all"
            >
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
