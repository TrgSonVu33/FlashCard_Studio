import { useState } from 'react';
import './Navbar.css';

export default function Navbar({ onStartStudying }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar" id="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="navbar-brand">
          <span className="navbar-logo-dot" aria-hidden="true"></span>
          <span className="navbar-title">FlashCard Studio</span>
        </div>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span className={`navbar-toggle-icon ${menuOpen ? 'open' : ''}`}></span>
        </button>

        {/* Nav Links + Actions */}
        <nav className={`navbar-menu ${menuOpen ? 'navbar-menu--open' : ''}`}>
          <ul className="navbar-links">
            <li><a href="#study-sets" className="navbar-link">Study Sets</a></li>
            <li><a href="#categories" className="navbar-link">Categories</a></li>
            <li><a href="#history" className="navbar-link">History</a></li>
          </ul>

          <div className="navbar-actions">
            <button className="navbar-btn navbar-btn--ghost" id="nav-login-btn">
              Log In
            </button>
            <button
              className="navbar-btn navbar-btn--primary"
              id="nav-start-btn"
              onClick={onStartStudying}
            >
              Start Studying
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
