import { useAuth } from '../App'
import { auth } from '../lib/auth'
import { useDeepgram } from '../hooks/useDeepgram'
import { ThemeToggle } from './ThemeToggle'
import { LogOut, Mic, MicOff, Loader2, Leaf, Activity } from 'lucide-react'

export function Dashboard() {
  const { session } = useAuth()
  const { transcript, interim, listening, requesting, error, startListening, stopListening } = useDeepgram()
  const user = session?.user

  return (
    <div className="bg-beige-50 dark:bg-olive-900 min-h-screen selection:bg-olive-200 selection:text-olive-900 dark:selection:bg-olive-600 dark:selection:text-beige-100">
      <header className="bg-white/60 dark:bg-olive-800/60 backdrop-blur-md sticky top-0 z-10 border-b border-beige-200 dark:border-olive-700 shadow-sm shadow-olive-900/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-olive-100 dark:bg-olive-700 rounded-xl flex items-center justify-center border border-olive-200 dark:border-olive-600 shadow-sm">
              <Leaf className="w-5 h-5 text-olive-700 dark:text-olive-300" strokeWidth={1.5} />
            </div>
            <h1 className="text-xl font-medium text-olive-900 dark:text-beige-100 tracking-wide">Speech to Text</h1>
          </div>
          <div className="flex items-center gap-4">
            {user?.email && (
              <span className="text-sm text-olive-500 dark:text-olive-400 hidden sm:block">{user.email}</span>
            )}
            <ThemeToggle />
            <button
              onClick={() => auth.signOut()}
              className="inline-flex items-center gap-2 text-sm font-medium text-olive-600 dark:text-olive-400 hover:text-olive-900 dark:hover:text-beige-100 transition-colors bg-white dark:bg-olive-800 px-4 py-2 rounded-xl shadow-sm border border-beige-200 dark:border-olive-700 hover:shadow-md hover:bg-beige-50 dark:hover:bg-olive-700 active:scale-[0.98]"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="bg-white dark:bg-olive-800 rounded-3xl shadow-xl shadow-olive-900/5 border border-beige-200 dark:border-olive-700 overflow-hidden">
          <div className="p-8 border-b border-beige-100 dark:border-olive-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-br from-white to-beige-50/50 dark:from-olive-800 dark:to-olive-800/80">
            <div>
              <h2 className="text-2xl font-light text-olive-900 dark:text-beige-100 tracking-tight">Live Session</h2>
              <p className="text-sm text-olive-500 dark:text-olive-400 mt-2 font-medium tracking-wide">
                {listening ? 'Listening... speak into your microphone' : 'Click Start to begin'}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={listening ? stopListening : startListening}
                disabled={requesting}
                className={`
                  inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl text-sm font-medium transition-all shadow-sm
                  ${listening
                    ? 'bg-orange-50 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/60 hover:shadow-md'
                    : 'bg-olive-600 text-white border border-transparent hover:bg-olive-700 hover:shadow-lg shadow-olive-900/20'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]
                `}
              >
                {requesting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : listening ? (
                  <>
                    <MicOff className="w-5 h-5 flex-shrink-0" /> Stop listening
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 flex-shrink-0" /> Start listening
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-orange-50/80 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-sm border border-orange-200 dark:border-orange-700 flex items-start gap-4">
                <div className="mt-0.5"><Activity className="w-4 h-4 text-orange-600 dark:text-orange-400" /></div>
                <div className="leading-relaxed font-medium">{error}</div>
              </div>
            )}

            <div className="relative min-h-[400px] bg-beige-50/50 dark:bg-olive-900/50 rounded-2xl border border-beige-200 dark:border-olive-700 p-8 text-lg leading-relaxed whitespace-pre-wrap transition-colors">
              {!transcript && !interim && !listening && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-olive-400/60 dark:text-olive-500/60 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-olive-100/50 dark:bg-olive-700/50 flex items-center justify-center border border-olive-200/50 dark:border-olive-600/50">
                    <Mic className="w-6 h-6 text-olive-400 dark:text-olive-500" strokeWidth={1.5} />
                  </div>
                  <p className="font-medium tracking-wide">Ready to transcribe</p>
                </div>
              )}

              <span className="text-olive-900 dark:text-beige-100 font-serif">{transcript}</span>
              {interim && (
                <span className="text-olive-500 dark:text-olive-400 font-serif">
                  {transcript ? ' ' : ''}{interim}
                </span>
              )}
              {listening && (
                <span className="inline-block w-2.5 h-6 ml-2 bg-olive-400/60 dark:bg-olive-500/60 animate-pulse align-middle rounded-sm" />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
