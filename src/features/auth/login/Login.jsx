import { useState } from 'react';
import { supabase } from '@/services/supabase';
import AuthView from '@/features/auth/authView/AuthView';
import '@/features/auth/styles/auth.css';

/**
 * Component: Login
 * Trang đăng nhập sử dụng email và mật khẩu thông qua Supabase Auth.
 * Giao diện chia đôi: Bên trái là branding, bên phải là form đăng nhập.
 * 
 * @param {function} onNavigate - Hàm callback điều hướng sang các trang khác (signup, forgotPass)
 */
export default function Login({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Hàm xử lý khi người dùng nhấn nút đăng nhập.
   * Gọi API `signInWithPassword` của Supabase.
   * Nếu thành công, AuthProvider sẽ tự động cập nhật user qua onAuthStateChange.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message);
    }
    // Nếu không có lỗi, onAuthStateChange trong AuthProvider sẽ tự cập nhật user → App chuyển sang Home

    setLoading(false);
  };

  return (
    <div className="auth-page" id="login-page">
      {/* Panel trái: Branding */}
      <AuthView />

      {/* Panel phải: Form đăng nhập */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <button 
            type="button"
            className="auth-link" 
            style={{ marginBottom: '2rem', display: 'inline-block', fontSize: '0.9rem' }} 
            onClick={() => onNavigate('home')}
          >
            ← Back to Homepage
          </button>

          <div className="auth-form-header">
            <h1 className="auth-form-title">Welcome back</h1>
            <p className="auth-form-subtitle">Sign in to continue your study journey</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Thông báo lỗi */}
            {error && <div className="auth-error" role="alert">{error}</div>}

            {/* Email */}
            <div className="auth-field">
              <label htmlFor="login-email" className="auth-label">Email</label>
              <input
                id="login-email"
                type="email"
                className="auth-input"
                placeholder="user@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
              />
            </div>

            {/* Password */}
            <div className="auth-field">
              <label htmlFor="login-password" className="auth-label">Password</label>
              <input
                id="login-password"
                type="password"
                className="auth-input"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {/* Link quên mật khẩu */}
            <button
              type="button"
              className="auth-link auth-forgot-link"
              onClick={() => onNavigate('forgotPass')}
            >
              Forgot password?
            </button>

            {/* Nút đăng nhập */}
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
              id="login-submit-btn"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Footer: Link sang trang đăng ký */}
          <div className="auth-form-footer">
            Don&apos;t have an account?{' '}
            <button className="auth-link" onClick={() => onNavigate('signup')}>
              Create one
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
