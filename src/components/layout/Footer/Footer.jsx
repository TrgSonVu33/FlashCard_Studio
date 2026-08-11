import './Footer.css';

export default function Footer({ showContact = true }) {
  return (
    <footer className={`saas-footer ${!showContact ? 'saas-footer--clean' : ''}`}>
      <div className={`footer-content ${!showContact ? 'footer-content--clean' : ''}`}>
        
        {/* Left Side: Brand & Links */}
        <div className={`footer-left ${!showContact ? 'footer-left--clean' : ''}`}>
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

        {/* Right Side: Embedded Contact Form */}
        {showContact && (
          <div className="footer-contact-box">
            <h4 className="footer-column-title">Get in Touch</h4>
            <p className="footer-contact-desc">Have a question? Drop us a message.</p>
            <form className="footer-contact-form" onSubmit={(e) => e.preventDefault()}>
              <div className="footer-form-row">
                <input type="text" placeholder="Name" className="footer-input" />
                <input type="email" placeholder="Email" className="footer-input" />
              </div>
              <input type="text" placeholder="Reason for Contact" className="footer-input" />
              <textarea placeholder="How can we help you?" rows="3" className="footer-input footer-textarea"></textarea>
              <button type="submit" className="footer-submit-btn">Send Message</button>
            </form>
          </div>
        )}

      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} FlashCard Studio. All rights reserved.</p>
      </div>
    </footer>
  );
}
