import './PricingView.css';

export default function PricingView({ user, isPremium, onNavigate, onUpgrade }) {
  const handleAction = (plan) => {
    if (!user) {
      onNavigate('signup');
      return;
    }
    // Mở CheckoutModal khi user muốn nâng cấp Premium
    if (plan === 'premium' && !isPremium) {
      onUpgrade();
    }
  };

  return (
    <div className="pricing-view">
      <div className="pricing-header">
        <h1 className="pricing-title">Choose Your Plan</h1>
        <p className="pricing-subtitle">Unlock your full learning potential with FlashCard Studio.</p>
      </div>
      
      <div className="pricing-cards">
        {/* Basic Plan */}
        <div className="pricing-card pricing-card--basic">
          <div className="pricing-card-header">
            <h2 className="pricing-card-title">Basic</h2>
            <div className="pricing-price">
              <span className="pricing-currency">$</span>
              <span className="pricing-amount">0</span>
              <span className="pricing-period">/mo</span>
            </div>
          </div>
          <p className="pricing-desc">Everything you need to get started.</p>
          <ul className="pricing-features">
            <li>✓ Access to all System Decks</li>
            <li>✓ Standard Study Mode</li>
            <li>✓ Basic Progress Tracking</li>
          </ul>
          <button 
            className="pricing-btn pricing-btn--basic"
            onClick={() => handleAction('basic')}
            disabled={user && !isPremium}
          >
            {user && !isPremium ? 'Current Plan' : 'Get Started'}
          </button>
        </div>

        {/* Premium Plan */}
        <div className="pricing-card pricing-card--premium">
          <div className="pricing-badge">Most Popular</div>
          <div className="pricing-card-header">
            <h2 className="pricing-card-title">Premium</h2>
            <div className="pricing-price">
              <span className="pricing-currency">$</span>
              <span className="pricing-amount">4.99</span>
              <span className="pricing-period">/mo</span>
            </div>
          </div>
          <p className="pricing-desc">Supercharge your learning experience.</p>
          <ul className="pricing-features">
            <li>✨ Create Unlimited Custom Decks</li>
            <li>🔥 Advanced Study Modes (Normal, Hard)</li>
            <li>📊 Detailed Practice History</li>
            <li>🚀 Priority Support</li>
          </ul>
          <button 
            className="pricing-btn pricing-btn--premium"
            onClick={() => handleAction('premium')}
            disabled={user && isPremium}
          >
            {user && isPremium ? 'Current Plan' : 'Upgrade to Premium'}
          </button>
        </div>
      </div>
    </div>
  );
}
