import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

function App() {
  const [serverStatus, setServerStatus] = useState('Checking...')
  const [userCount, setUserCount] = useState(0)
  const [users, setUsers] = useState([])

  // Test backend connection function
  const testConnection = async () => {
    console.log('🔄 Click me button pressed - testing connection...')
    
    try {
      // Test database connection
      console.log('📡 Testing database connection...')
      const dbRes = await fetch(`${API_BASE}/api/db-test`)
      if (!dbRes.ok) {
        throw new Error(`DB test failed: ${dbRes.status}`)
      }
      const dbData = await dbRes.json()
      console.log('✅ Database connection response:', dbData)
      setServerStatus(dbData.status)
      setUserCount(dbData.userCount)

      // Fetch all users
      console.log('👥 Fetching all users...')
      const usersRes = await fetch(`${API_BASE}/api/users`)
      if (!usersRes.ok) {
        throw new Error(`Fetch users failed: ${usersRes.status}`)
      }
      const usersData = await usersRes.json()
      console.log('✅ Users fetched successfully:', usersData)
      setUsers(usersData)
      
    } catch (error) {
      console.error('❌ Connection failed:', error)
      setServerStatus('Backend not connected')
      setUsers([])
    }
  }

  useEffect(() => {
    // Only set initial state, don't auto-test connection
    setServerStatus('')
    setUserCount(0)
    setUsers([])
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="text-white" style={{ backgroundColor: '#774C30' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="text-6xl md:text-8xl italic" style={{ fontFamily: 'Kapakana, cursive' }}>
              Plotline
            </div>
            <div className="space-x-4">
              <Link 
                to="/signup"
                className="text-gray-800 px-4 py-2 rounded border border-gray-400 hover:opacity-80 transition-opacity" 
                style={{ fontFamily: 'Times New Roman, serif', backgroundColor: '#D9D9D9' }}
              >
                Sign Up
              </Link>
              <Link
              to="/login"
              className="text-gray-800 px-4 py-2 rounded border border-gray-400 hover:opacity-80 transition-opacity" 
              style={{ fontFamily: 'Times New Roman, serif', backgroundColor: '#D9D9D9' }}
              >
                Login
              </Link>
            </div>
          </div>
        </div>
        <div className="h-1 bg-blue-400"></div>
      </header>

      {/* Main Content */}
      <div className="flex-grow bg-amber-50">
        {/* Welcome Section */}
        <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
              Welcome to <span className="italic" style={{ fontFamily: 'Kapakana, cursive' }}>Plotline</span>.
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto mb-8" style={{ fontFamily: 'Times New Roman, serif' }}>
              Reading doesn't have to be a solo journey. Plotline is the community-driven platform built for readers and book clubs. Here stories spark real conversations and connections.
            </p>
            
            {/* Database Test Button */}
            <button 
              onClick={testConnection}
              className="text-gray-800 font-medium py-3 px-6 rounded-lg border border-gray-400 hover:opacity-80 transition-opacity mb-4"
              style={{ fontFamily: 'Times New Roman, serif', backgroundColor: '#D9D9D9' }}
            >
              Click me
            </button>
            
            {/* Display Results */}
            {serverStatus && serverStatus !== '' && (
              <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Database Status
                </h3>
                <div className="space-y-3">
                  <p className="text-sm text-gray-700" style={{ fontFamily: 'Times New Roman, serif' }}>
                    <span className="font-medium">Server:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      serverStatus.includes('successfully')
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {serverStatus}
                    </span>
                  </p>
                  <p className="text-sm text-gray-700" style={{ fontFamily: 'Times New Roman, serif' }}>
                    <span className="font-medium">Users in database:</span> {userCount}
                  </p>
                  
                  {/* Display Users */}
                  {users.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-md font-semibold mb-3 text-gray-800" style={{ fontFamily: 'Times New Roman, serif' }}>
                        Users in Database:
                      </h4>
                      <div className="space-y-2">
                        {users.map((user, index) => (
                          <div key={user.id} className="text-sm text-gray-700 p-2 bg-gray-50 rounded border-l-4 border-blue-400" style={{ fontFamily: 'Times New Roman, serif' }}>
                            <span className="font-medium">{user.name}</span> — {user.email}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      </div>

      {/* Footer */}
      <footer className="text-white py-8" style={{ backgroundColor: '#774C30' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p style={{ fontFamily: 'Times New Roman, serif' }}>&copy; 2025 Plotline brought to you by ROTOM Corporation</p>
        </div>
      </footer>
    </div>
  )
}

export default App
