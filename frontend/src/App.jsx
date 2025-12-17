import { Link } from "react-router-dom";
import Header from './components/Header';
import bookIllustration from './assets/book-illustration.png';
import './App.css';

function App() {
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
          <div className="welcome-container">
            <div className="welcome-content">
              <h2 className="welcome-heading">
                Welcome to <span className="italic-logo" style={{ fontFamily: "Dancing Script, cursive", fontSize: "75px" }}>Plotline</span>.
              </h2>
              <p className="welcome-text">
                Reading doesn't have to be a solo journey. Plotline is the community-driven platform built for readers and book clubs. Here stories spark real conversations and connections.
              </p>
              <Link to="/signup" className="welcome-button">
                Get Started
              </Link>
            </div>
            <div className="welcome-image-column">
              <img src={bookIllustration} alt="Books illustration" className="welcome-image" />
            </div>
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

            {/* Feature 1: Text Left, Image Right */}
            <div className="feature-row feature-row-normal">
              <div className="feature-text-column">
                <h3 className="feature-title">Join or Create Book Clubs</h3>
                <p className="feature-description">
                  Connect with readers by genre, author, or title in public or private clubs. Build your own community or discover existing ones that match your reading interests.
                </p>
              </div>
              <div className="feature-image-column">
                <div className="feature-image-placeholder">
                  <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Feature 2: Image Left, Text Right */}
            <div className="feature-row feature-row-reverse">
              <div className="feature-text-column">
                <h3 className="feature-title">Chat in Real Time</h3>
                <p className="feature-description">
                  Share quick reactions, recommendations, and casual discussions through live chat. Engage with your book club members instantly as you read together.
                </p>
              </div>
              <div className="feature-image-column">
                <div className="feature-image-placeholder">
                  <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Feature 3: Text Left, Image Right */}
            <div className="feature-row feature-row-normal">
              <div className="feature-text-column">
                <h3 className="feature-title">Dive into Structured Threads</h3>
                <p className="feature-description">
                  Stay on track with organized discussions by chapters, themes, and questions. Create meaningful conversations that go deeper than surface-level comments.
                </p>
              </div>
              <div className="feature-image-column">
                <div className="feature-image-placeholder">
                  <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Feature 4: Image Left, Text Right */}
            <div className="feature-row feature-row-reverse">
              <div className="feature-text-column">
                <h3 className="feature-title">Showcase Your Bookshelf</h3>
                <p className="feature-description">
                  Share your reading journey with a visual timeline of current and past reads, ratings, and favorites. Let others discover your literary taste and recommendations.
                </p>
              </div>
              <div className="feature-image-column">
                <div className="feature-image-placeholder">
                  <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Feature 5: Text Left, Image Right */}
            <div className="feature-row feature-row-normal">
              <div className="feature-text-column">
                <h3 className="feature-title">Build Connections</h3>
                <p className="feature-description">
                  Add friends, comment, react, and keep the conversation going beyond the book club. Create lasting friendships through shared literary passions.
                </p>
              </div>
              <div className="feature-image-column">
                <div className="feature-image-placeholder">
                  <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quote Section */}
        <section className="quote-section">
          <div className="quote-container">
            <blockquote className="quote-text">
              Plotline transformed how I connect with other readers. The combination of live chat and fun discussions makes every book club meeting more engaging and meaningful.
            </blockquote>
            <p className="quote-author">— Sarah M., Book Club Enthusiast</p>
          </div>
        </section>

        {/* Who We Are Made For Section */}
        <section className="who-section">
          <div className="who-container">
            <h2 className="who-title">Who We Are Made For</h2>
            <div className="who-grid">
              <div className="who-card">
                <h3 className="who-card-title">Casual Readers</h3>
                <p className="who-card-text">
                  Whether you read a book a month or a book a week, Plotline helps you connect with others who share your passion for stories.
                </p>
              </div>
              <div className="who-card">
                <h3 className="who-card-title">Book Clubs</h3>
                <p className="who-card-text">
                  Organize your club's reading schedule, track progress, and facilitate discussions all in one place. Perfect for both online and in-person clubs.
                </p>
              </div>
              <div className="who-card">
                <h3 className="who-card-title">Classroom Communities</h3>
                <p className="who-card-text">
                  Teachers and can create book clubs for literature classes, making reading assignments more interactive and engaging.
                </p>
              </div>
              <div className="who-card">
                <h3 className="who-card-title">Genre Enthusiasts</h3>
                <p className="who-card-text">
                  Join niche communities for your favorite genres—from sci-fi to romance, mystery to fantasy—and discover your next great read.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="cta-section">
          <div className="cta-container">
            <h2 className="cta-heading">Ready to Start Your Reading Journey?</h2>
            <p className="cta-text">
              Join thousands of readers who are already connecting, discussing, and growing together on Plotline.
            </p>
            <Link to="/signup" className="cta-button">
              Sign Up Today
            </Link>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <div className="app-footer-content">
          <p className="app-footer-text">
            &copy; 2025 Plotline brought to you by{' '}
            <a 
              href="https://rotom-corp-company-website-2bed7e8765d3.herokuapp.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="app-footer-link"
            >
              ROTOM Corporation
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
