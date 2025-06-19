import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import SoldierDashboard from './pages/SoldierDashboard'
import ManagerDashboard from './pages/ManagerDashboard'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/soldier" element={<SoldierDashboard />} />
          <Route path="/manager" element={<ManagerDashboard />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
