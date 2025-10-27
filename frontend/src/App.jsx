import { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import Header from './components/Header';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

function App() {
  const [serverStatus, setServerStatus] = useState('Checking...')
  const [userCount, setUserCount] = useState(0)
  const [users, setUsers] = useState([])
  const galleryRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScrollButtons = () => {
    if (galleryRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = galleryRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  const scrollGallery = (direction) => {
    if (galleryRef.current) {
      const scrollAmount = 400 // Scroll by 400px
      galleryRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
      // Check after scrolling
      setTimeout(checkScrollButtons, 300)
    }
  }

  useEffect(() => {
    checkScrollButtons()
    if (galleryRef.current) {
      galleryRef.current.addEventListener('scroll', checkScrollButtons)
      return () => {
        if (galleryRef.current) {
          galleryRef.current.removeEventListener('scroll', checkScrollButtons)
        }
      }
    }
  }, [])

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
    <div className="app-container">
      {/* Header */}
      <Header buttons={[
        { path: '/signup', label: 'Sign Up' },
        { path: '/login', label: 'Login' }
      ]} />

      {/* Main Content */}
      <div>
        {/* Welcome Section */}
        <section className="welcome-section">
          <div className="welcome-content">
            <h2 className="welcome-heading">
              Welcome to  <span className="italic-logo"  style={{ fontFamily: "Kapakana, cursive", fontSize: "75px"}} >  Plotline</span>.
            </h2>
            <p className="welcome-text">
              Reading doesn't have to be a solo journey. Plotline is the community-driven platform built for readers and book clubs. Here stories spark real conversations and connections.
            </p>
          </div>
        </section>

        {/* Hero Section with Background */}
        <section className="hero-section">
          <div>
            <div className="hero-content">
              <h1 className="hero-text">
                Read Together.
              </h1>
              <h1 className="hero-text">
                Talk Together.
              </h1>
              <h1 className="hero-text">
                Grow Together.
              </h1>
            </div>
          </div>
        </section>

        {/* Features Gallery Section */}
        <section className="features-section">
          <div className="features-container">
            <h2 className="features-title">
              What We Have to Offer
            </h2>
            <div className="gallery-wrapper">
              {/* Left Arrow */}
              {canScrollLeft && (
                <button
                  onClick={() => scrollGallery('left')}
                  className="gallery-arrow gallery-arrow-left"
                  aria-label="Scroll left"
                >
                  <svg className="gallery-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              <div ref={galleryRef} className="gallery-scroll">
              {/* Card 1: Join or Create Book Clubs */}
              <div className="feature-card">
                <div className="feature-card-content">
                  <h3 className="feature-card-title">
                    Join or Create Book Clubs
                  </h3>
                  <p className="feature-card-text">
                    Connect with readers by genre, author, or title in public or private clubs
                  </p>
                </div>
              </div>

              {/* Card 2: Chat in Real Time */}
              <div className="feature-card">
                <div className="feature-card-content">
                  <h3 className="feature-card-title">
                    Chat in Real Time
                  </h3>
                  <p className="feature-card-text">
                    Share quick reactions, recommendations, and casual discussions through live chat
                  </p>
                </div>
              </div>

              {/* Card 3: Dive into Structured Threads */}
              <div className="feature-card">
                <div className="feature-card-content">
                  <h3 className="feature-card-title">
                    Dive into Structured Threads
                  </h3>
                  <p className="feature-card-text">
                    Stay on track with organized discussions by chapters, themes, and questions
                  </p>
                </div>
              </div>

              {/* Card 4: Showcase Your Bookshelf */}
              <div className="feature-card">
                <div className="feature-card-content">
                  <h3 className="feature-card-title">
                    Showcase Your Bookshelf
                  </h3>
                  <p className="feature-card-text">
                    Share your reading journey with a visual timeline of current and past reads, ratings, and favorites
                  </p>
                </div>
              </div>

              {/* Card 5: Build Connections */}
              <div className="feature-card">
                <div className="feature-card-content">
                  <h3 className="feature-card-title">
                    Build Connections
                  </h3>
                  <p className="feature-card-text">
                    Add friends, comment, react, and keep the conversation going beyond the book club
                  </p>
                </div>
              </div>
              </div>

              {/* Right Arrow */}
              {canScrollRight && (
                <button
                  onClick={() => scrollGallery('right')}
                  className="gallery-arrow gallery-arrow-right"
                  aria-label="Scroll right"
                >
                  <svg className="gallery-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="cta-section">
          <div className="cta-container">
            <p className="cta-text">
              Unlike Goodreads, Reddit, or Discord alone, Plotline combines the best of all three: real-time chats, structured book discussions, and a personalized bookshelf, all into one space made just for readers
            </p>
            <p className="cta-text cta-text-last">
              Whether you're a casual reader, a classroom club, or part of a niche genre community, Plotline is where your love of books finds a home
            </p>
            <Link to="/signup" className="cta-button">
              Get Started- it's free!
            </Link>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <div className="app-footer-content">
          <p className="app-footer-text">&copy; 2025 Plotline brought to you by ROTOM Corporation</p>
        </div>
      </footer>
    </div>
  )
}

export default App
