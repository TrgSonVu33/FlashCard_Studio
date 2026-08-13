import { useState } from 'react';
import { supabase } from '@/services/supabase';
import AuthBranding from '@/features/auth/authBranding/AuthBranding';
import '@/features/auth/auth.css';

/**
 * Component: ResetPassword
 * Trang đặt lại mật khẩu mới. Hiển thị khi người dùng click link reset password từ email.
 * Người dùng chỉ cần nhập mật khẩu mới, không cần xác nhận thêm gì
 * (vì Supabase đã xác thực qua token trong URL).
 * 
 * @param {function} onComplete - Hàm callback được gọi sau khi đặt lại mật khẩu thành công
 */
export default function ResetPassword({ onComplete }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Hàm xử lý khi người dùng nhấn nút đặt lại mật khẩu.
   * Gọi API `updateUser` của Supabase để cập nhật mật khẩu mới.
   * Sau khi thành công, gọi onComplete để xóa cờ recovery và chuyển về trang chính.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate: Mật khẩu tối thiểu 6 ký tự
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    // Validate: Xác nhận mật khẩu phải khớp
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess('Password updated successfully! Redirecting…');
      // Chờ 1.5 giây để người dùng đọc thông báo, rồi chuyển về trang chính
      setTimeout(() => {
        onComplete();
      }, 1500);
    }

    setLoading(false);
  };

  return (
    <div className="auth-page" id="reset-password-page">
      {/* Panel trái: Branding */}
      <AuthBranding />

      {/* Panel phải: Form đặt lại mật khẩu */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h1 className="auth-form-title">Set new password</h1>
            <p className="auth-form-subtitle">
              Enter your new password below. No additional confirmation needed.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Thông báo lỗi */}
            {error && <div className="auth-error" role="alert">{error}</div>}

            {/* Thông báo thành công */}
            {success && <div className="auth-success" role="status">{success}</div>}

            {/* New Password */}
            <div className="auth-field">
              <label htmlFor="reset-password" className="auth-label">New Password</label>
              <input
                id="reset-password"
                type="password"
                className="auth-input"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                autoFocus
              />
            </div>

            {/* Confirm New Password */}
            <div className="auth-field">
              <label htmlFor="reset-confirm" className="auth-label">Confirm New Password</label>
              <input
                id="reset-confirm"
                type="password"
                className="auth-input"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            {/* Nút đặt lại mật khẩu */}
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading || !!success}
              id="reset-submit-btn"
            >
              {loading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
