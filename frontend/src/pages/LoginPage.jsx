import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

function LoginPage() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!phone.trim()) {
      setError('נא להזין מספר טלפון')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await api.login(phone)
      
      if (result.error) {
        setError(result.error)
      } else {
        // שמירת פרטי המשתמש (בהמשך נעביר ל-Context)
        localStorage.setItem('user', JSON.stringify(result.user))
        
        // הפניה לפי סוג המשתמש
        if (result.user.role === 'manager') {
          navigate('/manager')
        } else {
          navigate('/soldier')
        }
      }
    } catch (error) {
      setError('שגיאה בחיבור לשרת')
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">מערכת ניהול משמרות</h1>
          <p className="text-gray-600">התחברות למערכת</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              מספר טלפון
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="050-1234567"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              disabled={loading}
              dir="ltr"
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {loading ? 'מתחבר...' : 'התחבר'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">משתמשי בדיקה:</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>מנהל:</span>
              <button 
                onClick={() => setPhone('0509999999')} 
                className="text-blue-600 hover:underline"
              >
                0509999999
              </button>
            </div>
            <div className="flex justify-between">
              <span>חייל 1:</span>
              <button 
                onClick={() => setPhone('0501234567')} 
                className="text-blue-600 hover:underline"
              >
                0501234567
              </button>
            </div>
            <div className="flex justify-between">
              <span>חייל 2:</span>
              <button 
                onClick={() => setPhone('0507654321')} 
                className="text-blue-600 hover:underline"
              >
                0507654321
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage