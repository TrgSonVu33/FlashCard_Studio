import './Contact.css';

export default function Contact() {
  return (
    <section className="contact-section">
      <div className="contact-card">
        <h2 className="contact-title">Get in Touch</h2>
        <p className="contact-subtitle">Have a question or feedback? We'd love to hear from you.</p>

        <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input type="text" id="firstName" placeholder="Steve" />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input type="text" id="lastName" placeholder="Jobs" />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reason">Reason for Contact</label>
            <div className="select-wrapper">
              <select id="reason">
                <option value="general">General Inquiry</option>
                <option value="support">Technical Support</option>
                <option value="feature">Feature Request</option>
                <option value="bug">Report a Bug</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea id="message" placeholder="How can we help you?" />
          </div>

          <button type="submit" className="contact-submit-btn">
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}
