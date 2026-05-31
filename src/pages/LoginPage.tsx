import { useState } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleGoogle() {
    setError('')
    try {
      await signInWithPopup(auth, googleProvider)
      navigate('/')
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/regnskap/logo.png" alt="Sørbø Musikk" className="w-24 h-24 mx-auto mb-3 object-contain" />
          <h1 className="text-2xl font-bold text-slate-800">Sørbø Musikk Regnskap</h1>
        </div>

        {error && (
          <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded p-2 mb-4">{error}</p>
        )}

        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 rounded-xl py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-sm transition"
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.6 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.6 6.5 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.5 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8H6.2C9.5 35.6 16.3 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C37 39.4 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/>
          </svg>
          Logg inn med Google
        </button>
      </div>
    </div>
  )
}
