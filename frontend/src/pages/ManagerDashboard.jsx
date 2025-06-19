import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import ShiftEditor from '../components/manager/ShiftEditor'

function ManagerDashboard() {
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const navigate = useNavigate()

  useEffect(() => {
    // בדיקת הרשאות מנהל
    const userData = localStorage.getItem('user')
    if (!userData) {
      navigate('/')
      return
    }
    
    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== 'manager') {
      navigate('/')
      return
    }
    
    setUser(parsedUser)
    loadUsers()
  }, [navigate])

  const loadUsers = async () => {
    try {
      const result = await api.getUsers()
      setUsers(result || [])
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/')
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">טוען נתונים...</p>
        </div>
      </div>
    )
  }

  const soldiers = users.filter(u => u.role === 'soldier')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">שלום {user.name}</h1>
              <p className="text-sm text-gray-600">ממשק מנהל - מערכת ניהול משמרות</p>
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

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 rtl:space-x-reverse">
            {[
              { id: 'overview', name: '📊 סקירה כללית' },
              { id: 'schedule', name: '📅 ניהול משמרות' },
              { id: 'soldiers', name: '👥 ניהול חיילים' },
              { id: 'availability', name: '⏰ זמינות חיילים' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* סטטיסטיקות */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-3xl">👥</span>
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-500">חיילים במערכת</p>
                    <p className="text-2xl font-semibold text-gray-900">{soldiers.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-3xl">📅</span>
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-500">משמרות השבוע</p>
                    <p className="text-2xl font-semibold text-gray-900">18/28</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-3xl">✅</span>
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-500">שלחו זמינות</p>
                    <p className="text-2xl font-semibold text-gray-900">{Math.floor(soldiers.length * 0.8)}/{soldiers.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-3xl">📊</span>
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-500">אחוז כיסוי</p>
                    <p className="text-2xl font-semibold text-green-600">64%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* פעולות מהירות */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">⚡ פעולות מהירות</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center transition-colors">
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="font-medium">שיבוץ אוטומטי</div>
                  <div className="text-sm opacity-90">בצע שיבוץ חכם למשמרות</div>
                </button>
                
                <button className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-center transition-colors">
                  <div className="text-2xl mb-2">📢</div>
                  <div className="font-medium">שלח תזכורות</div>
                  <div className="text-sm opacity-90">תזכיר לחיילים למלא זמינות</div>
                </button>
                
                <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-center transition-colors">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="font-medium">צור דוח</div>
                  <div className="text-sm opacity-90">דוח סיכום שבועי</div>
                </button>
              </div>
            </div>

            {/* התפלגות משמרות */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">📈 התפלגות משמרות לפי חייל</h3>
              <div className="space-y-4">
                {soldiers.map(soldier => (
                  <div key={soldier.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                        {soldier.name.charAt(0)}
                      </div>
                      <span className="mr-3 font-medium">{soldier.name}</span>
                    </div>
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      <div className="text-sm text-gray-600">
                        {Math.floor(Math.random() * 8) + 2} משמרות
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.floor(Math.random() * 60) + 40}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <ShiftEditor 
            soldiers={soldiers}
            onSave={(shifts) => {
              console.log('Shifts saved:', shifts)
              // כאן נוסיף טיפול בשמירה
            }}
          />
        )}

        {activeTab === 'soldiers' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">👥 ניהול חיילים</h3>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                + הוסף חייל
              </button>
            </div>
            
            <div className="space-y-4">
              {soldiers.map(soldier => (
                <div key={soldier.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                      {soldier.name.charAt(0)}
                    </div>
                    <div className="mr-3">
                      <p className="font-medium">{soldier.name}</p>
                      <p className="text-sm text-gray-600">{soldier.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      פעיל
                    </span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      ערוך
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'availability' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">⏰ סטטוס זמינות חיילים</h3>
            <div className="space-y-4">
              {soldiers.map(soldier => (
                <div key={soldier.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                      {soldier.name.charAt(0)}
                    </div>
                    <div className="mr-3">
                      <p className="font-medium">{soldier.name}</p>
                      <p className="text-sm text-gray-600">לשבוע הבא</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    {Math.random() > 0.2 ? (
                      <>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          ✓ נשלח
                        </span>
                        <span className="text-sm text-gray-600">
                          {Math.floor(Math.random() * 5) + 1} לא זמין
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                          ⏳ ממתין
                        </span>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          שלח תזכורת
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default ManagerDashboard