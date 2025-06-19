import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AvailabilityForm from '../components/soldier/AvailabilityForm'

function SoldierDashboard() {
  const [user, setUser] = useState(null)
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false)
  const [availabilityStatus, setAvailabilityStatus] = useState('pending') // 'pending', 'submitted'
  const navigate = useNavigate()

  useEffect(() => {
    // קבלת פרטי המשתמש מה-localStorage
    const userData = localStorage.getItem('user')
    if (!userData) {
      navigate('/')
      return
    }
    
    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== 'soldier') {
      navigate('/')
      return
    }
    
    setUser(parsedUser)
    
    // בדיקת סטטוס זמינות (בעתיד נטען מהשרת)
    checkAvailabilityStatus(parsedUser.id)
  }, [navigate])

  const checkAvailabilityStatus = async (userId) => {
    try {
      // כרגע דמה - בעתיד נטען מהשרת
      const hasSubmitted = localStorage.getItem(`availability_${userId}`)
      setAvailabilityStatus(hasSubmitted ? 'submitted' : 'pending')
    } catch (error) {
      console.error('Error checking availability status:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/')
  }

  const handleAvailabilitySubmit = (unavailableShifts) => {
    // שמירה זמנית ב-localStorage (בעתיד נשלח לשרת)
    localStorage.setItem(`availability_${user.id}`, JSON.stringify({
      unavailableShifts,
      submittedAt: new Date().toISOString()
    }))
    
    setAvailabilityStatus('submitted')
    setShowAvailabilityForm(false)
  }

  if (!user) {
    return <div className="p-4">טוען...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">שלום {user.name}</h1>
              <p className="text-sm text-gray-600">דף חייל - מערכת ניהול משמרות</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              יציאה
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* המשמרות שלי */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📅 המשמרות שלי השבוע</h2>
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-blue-900">ראשון - ש.ג</p>
                    <p className="text-sm text-blue-700">07:00 - 13:00</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    מחר
                  </span>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-green-900">רביעי - סייר</p>
                    <p className="text-sm text-green-700">19:00 - 01:00</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    בעוד 3 ימים
                  </span>
                </div>
              </div>
              
              <div className="text-center py-8 text-gray-500">
                <p>🎯 סה״כ השבוע: 2 משמרות</p>
              </div>
            </div>
          </div>

          {/* זמינות */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">⏰ זמינות למשמרות</h2>
            
            {availabilityStatus === 'pending' ? (
              <>
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">⚠️</span>
                    </div>
                    <div className="mr-3">
                      <p className="text-sm font-medium text-yellow-800">
                        נדרש מילוי זמינות לשבוע הבא
                      </p>
                      <p className="text-sm text-yellow-700">
                        המועד האחרון: יום חמישי 23:59
                      </p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowAvailabilityForm(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  📝 מלא זמינות לשבוע הבא
                </button>
              </>
            ) : (
              <>
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">✅</span>
                    </div>
                    <div className="mr-3">
                      <p className="text-sm font-medium text-green-800">
                        זמינות נשלחה בהצלחה!
                      </p>
                      <p className="text-sm text-green-700">
                        נשלח: {new Date().toLocaleDateString('he-IL')}
                      </p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowAvailabilityForm(true)}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  👁️ צפה/ערוך זמינות
                </button>
              </>
            )}
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                זמינות נוכחית: 
                <span className={`font-medium ${availabilityStatus === 'submitted' ? 'text-green-600' : 'text-orange-600'}`}>
                  {availabilityStatus === 'submitted' ? ' נשלחה ✓' : ' טרם נשלחה ⏳'}
                </span>
              </p>
            </div>
          </div>

          {/* לוח משמרות כללי */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 לוח משמרות השבוע</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">יום</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">בוקר (07-13)</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">צהרים (13-19)</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ערב (19-01)</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">לילה (01-07)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">ראשון</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">משה לוי</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">דוד כהן</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">שני</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">דוד כהן</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">משה לוי</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.name}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">שלישי</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">משה לוי</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">דוד כהן</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">רביעי</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">דוד כהן</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">משה לוי</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                המשמרות שלך מסומנות ב<span className="text-blue-600 font-medium">כחול</span>
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* Availability Form Modal */}
      {showAvailabilityForm && (
        <AvailabilityForm
          userId={user.id}
          onClose={() => setShowAvailabilityForm(false)}
          onSubmit={handleAvailabilitySubmit}
        />
      )}
    </div>
  )
}

export default SoldierDashboard