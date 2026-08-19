import { useAuth } from '@/hooks/useAuth';
import './PremiumUpsell.css';

/**
 * Component: PremiumUpsell
 * Hiển thị thông báo nâng cấp Premium khi user truy cập tính năng bị hạn chế.
 * 
 * Xử lý thống nhất cho cả 2 trường hợp:
 * - Logged-out user: Hiển thị Upgrade → click → chuyển đến Login → sau login mở Checkout
 * - Logged-in Basic user: Hiển thị Upgrade → click → mở Checkout trực tiếp
 * 
 * @param {string} featureName - Tên tính năng bị hạn chế (hiển thị trong mô tả)
 * @param {function} onBack - Hàm quay lại trang trước
 * @param {function} onUpgrade - Hàm mở CheckoutModal (cho logged-in users)
 * @param {function} onLoginForUpgrade - Hàm chuyển đến Login rồi mở Checkout sau (cho logged-out users)
 */
export default function PremiumUpsell({ featureName, onBack, onUpgrade, onLoginForUpgrade }) {
  const { user } = useAuth();

  /**
   * Xử lý khi user bấm "Upgrade Now":
   * - Nếu đã đăng nhập → mở Checkout trực tiếp
   * - Nếu chưa đăng nhập → chuyển sang Login, sau khi login xong sẽ mở Checkout
   */
  const handleUpgradeClick = () => {
    if (user) {
      // Logged-in: Mở checkout modal trực tiếp
      onUpgrade?.();
    } else {
      // Logged-out: Chuyển đến login, sau login mở checkout
      onLoginForUpgrade?.();
    }
  };

  return (
    <div className="premium-upsell-container">
      <div className="premium-upsell-card">
        <div className="premium-upsell-icon-wrapper">
          <span className="premium-upsell-icon">💎</span>
        </div>
        <h2 className="premium-upsell-title">Unlock Premium</h2>
        <p className="premium-upsell-desc">
          {featureName 
            ? `Upgrade to Premium to access ${featureName}.` 
            : 'Upgrade to Premium to unlock exclusive features.'}
        </p>
        {!user && (
          <p className="premium-upsell-login-hint">
            You&apos;ll need to log in or create an account first.
          </p>
        )}
        <ul className="premium-upsell-features">
          <li>✓ Create and manage unlimited Custom Decks</li>
          <li>✓ Access Hard and Normal difficulty Study Sets</li>
          <li>✓ View your detailed Practice History</li>
        </ul>
        <div className="premium-upsell-actions">
          {onBack && (
            <button className="premium-upsell-btn premium-upsell-btn--back" onClick={onBack}>
              Go Back
            </button>
          )}
          <button 
            className="premium-upsell-btn premium-upsell-btn--upgrade"
            onClick={handleUpgradeClick}
          >
            {user ? 'Upgrade Now' : 'Login & Upgrade'}
          </button>
        </div>
      </div>
    </div>
  );
}
