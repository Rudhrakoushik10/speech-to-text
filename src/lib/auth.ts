const subdomain = import.meta.env.VITE_NHOST_SUBDOMAIN
const region = import.meta.env.VITE_NHOST_REGION
const baseUrl = `https://${subdomain}.auth.${region}.nhost.run/v1`

const SESSION_KEY = 'nhostSession'
const listeners = new Set<(session: any) => void>()

function notify(session: any) {
  for (const fn of listeners) fn(session)
}

function getSession(): any {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function setSession(session: any) {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } else {
    localStorage.removeItem(SESSION_KEY)
  }
  notify(session)
}

async function signIn({ email, password }: { email: string; password: string }) {
  const res = await fetch(`${baseUrl}/signin/email-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (data.session) {
    setSession(data.session)
    return { error: null }
  }
  return { error: { message: data.message || data.error || 'Sign in failed' } }
}

async function signUp({ email, password }: { email: string; password: string }) {
  const res = await fetch(`${baseUrl}/signup/email-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (data.session) {
    setSession(data.session)
    return { error: null }
  }
  return { error: { message: data.message || data.error || 'Sign up failed' } }
}

function signOut() {
  setSession(null)
}

function onAuthStateChanged(callback: (session: any) => void) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

export const auth = {
  signIn,
  signUp,
  signOut,
  getSession,
  onAuthStateChanged,
}
