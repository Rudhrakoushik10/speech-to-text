import { useState } from 'react'
import { useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../App'
import { auth } from '../lib/auth'
import { ThemeToggle } from './ThemeToggle'
import { Loader2, Leaf } from 'lucide-react'

export function Login() {
  const { session, loading: authLoading } = useAuth()
  const [isLoginView, setIsLoginView] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const location = useLocation()

  if (authLoading) {
    return (
      <div className="flex bg-beige-50 dark:bg-olive-900 min-h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-olive-600" />
      </div>
    )
  }

  if (session) {
    const from = (location.state as any)?.from?.pathname || '/dashboard'
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    setIsSubmitting(true)

    try {
      if (isLoginView) {
        const { error } = await auth.signIn({ email, password })
        if (error) {
          setErrorMsg(error.message)
        }
      } else {
        const { error, needsVerification } = await auth.signUp({ email, password })
        if (needsVerification) {
          setSuccessMsg('Account created! Check your email to verify before signing in.')
        } else if (error) {
          setErrorMsg(error.message)
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error. Check your connection.')
    }
    setIsSubmitting(false)
  }

  const hasConfig = import.meta.env.VITE_NHOST_SUBDOMAIN && import.meta.env.VITE_NHOST_REGION

  return (
    <div className="flex bg-beige-50 dark:bg-olive-900 min-h-screen flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-olive-200 selection:text-olive-900 dark:selection:bg-olive-600 dark:selection:text-beige-100">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-olive-100 flex items-center justify-center shadow-sm border border-olive-200">
            <Leaf className="w-7 h-7 text-olive-700" strokeWidth={1.5} />
          </div>
        </div>
        <h2 className="mt-8 text-center text-3xl font-light text-olive-900 dark:text-beige-100 tracking-tight">
          {isLoginView ? 'Welcome back' : 'Create an account'}
        </h2>
        <p className="mt-2 text-center text-sm text-olive-600/80 dark:text-olive-400/80">
          {isLoginView ? 'Sign in to access your dashboard' : 'Create your account'}
        </p>

        {!hasConfig && (
          <div className="mt-8 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 text-sm border border-orange-200 dark:border-orange-700 shadow-sm mx-auto w-full max-w-md font-medium">
            <strong>Missing Nhost Configuration!</strong> Please set <code>VITE_NHOST_SUBDOMAIN</code> and <code>VITE_NHOST_REGION</code> in your .env file.
          </div>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-olive-800 py-10 px-6 shadow-xl shadow-olive-900/5 sm:rounded-3xl sm:px-10 border border-beige-200 dark:border-olive-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-50/80 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm border border-red-100 dark:border-red-800 font-medium tracking-wide">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-4 rounded-xl bg-green-50/80 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm border border-green-100 dark:border-green-800 font-medium tracking-wide">
                {successMsg}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-olive-800 dark:text-olive-300 tracking-wide">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 bg-beige-50/50 dark:bg-olive-700/50 border border-beige-200 dark:border-olive-600 rounded-xl shadow-sm placeholder-olive-400 dark:placeholder-olive-500 text-olive-900 dark:text-beige-100 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-olive-500 focus:bg-white dark:focus:bg-olive-700 sm:text-sm transition-all focus:shadow-md"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-olive-800 dark:text-olive-300 tracking-wide">
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLoginView ? 'current-password' : 'new-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 bg-beige-50/50 dark:bg-olive-700/50 border border-beige-200 dark:border-olive-600 rounded-xl shadow-sm placeholder-olive-400 dark:placeholder-olive-500 text-olive-900 dark:text-beige-100 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-olive-500 focus:bg-white dark:focus:bg-olive-700 sm:text-sm transition-all focus:shadow-md"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-olive-600 hover:bg-olive-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-500 focus:ring-offset-beige-50 dark:focus:ring-offset-olive-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:shadow-lg active:scale-[0.98]"
              >
                {isSubmitting && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                {isLoginView ? 'Sign in' : 'Sign up'}
              </button>
            </div>
          </form>

          <div className="mt-8 flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                setIsLoginView(!isLoginView)
                setErrorMsg('')
                setSuccessMsg('')
              }}
              className="text-sm font-medium text-olive-600 hover:text-olive-800 dark:text-olive-400 dark:hover:text-olive-200 transition-colors tracking-wide"
            >
              {isLoginView
                ? "Don't have an account? Create one"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
