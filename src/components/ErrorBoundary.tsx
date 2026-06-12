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
        <div className="flex bg-beige-50 dark:bg-olive-900 min-h-screen items-center justify-center p-8">
          <div className="bg-white dark:bg-olive-800 rounded-3xl shadow-xl p-8 max-w-md text-center border border-beige-200 dark:border-olive-700">
            <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-orange-600 dark:text-orange-400">!</span>
            </div>
            <h2 className="text-xl font-medium text-olive-900 dark:text-beige-100 mb-2">Something went wrong</h2>
            <p className="text-sm text-olive-500 dark:text-olive-400 mb-6">{this.state.error.message}</p>
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
