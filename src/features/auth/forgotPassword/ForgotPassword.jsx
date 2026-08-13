import { useState } from 'react';
import { supabase } from '@/services/supabase';
import AuthBranding from '@/features/auth/authBranding/AuthBranding';
import '@/features/auth/auth.css';

/**
 * Component: ForgotPassword
 * Trang yêu cầu đặt lại mật khẩu. Người dùng nhập email và Supabase sẽ gửi
 * một link đặt lại mật khẩu đến email đó.
 * 
 * @param {function} onNavigate - Hàm callback điều hướng quay lại trang đăng nhập
 */
export default function ForgotPassword({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Hàm xử lý khi người dùng nhấn nút gửi link reset.
   * Gọi API `resetPasswordForEmail` của Supabase.
   * Supabase sẽ gửi email chứa link reset → khi click link, app sẽ nhận sự kiện PASSWORD_RECOVERY.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        // redirectTo: URL mà Supabase sẽ chuyển hướng người dùng sau khi click link trong email
        redirectTo: window.location.origin,
      }
    );

    if (resetError) {
      setError(resetError.message);
    } else {
      setSuccess('Check your email! We sent you a password reset link.');
    }

    setLoading(false);
  };

  return (
    <div className="auth-page" id="forgot-password-page">
      {/* Panel trái: Branding */}
      <AuthBranding />

      {/* Panel phải: Form quên mật khẩu */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h1 className="auth-form-title">Forgot password?</h1>
            <p className="auth-form-subtitle">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Thông báo lỗi */}
            {error && <div className="auth-error" role="alert">{error}</div>}

            {/* Thông báo thành công */}
            {success && <div className="auth-success" role="status">{success}</div>}

            {/* Email */}
            <div className="auth-field">
              <label htmlFor="forgot-email" className="auth-label">Email</label>
              <input
                id="forgot-email"
                type="email"
                className="auth-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
              />
            </div>

            {/* Nút gửi link reset */}
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
              id="forgot-submit-btn"
            >
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>

          {/* Footer: Link quay lại đăng nhập */}
          <div className="auth-form-footer">
            Remember your password?{' '}
            <button className="auth-link" onClick={() => onNavigate('login')}>
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
