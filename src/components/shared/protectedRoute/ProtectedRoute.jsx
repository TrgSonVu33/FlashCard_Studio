import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Component: ProtectedRoute
 * Component bảo vệ (guard) ngăn người dùng chưa đăng nhập truy cập vào các trang nội dung.
 * 
 * - Khi đang tải thông tin xác thực (loading): hiển thị spinner.
 * - Khi chưa đăng nhập (user = null): tự động chuyển hướng sang trang đăng nhập.
 * - Khi đã đăng nhập: render nội dung con (children).
 * 
 * @param {React.ReactNode} children - Nội dung được bảo vệ (các trang chính của ứng dụng)
 * @param {function} onRedirectToLogin - Hàm callback chuyển hướng đến trang đăng nhập
 */
export default function ProtectedRoute({ children, onRedirectToLogin }) {
  const { user, loading } = useAuth();

  // Nếu chưa đăng nhập và đã tải xong → chuyển hướng sang trang Login
  useEffect(() => {
    if (!loading && !user) {
      onRedirectToLogin();
    }
  }, [user, loading, onRedirectToLogin]);

  // Đang tải thông tin xác thực → hiển thị spinner
  if (loading) {
    return (
      <div className="auth-loading">
        <div className="auth-spinner"></div>
      </div>
    );
  }

  // Chưa đăng nhập → không render gì (đang chuyển hướng)
  if (!user) {
    return null;
  }

  // Đã đăng nhập → render nội dung
  return children;
}
