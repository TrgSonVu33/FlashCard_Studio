import { useState } from 'react';
import './Navbar.css';

export default function Navbar({ onNavClick, currentView }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNav = (view) => {
    onNavClick(view);
    setMenuOpen(false);
  };

  return (
    <header className="navbar" id="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div 
          className="navbar-brand" 
          onClick={() => handleNav('home')}
          style={{ cursor: 'pointer' }}
        >
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
            <li>
              <button 
                className={`navbar-link ${currentView === 'studySets' ? 'active' : ''}`}
                onClick={() => handleNav('studySets')}
              >
                Study Sets
              </button>
            </li>
            <li>
              <button 
                className={`navbar-link ${currentView === 'deckSelect' ? 'active' : ''}`}
                onClick={() => handleNav('deckSelect')}
              >
                Decks
              </button>
            </li>
            <li>
              <button 
                className={`navbar-link ${currentView === 'history' ? 'active' : ''}`}
                onClick={() => handleNav('history')}
              >
                History
              </button>
            </li>
          </ul>

          <div className="navbar-actions">
            <button className="navbar-btn navbar-btn--ghost" id="nav-login-btn">
              Log In
            </button>
            <button
              className="navbar-btn navbar-btn--primary"
              id="nav-start-btn"
              onClick={() => handleNav('deckSelect')}
            >
              Start Studying
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
