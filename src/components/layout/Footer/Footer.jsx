import './Footer.css';

export default function Footer() {
  return (
    <footer className="saas-footer">
      <div className="footer-content">
        
        {/* Left Side: Brand & Links */}
        <div className="footer-left">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="footer-logo-dot"></span>
              <span className="footer-title">FlashCard Studio</span>
            </div>
            <p className="footer-desc">
              The most professional way to master new vocabulary with spaced repetition.
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <div className="footer-column-header">
                <span className="footer-logo-dot"></span>
                <h4 className="footer-column-title">Connect</h4>
              </div>
              <div className="footer-link-group">
                <a href="#" className="footer-link">Twitter / X</a>
                <a href="#" className="footer-link">LinkedIn</a>
                <a href="#" className="footer-link">GitHub</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} FlashCard Studio. All rights reserved.</p>
      </div>
    </footer>
  );
}
