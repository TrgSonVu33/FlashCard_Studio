import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { generateVietQRUrl, simulatePremiumUpgrade } from '@/services/paymentService';
import './CheckoutModal.css';

/**
 * Component: CheckoutModal
 * Modal thanh toán hiển thị mã VietQR và nút mô phỏng thanh toán.
 * 
 * Luồng xử lý:
 * 1. Hiển thị QR code VietQR (amount=0 cho test mode)
 * 2. User scan QR hoặc bấm "Simulate Payment Success"
 * 3. Gọi RPC Supabase để nâng cấp plan_type -> 'premium'
 * 4. Refresh profile trong useAuth để cập nhật UI ngay lập tức
 * 5. Hiển thị thông báo thành công
 * 
 * @param {boolean} isOpen - Cờ hiệu hiển thị/ẩn modal
 * @param {function} onClose - Hàm callback đóng modal
 */
export default function CheckoutModal({ isOpen, onClose }) {
  const { user, isPremium, refreshUserPlan, refreshProfile } = useAuth();
  
  // Trạng thái UI của modal
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);

  // Không render nếu modal đang đóng
  if (!isOpen) return null;

  // Tạo URL QR code từ VietQR API
  const qrUrl = user ? generateVietQRUrl(user.id) : '';

  /**
   * Xử lý khi user bấm nút "Simulate Payment Success"
   * Gọi RPC -> Update local state -> Hiển thị success
   */
  const handleSimulate = async () => {
    setLoading(true);
    setError(null);

    try {
      // Gọi Supabase RPC để ghi nhận payment + upgrade plan
      const result = await simulatePremiumUpgrade();
      setPaymentResult(result);

      // Cập nhật state local ngay lập tức (không độ trễ)
      refreshUserPlan('premium');
      
      // Chạy refresh db ngầm
      refreshProfile().catch(console.error);

      // Hiển thị trạng thái thành công
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Payment simulation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Đóng modal và reset toàn bộ trạng thái
   */
  const handleClose = () => {
    setSuccess(false);
    setError(null);
    setPaymentResult(null);
    setLoading(false);
    onClose();
  };

  return (
    <div className="checkout-overlay" onClick={handleClose}>
      <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        {/* Nút đóng modal */}
        <button className="checkout-close" onClick={handleClose} aria-label="Close">✕</button>

        {/* === TRƯỜNG HỢP 1: User đã là Premium === */}
        {isPremium && !success && (
          <div className="checkout-already">
            <span className="checkout-already-icon">✅</span>
            <h2 className="checkout-already-title">You&apos;re Already Premium!</h2>
            <p className="checkout-already-desc">
              You already have full access to all premium features. Enjoy learning!
            </p>
            <button className="checkout-done-btn" onClick={handleClose}>
              Got It
            </button>
          </div>
        )}

        {/* === TRƯỜNG HỢP 2: Thanh toán thành công === */}
        {success && (
          <div className="checkout-success">
            <span className="checkout-success-icon">🎉</span>
            <h2 className="checkout-success-title">Upgrade Successful!</h2>
            <p className="checkout-success-desc">
              Welcome to Premium! You now have full access to all features.
            </p>
            {paymentResult?.transaction_ref && (
              <p className="checkout-success-ref">
                Ref: {paymentResult.transaction_ref}
              </p>
            )}
            <button className="checkout-done-btn" onClick={handleClose}>
              Start Learning 🚀
            </button>
          </div>
        )}

        {/* === TRƯỜNG HỢP 3: Hiển thị form thanh toán (chưa Premium, chưa thành công) === */}
        {!isPremium && !success && (
          <div className="checkout-content">
            {/* Cột trái: Summary & Benefits */}
            <div className="checkout-summary">
              {/* Header */}
              <div className="checkout-header">
                <span className="checkout-icon">💎</span>
                <h2 className="checkout-title">Upgrade to Premium</h2>
                <div className="checkout-price">
                  <span className="checkout-price-currency">$</span>
                  <span className="checkout-price-amount">4.99</span>
                  <span className="checkout-price-period">/mo</span>
                </div>
                <p className="checkout-subtitle">Supercharge your learning experience</p>
              </div>

              {/* Danh sách tính năng Premium */}
              <ul className="checkout-benefits">
                <li>✨ Create Unlimited Custom Decks</li>
                <li>🔥 Advanced Study Modes (Normal, Hard)</li>
                <li>📊 Detailed Practice History & Analytics</li>
                <li>🚀 Priority Support</li>
              </ul>
            </div>

            {/* Cột phải: Payment */}
            <div className="checkout-payment">
              {/* VietQR Code */}
              <div className="checkout-qr-section">
                <p className="checkout-qr-label">Scan to Pay via VietQR</p>
                <div className="checkout-qr-wrapper">
                  <img
                    className="checkout-qr-img"
                    src={qrUrl}
                    alt="VietQR Payment Code"
                    loading="lazy"
                  />
                </div>
                <p className="checkout-qr-note">
                  Test mode: Amount is set to 0 VND for development
                </p>
              </div>

              {/* Divider */}
              <div className="checkout-divider">or test without scanning</div>

              {/* Error message */}
              {error && (
                <div className="checkout-error">
                  ⚠️ {error}
                </div>
              )}

              {/* Nút mô phỏng thanh toán thành công */}
              <button
                className="checkout-simulate-btn"
                onClick={handleSimulate}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="checkout-spinner" />
                    Processing...
                  </>
                ) : (
                  '🧪 Test: Simulate Payment Success'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
