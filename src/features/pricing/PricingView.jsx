import { useState } from 'react';
import './PricingView.css';

export default function PricingView({ user, isPremium, onNavigate, onUpgrade, onDowngrade }) {
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [isDowngrading, setIsDowngrading] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }

  const handleAction = (plan) => {
    if (!user) {
      onNavigate('signup');
      return;
    }
    
    // Nâng cấp lên Premium
    if (plan === 'premium' && !isPremium) {
      onUpgrade();
    }
    
    // Hạ cấp về Basic
    if (plan === 'basic' && isPremium) {
      setShowDowngradeModal(true);
    }
  };

  const confirmDowngrade = async () => {
    if (!onDowngrade) return;
    
    setIsDowngrading(true);
    const success = await onDowngrade();
    setIsDowngrading(false);
    setShowDowngradeModal(false);
    
    if (success) {
      setToast({ type: 'success', message: 'Successfully downgraded to Basic plan.' });
    } else {
      setToast({ type: 'error', message: 'Failed to downgrade. Please try again later.' });
    }
    
    // Ẩn toast sau 4 giây
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="pricing-view">
      {/* Toast Notification (Zapier Style - Centered Modal) */}
      {toast && (
        <div className="downgrade-overlay" style={{ zIndex: 2000 }}>
          <div className={`pricing-toast pricing-toast--${toast.type}`}>
            <div className="pricing-toast-icon">
              {toast.type === 'success' ? '✅' : '❌'}
            </div>
            <div className="pricing-toast-message">{toast.message}</div>
          </div>
        </div>
      )}

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
            {user && !isPremium ? 'Current Plan' : 'Downgrade to Basic'}
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

      {/* Downgrade Confirmation Modal */}
      {showDowngradeModal && (
        <div className="downgrade-overlay" onClick={() => setShowDowngradeModal(false)}>
          <div className="downgrade-modal" onClick={(e) => e.stopPropagation()}>
            <div className="downgrade-modal-icon">⚠️</div>
            <h2 className="downgrade-modal-title">Downgrade to Basic?</h2>
            <p className="downgrade-modal-desc">
              Are you sure you want to downgrade? You will immediately lose access to your Practice History and Advanced Study modes.
            </p>
            <div className="downgrade-modal-actions">
              <button 
                className="downgrade-btn downgrade-btn--cancel" 
                onClick={() => setShowDowngradeModal(false)}
                disabled={isDowngrading}
              >
                Cancel
              </button>
              <button 
                className={`downgrade-btn downgrade-btn--confirm ${isDowngrading ? 'downgrade-btn--loading' : ''}`}
                onClick={confirmDowngrade}
                disabled={isDowngrading}
              >
                {isDowngrading ? 'Downgrading...' : 'Yes, Downgrade'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
