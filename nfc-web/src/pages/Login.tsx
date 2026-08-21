import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
    const [password, setPassword] = useState('')
    const [error, setError] = useState(false)
    const navigate = useNavigate()
    const { login } = useAuth()

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        if (password === import.meta.env.VITE_FRONTEND_PASSWORD) {
            login()
            navigate('/')
        } else {
            setError(true)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value)
                        setError(false)
                    }}
                    placeholder="Password"
                    className="border rounded px-3 py-2"
                />
                {error && <p className="text-red-500 text-sm">Incorrect password</p>}
                <button type="submit" className="border rounded px-3 py-2">Log in</button>
            </form>
        </div>
    )
}

export default Login
