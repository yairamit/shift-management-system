import React, { useState, useEffect } from 'react'

const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
const TIME_SLOTS = [
  { id: 0, name: 'בוקר', hours: '07:00-13:00' },
  { id: 1, name: 'צהרים', hours: '13:00-19:00' },
  { id: 2, name: 'ערב', hours: '19:00-01:00' },
  { id: 3, name: 'לילה', hours: '01:00-07:00' }
]

const TASKS = [
  { id: 'sg', name: 'ש.ג', slots: 1 },
  { id: 'patrol', name: 'סייר', slots: 1 },
  { id: 'patrol4h', name: 'סייר 4 שעות', slots: 1 }
]

function ShiftEditor({ soldiers, onSave }) {
  const [shifts, setShifts] = useState({}) // key: "taskId_day_timeSlot", value: soldierName
  const [selectedCell, setSelectedCell] = useState(null) // { taskId, day, timeSlot }
  const [showSoldierPicker, setShowSoldierPicker] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // טעינת נתונים מהשרת
  useEffect(() => {
    loadShifts()
  }, [])

  // פונקציה לקבלת שבוע נוכחי
  const getCurrentWeek = () => {
    const now = new Date()
    const monday = new Date(now.setDate(now.getDate() - now.getDay() + 1))
    return monday.toISOString().split('T')[0]
  }

  // טעינת משמרות מהשרת
  const loadShifts = async () => {
    try {
      setLoading(true)
      const week = getCurrentWeek()
      console.log('Loading shifts for week:', week)
      
      const response = await fetch(`/api/shifts/${week}`)
      const weekShifts = await response.json()
      
      console.log('Loaded shifts from server:', weekShifts)
      
      // המרה לפורמט של הקומפוננט
      const shiftsMap = {}
      weekShifts.forEach(shift => {
        shiftsMap[shift.id] = shift.soldierName
      })
      
      setShifts(shiftsMap)
    } catch (error) {
      console.error('Error loading shifts:', error)
      // אם יש שגיאה, נשאיר את המערכת עם נתונים ריקים
    } finally {
      setLoading(false)
    }
  }

  // פונקציה לטיפול בלחיצה על תא
  const handleCellClick = (taskId, day, timeSlot) => {
    setSelectedCell({ taskId, day, timeSlot })
    setShowSoldierPicker(true)
  }

  // פונקציה לבחירת חייל
  const handleSoldierSelect = (soldierName) => {
    if (!selectedCell) return

    const { taskId, day, timeSlot } = selectedCell
    const shiftKey = `${taskId}_${day}_${timeSlot}`
    
    const newShifts = { ...shifts }
    
    if (soldierName === 'remove') {
      delete newShifts[shiftKey]
    } else {
      newShifts[shiftKey] = soldierName
    }
    
    setShifts(newShifts)
    setHasChanges(true)
    setShowSoldierPicker(false)
    setSelectedCell(null)
  }

  // פונקציה לשמירת השינויים
  const handleSave = async () => {
    try {
      setSaving(true)
      const week = getCurrentWeek()
      
      console.log('Saving shifts to server:', shifts)
      
      const response = await fetch('/api/shifts/save-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          week,
          shiftAssignments: shifts
        })
      })
      
      const result = await response.json()
      
      if (response.ok) {
        console.log('Shifts saved successfully:', result)
        setHasChanges(false)
        onSave && onSave(shifts)
        alert(`✅ השינויים נשמרו בהצלחה! (${result.shiftsCount} משמרות)`)
      } else {
        console.error('Server error:', result)
        alert(`❌ ${result.error || 'שגיאה בשמירת השינויים'}`)
      }
    } catch (error) {
      console.error('Error saving shifts:', error)
      alert('❌ שגיאה בחיבור לשרת')
    } finally {
      setSaving(false)
    }
  }

  // פונקציה לשיבוץ אוטומטי
  const handleAutoAssign = async () => {
    if (!confirm('האם לבצע שיבוץ אוטומטי? הפעולה תחליף את השיבוץ הנוכחי.')) {
      return
    }

    try {
      setSaving(true)
      const week = getCurrentWeek()
      
      console.log('Starting auto assignment for week:', week)
      
      const response = await fetch('/api/shifts/auto-assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ week })
      })
      
      const result = await response.json()
      
      if (response.ok) {
        console.log('Auto assignment completed:', result)
        setShifts(result.assignments || {})
        setHasChanges(true)
        alert(`🎯 שיבוץ אוטומטי הושלם! ${result.assignedShifts} משמרות שובצו`)
      } else {
        console.error('Auto assignment error:', result)
        alert(`❌ ${result.error || 'שגיאה בשיבוץ אוטומטי'}`)
      }
    } catch (error) {
      console.error('Error in auto assignment:', error)
      alert('❌ שגיאה בחיבור לשרת')
    } finally {
      setSaving(false)
    }
  }

  // פונקציה לקבלת שם החייל במשמרת
  const getAssignedSoldier = (taskId, day, timeSlot) => {
    const shiftKey = `${taskId}_${day}_${timeSlot}`
    return shifts[shiftKey] || null
  }

  // פונקציה לקבלת סטייל התא
  const getCellStyle = (taskId, day, timeSlot, assignedSoldier) => {
    const isWeekend = day === 6
    let baseStyle = "h-12 border border-gray-300 text-center cursor-pointer transition-all duration-200 flex items-center justify-center text-xs font-medium "
    
    if (assignedSoldier) {
      if (isWeekend) {
        return baseStyle + "bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200"
      } else {
        return baseStyle + "bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200"
      }
    } else {
      if (isWeekend) {
        return baseStyle + "bg-purple-25 border-purple-200 text-purple-600 hover:bg-purple-50 border-dashed"
      } else {
        return baseStyle + "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 border-dashed"
      }
    }
  }

  // פונקציה לספירת משמרות לכל חייל
  const getSoldierStats = () => {
    const stats = {}
    
    soldiers.forEach(soldier => {
      stats[soldier.name] = 0
    })
    
    Object.values(shifts).forEach(soldierName => {
      if (stats[soldierName] !== undefined) {
        stats[soldierName]++
      }
    })
    
    return stats
  }

  const soldierStats = getSoldierStats()

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">טוען משמרות...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">📅 עריכת לוח משמרות</h3>
          <p className="text-sm text-gray-600">לחץ על תא כדי לשבץ או להסיר חייל</p>
        </div>
        
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          {hasChanges && (
            <span className="text-orange-600 text-sm font-medium">⚠️ יש שינויים לא שמורים</span>
          )}
          <button
            onClick={handleAutoAssign}
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {saving ? '🔄 מבצע...' : '🎯 שיבוץ אוטומטי'}
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {saving ? '💾 שומר...' : '💾 שמור שינויים'}
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">📊 התפלגות משמרות</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {soldiers.map(soldier => (
            <div key={soldier.id} className="flex items-center justify-between p-2 bg-white rounded border">
              <span className="text-sm font-medium">{soldier.name}</span>
              <span className={`text-sm font-bold ${
                soldierStats[soldier.name] === 0 ? 'text-red-600' :
                soldierStats[soldier.name] <= 2 ? 'text-orange-600' :
                soldierStats[soldier.name] <= 4 ? 'text-green-600' : 'text-blue-600'
              }`}>
                {soldierStats[soldier.name]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-3 text-right font-medium text-gray-700 bg-gray-50">משימה</th>
              {DAYS.map((day, dayIndex) => (
                <th key={dayIndex} className={`p-3 text-center font-medium bg-gray-50 ${dayIndex === 6 ? 'text-purple-600' : 'text-gray-700'}`}>
                  <div className="font-bold">{day}</div>
                  <div className="text-xs text-gray-500 font-normal">
                    {new Date(Date.now() + dayIndex * 24 * 60 * 60 * 1000).getDate()}/{new Date(Date.now() + dayIndex * 24 * 60 * 60 * 1000).getMonth() + 1}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TASKS.map(task => 
              TIME_SLOTS.map(timeSlot => (
                <tr key={`${task.id}_${timeSlot.id}`} className="border-t">
                  <td className="p-3 font-medium text-gray-700 bg-gray-50 border-r">
                    <div className="font-bold">{task.name}</div>
                    <div className="text-xs text-gray-500">{timeSlot.name} - {timeSlot.hours}</div>
                  </td>
                  {DAYS.map((_, dayIndex) => {
                    const assignedSoldier = getAssignedSoldier(task.id, dayIndex, timeSlot.id)
                    return (
                      <td key={dayIndex} className="p-1">
                        <div
                          className={getCellStyle(task.id, dayIndex, timeSlot.id, assignedSoldier)}
                          onClick={() => handleCellClick(task.id, dayIndex, timeSlot.id)}
                          title={assignedSoldier ? `${assignedSoldier} - לחץ לשינוי` : 'לחץ להוספת חייל'}
                        >
                          {assignedSoldier ? (
                            <span className="truncate px-1">{assignedSoldier.split(' ')[0]}</span>
                          ) : (
                            <span className="text-gray-400">+ הוסף</span>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Soldier Picker Modal */}
      {showSoldierPicker && selectedCell && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">בחר חייל למשמרת</h3>
              <p className="text-sm text-gray-600">
                {TASKS.find(t => t.id === selectedCell.taskId)?.name} - {DAYS[selectedCell.day]} - {TIME_SLOTS[selectedCell.timeSlot]?.name}
              </p>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {/* אפשרות הסרה אם יש חייל משובץ */}
              {getAssignedSoldier(selectedCell.taskId, selectedCell.day, selectedCell.timeSlot) && (
                <button
                  onClick={() => handleSoldierSelect('remove')}
                  className="w-full p-3 text-right rounded-lg border-2 border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                >
                  🗑️ הסר חייל מהמשמרת
                </button>
              )}
              
              {/* רשימת חיילים */}
              {soldiers.map(soldier => (
                <button
                  key={soldier.id}
                  onClick={() => handleSoldierSelect(soldier.name)}
                  className="w-full p-3 text-right rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{soldier.name}</span>
                    <span className="text-sm text-gray-600">
                      {soldierStats[soldier.name]} משמרות
                    </span>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setShowSoldierPicker(false)
                  setSelectedCell(null)
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ShiftEditor