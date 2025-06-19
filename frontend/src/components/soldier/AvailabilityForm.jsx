import React, { useState, useEffect } from 'react'

const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
const TIME_SLOTS = [
  { id: 0, name: 'בוקר', hours: '07:00-13:00' },
  { id: 1, name: 'צהרים', hours: '13:00-19:00' },
  { id: 2, name: 'ערב', hours: '19:00-01:00' },
  { id: 3, name: 'לילה', hours: '01:00-07:00' }
]

// 3 סטטוסים של משמרות
const SHIFT_STATUS = {
  NEUTRAL: 'neutral',     // אדיש - יכול אבל אין העדפה מיוחדת
  PREFERRED: 'preferred', // מעדיף לעשות
  UNAVAILABLE: 'unavailable' // לא יכול
}

function AvailabilityForm({ userId, onClose, onSubmit }) {
  const [shiftPreferences, setShiftPreferences] = useState(new Map()) // Map של day_timeSlot -> status
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [currentMode, setCurrentMode] = useState(SHIFT_STATUS.UNAVAILABLE) // מצב הבחירה הנוכחי

  const maxUnavailable = 7 // מקסימום משמרות לא זמין

  // חישוב כמות לכל סוג
  const getCountByStatus = (status) => {
    return Array.from(shiftPreferences.values()).filter(s => s === status).length
  }

  // פונקציה לטיפול בלחיצה על תא
  const handleCellClick = (day, timeSlot) => {
    if (submitted) return

    const shiftKey = `${day}_${timeSlot}`
    const currentStatus = shiftPreferences.get(shiftKey) || SHIFT_STATUS.NEUTRAL
    const newPreferences = new Map(shiftPreferences)

    let nextStatus

    // אם יש מצב נבחר במעלה (שונה מנייטרלי), השתמש בו
    if (currentMode !== SHIFT_STATUS.NEUTRAL) {
      // אם המצב הנוכחי זהה למצב שנבחר, חזור לנויטרלי
      if (currentStatus === currentMode) {
        nextStatus = SHIFT_STATUS.NEUTRAL
      } else {
        nextStatus = currentMode
      }
    } else {
      // אם לא נבחר מצב ספציפי, עבור מחזורית
      if (currentStatus === SHIFT_STATUS.NEUTRAL) {
        nextStatus = SHIFT_STATUS.UNAVAILABLE
      } else if (currentStatus === SHIFT_STATUS.UNAVAILABLE) {
        nextStatus = SHIFT_STATUS.PREFERRED
      } else if (currentStatus === SHIFT_STATUS.PREFERRED) {
        nextStatus = SHIFT_STATUS.NEUTRAL
      }
    }

    // בדיקה אם מנסים להוסיף יותר מ-7 לא זמין
    if (nextStatus === SHIFT_STATUS.UNAVAILABLE) {
      const currentUnavailable = getCountByStatus(SHIFT_STATUS.UNAVAILABLE)
      if (currentUnavailable >= maxUnavailable && currentStatus !== SHIFT_STATUS.UNAVAILABLE) {
        alert(`ניתן לסמן עד ${maxUnavailable} משמרות כלא זמין`)
        return
      }
    }

    // עדכון המצב החדש
    if (nextStatus === SHIFT_STATUS.NEUTRAL) {
      newPreferences.delete(shiftKey) // נייטרלי = אין ברשימה
    } else {
      newPreferences.set(shiftKey, nextStatus)
    }

    setShiftPreferences(newPreferences)
  }

  // פונקציה לשליחת הזמינות
  const handleSubmit = async () => {
    setLoading(true)
    
    try {
      // המרת Map למבנה עבור השליחה
      const preferences = {
        unavailable: [],
        preferred: [],
        neutral: []
      }

      // כל המשמרות שלא צוינו הן neutral
      for (let day = 0; day < 7; day++) {
        for (let timeSlot = 0; timeSlot < 4; timeSlot++) {
          const shiftKey = `${day}_${timeSlot}`
          const status = shiftPreferences.get(shiftKey) || SHIFT_STATUS.NEUTRAL
          
          const shiftData = { day, timeSlot }
          
          if (status === SHIFT_STATUS.UNAVAILABLE) {
            preferences.unavailable.push(shiftData)
          } else if (status === SHIFT_STATUS.PREFERRED) {
            preferences.preferred.push(shiftData)
          } else {
            preferences.neutral.push(shiftData)
          }
        }
      }

      console.log('Submitting availability to server:', preferences)

      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          week: getCurrentWeek(),
          preferences
        })
      })

      const result = await response.json()

      if (response.ok) {
        console.log('Availability saved successfully:', result)
        setSubmitted(true)
        onSubmit && onSubmit(preferences)
      } else {
        console.error('Server error:', result)
        alert(result.error || 'שגיאה בשליחת הזמינות')
      }
    } catch (error) {
      console.error('Error submitting availability:', error)
      alert('שגיאה בחיבור לשרת')
    } finally {
      setLoading(false)
    }
  }

  // פונקציה לקבלת שבוע נוכחי
  const getCurrentWeek = () => {
    const now = new Date()
    const monday = new Date(now.setDate(now.getDate() - now.getDay() + 1))
    return monday.toISOString().split('T')[0]
  }

  // פונקציה לקבלת סטייל התא
  const getCellStyle = (day, timeSlot) => {
    const shiftKey = `${day}_${timeSlot}`
    const status = shiftPreferences.get(shiftKey) || SHIFT_STATUS.NEUTRAL
    const isWeekend = day === 6 // שבת
    
    let baseStyle = "h-20 border-2 text-center cursor-pointer transition-all duration-200 flex items-center justify-center text-sm font-medium relative "
    
    if (submitted) {
      baseStyle += "cursor-not-allowed "
    }

    // סטייל לפי סטטוס
    switch (status) {
      case SHIFT_STATUS.UNAVAILABLE:
        return baseStyle + "bg-red-100 border-red-400 text-red-800 hover:bg-red-200"
      case SHIFT_STATUS.PREFERRED:
        return baseStyle + "bg-green-100 border-green-400 text-green-800 hover:bg-green-200"
      default: // NEUTRAL
        if (isWeekend) {
          return baseStyle + "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
        } else {
          return baseStyle + "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
        }
    }
  }

  // פונקציה לקבלת תוכן התא
  const getCellContent = (day, timeSlot) => {
    const shiftKey = `${day}_${timeSlot}`
    const status = shiftPreferences.get(shiftKey) || SHIFT_STATUS.NEUTRAL
    
    const icons = {
      [SHIFT_STATUS.UNAVAILABLE]: { icon: '❌', text: 'לא יכול' },
      [SHIFT_STATUS.PREFERRED]: { icon: '⭐', text: 'מעדיף' },
      [SHIFT_STATUS.NEUTRAL]: { icon: '➖', text: 'אדיש' }
    }
    
    const { icon, text } = icons[status]
    
    return (
      <div className="text-center">
        <div className="text-2xl mb-1">{icon}</div>
        <div className="text-xs leading-tight">{text}</div>
      </div>
    )
  }

  if (submitted) {
    const unavailableCount = getCountByStatus(SHIFT_STATUS.UNAVAILABLE)
    const preferredCount = getCountByStatus(SHIFT_STATUS.PREFERRED)
    const neutralCount = 28 - unavailableCount - preferredCount // 7 ימים * 4 משמרות

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-green-600 mb-4">זמינות נשלחה בהצלחה!</h3>
            
            <div className="text-right space-y-2 mb-4 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span>❌ לא יכול:</span>
                <span className="font-bold text-red-600">{unavailableCount} משמרות</span>
              </div>
              <div className="flex justify-between items-center">
                <span>⭐ מעדיף:</span>
                <span className="font-bold text-green-600">{preferredCount} משמרות</span>
              </div>
              <div className="flex justify-between items-center">
                <span>➖ אדיש:</span>
                <span className="font-bold text-gray-600">{neutralCount} משמרות</span>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              סגור
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">📅 מילוי זמינות לשבוע הבא</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Mode Selector */}
        <div className="p-6 bg-blue-50 border-b">
          <div className="mb-4">
            <h3 className="font-medium text-blue-900 mb-3">🎯 בחר מה לסמן:</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setCurrentMode(SHIFT_STATUS.UNAVAILABLE)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  currentMode === SHIFT_STATUS.UNAVAILABLE
                    ? 'border-red-400 bg-red-100 text-red-800'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-red-200'
                }`}
              >
                <div className="text-2xl mb-1">❌</div>
                <div className="font-medium">לא יכול</div>
                <div className="text-xs">עד {maxUnavailable} משמרות</div>
              </button>
              
              <button
                onClick={() => setCurrentMode(SHIFT_STATUS.PREFERRED)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  currentMode === SHIFT_STATUS.PREFERRED
                    ? 'border-green-400 bg-green-100 text-green-800'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-green-200'
                }`}
              >
                <div className="text-2xl mb-1">⭐</div>
                <div className="font-medium">מעדיף לעשות</div>
                <div className="text-xs">משמרות רצויות</div>
              </button>
              
              <button
                onClick={() => setCurrentMode(SHIFT_STATUS.NEUTRAL)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  currentMode === SHIFT_STATUS.NEUTRAL
                    ? 'border-gray-400 bg-gray-100 text-gray-800'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">➖</div>
                <div className="font-medium">אדיש</div>
                <div className="text-xs">יכול אבל לא מעדיף</div>
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-lg font-bold text-red-600">
                {getCountByStatus(SHIFT_STATUS.UNAVAILABLE)}/{maxUnavailable}
              </div>
              <div className="text-xs text-red-700">לא יכול</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {getCountByStatus(SHIFT_STATUS.PREFERRED)}
              </div>
              <div className="text-xs text-green-700">מעדיף</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-lg font-bold text-gray-600">
                {28 - getCountByStatus(SHIFT_STATUS.UNAVAILABLE) - getCountByStatus(SHIFT_STATUS.PREFERRED)}
              </div>
              <div className="text-xs text-gray-700">אדיש</div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-yellow-50 border-b">
          <div className="flex items-start space-x-3 rtl:space-x-reverse">
            <div className="text-2xl">💡</div>
            <div className="text-sm">
              <strong>שתי דרכי עבודה:</strong>
              <br/>
              <strong>1. בחירת מצב:</strong> בחר מצב מעלה ⬆️ ואז לחץ על המשמרות - כל לחיצה תעבור למצב הנבחר
              <br/>
              <strong>2. מעבר מחזורי:</strong> לחץ על כפתור "אדיש" מעלה ⬆️ ואז לחץ על משמרות - 
              <span className="font-medium"> אדיש ➜ לא יכול ➜ מעדיף ➜ אדיש</span>
            </div>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="p-3 text-right font-medium text-gray-700 w-24">משמרת</th>
                  {DAYS.map((day, dayIndex) => (
                    <th key={dayIndex} className={`p-3 text-center font-medium ${dayIndex === 6 ? 'text-purple-600' : 'text-gray-700'}`}>
                      <div className="font-bold">{day}</div>
                      <div className="text-xs text-gray-500 font-normal">
                        {new Date(Date.now() + dayIndex * 24 * 60 * 60 * 1000).getDate()}/{new Date(Date.now() + dayIndex * 24 * 60 * 60 * 1000).getMonth() + 1}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((timeSlot) => (
                  <tr key={timeSlot.id}>
                    <td className="p-3 font-medium text-gray-700 bg-gray-50">
                      <div className="font-bold">{timeSlot.name}</div>
                      <div className="text-xs text-gray-500">{timeSlot.hours}</div>
                    </td>
                    {DAYS.map((_, dayIndex) => (
                      <td key={dayIndex} className="p-1">
                        <div
                          className={getCellStyle(dayIndex, timeSlot.id)}
                          onClick={() => handleCellClick(dayIndex, timeSlot.id)}
                        >
                          {getCellContent(dayIndex, timeSlot.id)}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {getCountByStatus(SHIFT_STATUS.UNAVAILABLE) === maxUnavailable && (
              <span className="text-orange-600 font-medium">
                ⚠️ הגעת למקסימום משמרות לא זמין ({maxUnavailable})
              </span>
            )}
          </div>
          <div className="space-x-3 rtl:space-x-reverse">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              ביטול
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg font-medium"
            >
              {loading ? 'שולח...' : 'שלח זמינות'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AvailabilityForm