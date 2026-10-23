
import { useState } from 'react'
import { supabase } from './supabase'

export default function Auth({ onSignedIn }) {
  const [mode, setMode] = useState('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError(false)

    try {
      let user

      if (mode === 'signup') {
        const { data, error: signupError } =
          await supabase.auth.signUp({ email, password })

        if (signupError) throw signupError

        user = data.user

        if (!user) {
          throw new Error('Account creation did not return a user.')
        }

        if (!data.session) {
          setMessage(
            'Account created. Check your email to confirm it, then log in.',
          )
          setMode('login')
          return
        }

        const { error: businessError } = await supabase.rpc(
          'create_business',
          { business_name: businessName.trim() },
        )

        if (businessError) throw businessError

        onSignedIn()
      } else {
        const { data, error: loginError } =
          await supabase.auth.signInWithPassword({ email, password })

        if (loginError) throw loginError
        user = data.user

        const { data: memberships, error: membershipError } =
          await supabase
            .from('business_members')
            .select('business_id')
            .eq('user_id', user.id)
            .limit(1)

        if (membershipError) throw membershipError

        if (!memberships?.length) {
          setMessage(
            'You are signed in, but no business is linked to this account yet. Ask your business owner to add you.',
          )
          return
        }

        onSignedIn()
      }
    } catch (err) {
      setError(true)
      setMessage(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 shadow-lg"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Kakuma Digital Business Assistant
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {mode === 'signup'
              ? 'Create an account and register your business.'
              : 'Log in to access your business records.'}
          </p>
        </div>

        {mode === 'signup' && (
          <label className="block space-y-2">
            <span className="text-sm font-medium">Business name</span>
            <input
              required
              minLength={2}
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Enter your business name"
            />
          </label>
        )}

        <label className="block space-y-2">
          <span className="text-sm font-medium">Email address</span>
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="you@example.com"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Password</span>
          <input
            required
            type="password"
            minLength={6}
            autoComplete={
              mode === 'signup' ? 'new-password' : 'current-password'
            }
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="At least 6 characters"
          />
        </label>

        {message && (
          <p
            role="status"
            className={`text-sm ${error ? 'text-red-600' : 'text-emerald-700'}`}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white disabled:opacity-60"
        >
          {loading
            ? 'Please wait...'
            : mode === 'signup'
              ? 'Create account'
              : 'Log in'}
        </button>

        <p className="text-center text-sm text-slate-600">
          {mode === 'signup'
            ? 'Already have an account?'
            : 'Need an account?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signup' ? 'login' : 'signup')
              setMessage('')
              setError(false)
            }}
            className="font-semibold text-emerald-700 underline"
          >
            {mode === 'signup' ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </form>
    </div>
  )
}

