import { useState, useRef, useEffect } from 'react';
import './ContactDropdown.css';

export default function ContactDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate sending
    setIsOpen(false);
  };

  return (
    <div className="contact-dropdown-wrapper" ref={dropdownRef}>
      <button 
        className={`contact-toggle-btn ${isOpen ? 'contact-toggle-btn--active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="contact-toggle-icon">💬</span>
        Get in Touch
      </button>

      {isOpen && (
        <div className="contact-dropdown-popover">
          <div className="contact-dropdown-header">
            <h4>Send us a message</h4>
            <p>We'll get back to you as soon as possible.</p>
          </div>
          <form className="contact-dropdown-form" onSubmit={handleSubmit}>
            <input type="text" placeholder="Name" required className="contact-input" />
            <input type="email" placeholder="Email" required className="contact-input" />
            <input type="text" placeholder="Reason for Contact" required className="contact-input" />
            <textarea placeholder="How can we help you?" rows="4" required className="contact-textarea"></textarea>
            <button type="submit" className="contact-submit-btn">Submit</button>
          </form>
        </div>
      )}
    </div>
  );
}
