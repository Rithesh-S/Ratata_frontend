import { useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { Eye, EyeOff } from 'lucide-react'
import { signup } from '../api/api'
import { Navigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import 'react-toastify/dist/ReactToastify.css'

function Signup() {
  const [form, setForm] = useState({ userName: '', email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const isAuthenticated = localStorage.getItem("token")
  if (isAuthenticated) {
    return <Navigate to="/ratata" replace />
  }

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (isLoading) return
    setIsLoading(true)

    try {
      if (!form.userName || !form.email || !form.password) {
        toast.error('All fields are required')
        return
      }
      if (!/\S+@\S+\.\S+/.test(form.email)) {
        toast.error('Invalid email format')
        return
      }
      if (form.password.length < 6) {
        toast.error('Password must be at least 6 characters')
        return
      }

      const res = await signup(form)
      if (res.success) {
        toast.success('Signup successful')
        setTimeout(() => {
          window.location.replace('/ratata/login')
        }, 1500)
      } else {
        toast.error(res.message || 'Signup failed, please try again')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <div className="flex items-center z-5 bg-transparent justify-center min-h-screen p-4">
        <div className="relative z-10 bg-transparent text-white backdrop-blur-xs border border-white/30 rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <h2 className="text-3xl select-none font-extrabold text-center mb-2 bg-gradient-to-r from-light-primary to-light-secondary bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="text-center select-none text-gray-500 mb-6 text-sm">
            Sign up, squad up, and dominate the grid!
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              name="userName"
              placeholder="Username"
              value={form.userName}
              onChange={handleChange}
              className="w-full px-4 py-3 select-none rounded-lg border-[1.5px] border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0dcaf8] focus:border-transparent shadow-sm"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 select-none rounded-lg border-[1.5px] border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0dcaf8] focus:border-transparent shadow-sm"
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 select-none rounded-lg border-[1.5px] border-gray-300 focus:outline-none focus:ring-2 focus:ring-light-accent focus:border-transparent shadow-sm pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 pr-1 right-3 flex items-center text-gray-500 hover:text-light-accent transition select-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 select-none bg-gradient-to-r from-light-primary to-light-secondary
            text-white font-semibold rounded-lg shadow-md hover:scale-[1.02] hover:shadow-lg transition-transform
              ${isLoading && "cursor-not-allowed brightness-50"}`}
            >
              {isLoading ? "Signing up..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center select-none text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <a href="/login" className="text-[#034ed1] font-medium hover:underline">
              Log in
            </a>
          </p>
        </div>
      </div>
    </Layout>
  )
}

export default Signup
