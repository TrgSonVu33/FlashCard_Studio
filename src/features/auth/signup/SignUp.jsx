import { useState } from 'react';
import { supabase } from '@/services/supabase';
import AuthView from '@/features/auth/authView/AuthView';
import '@/features/auth/styles/auth.css';

/**
 * Component: SignUp
 * Trang đăng ký tài khoản mới sử dụng email và mật khẩu thông qua Supabase Auth.
 * Bao gồm validate phía client: mật khẩu tối thiểu 6 ký tự và xác nhận mật khẩu phải khớp.
 * 
 * @param {function} onNavigate - Hàm callback điều hướng sang các trang khác (login)
 */
export default function SignUp({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Hàm xử lý khi người dùng nhấn nút đăng ký.
   * Thực hiện validate rồi gọi API `signUp` của Supabase.
   * Vì email confirmation đã tắt nên người dùng sẽ tự động đăng nhập sau khi đăng ký.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (selectedPlan === 'premium') {
      alert('Payment integration is coming soon! Please sign up for the Basic plan for now.');
      return;
    }

    // Validate 1: Không để trống email
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    // Validate 2: Mật khẩu tối thiểu 6 ký tự (yêu cầu của Supabase)
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    // Validate 3: Xác nhận mật khẩu phải khớp
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
    }
    // Nếu thành công và email confirmation đã tắt,
    // onAuthStateChange sẽ tự cập nhật → App chuyển sang Home

    setLoading(false);
  };

  return (
    <div className="auth-page" id="signup-page">
      {/* Panel trái: Branding */}
      <AuthView />

      {/* Panel phải: Form đăng ký */}
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
            <h1 className="auth-form-title">Create an account</h1>
            <p className="auth-form-subtitle">Start your learning journey with FlashCard Studio</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Thông báo lỗi */}
            {error && <div className="auth-error" role="alert">{error}</div>}

            {/* Plan Selection */}
            <div className="auth-field auth-plan-selection">
              <label className="auth-label">Choose your plan</label>
              <div className="auth-plan-cards">
                <div 
                  className={`auth-plan-card ${selectedPlan === 'basic' ? 'auth-plan-card--active' : ''}`}
                  onClick={() => setSelectedPlan('basic')}
                >
                  <div className="auth-plan-card-title">Basic</div>
                  <div className="auth-plan-card-price">Free</div>
                </div>
                <div 
                  className={`auth-plan-card ${selectedPlan === 'premium' ? 'auth-plan-card--active' : ''}`}
                  onClick={() => setSelectedPlan('premium')}
                >
                  <div className="auth-plan-card-title">Premium</div>
                  <div className="auth-plan-card-price">$4.99/mo</div>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="auth-field">
              <label htmlFor="signup-email" className="auth-label">Email</label>
              <input
                id="signup-email"
                type="email"
                className="auth-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
              />
            </div>

            {/* Password */}
            <div className="auth-field">
              <label htmlFor="signup-password" className="auth-label">Password</label>
              <input
                id="signup-password"
                type="password"
                className="auth-input"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            {/* Confirm Password */}
            <div className="auth-field">
              <label htmlFor="signup-confirm" className="auth-label">Confirm Password</label>
              <input
                id="signup-confirm"
                type="password"
                className="auth-input"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            {/* Nút đăng ký */}
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
              id="signup-submit-btn"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          {/* Footer: Link sang trang đăng nhập */}
          <div className="auth-form-footer">
            Already have an account?{' '}
            <button className="auth-link" onClick={() => onNavigate('login')}>
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
