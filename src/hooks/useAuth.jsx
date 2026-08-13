import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';

/**
 * Context: AuthContext
 * Lưu trữ và cung cấp thông tin xác thực (authentication) cho toàn bộ ứng dụng.
 * Bao gồm: thông tin user, session, trạng thái loading, và sự kiện PASSWORD_RECOVERY.
 */
const AuthContext = createContext(null);

/**
 * Provider: AuthProvider
 * Bọc (wrap) toàn bộ ứng dụng để cung cấp thông tin xác thực qua Context API.
 * Tự động lắng nghe sự kiện thay đổi trạng thái xác thực từ Supabase.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cờ hiệu cho biết người dùng đang trong luồng khôi phục mật khẩu (PASSWORD_RECOVERY)
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    // 1. Lấy session hiện tại khi component mount (ví dụ: khi người dùng refresh trang)
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    // 2. Đăng ký listener cho các sự kiện thay đổi trạng thái xác thực
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);

        // Nếu sự kiện là PASSWORD_RECOVERY (người dùng click link reset password từ email)
        // Đặt cờ isRecovery = true để App.jsx chuyển sang màn hình đặt lại mật khẩu
        if (event === 'PASSWORD_RECOVERY') {
          setIsRecovery(true);
        }
      }
    );

    // 3. Cleanup: Hủy đăng ký listener khi component unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Hàm: signOut
   * Đăng xuất người dùng khỏi Supabase, xóa session và thông tin user.
   */
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsRecovery(false);
  };

  /**
   * Hàm: clearRecovery
   * Xóa cờ isRecovery sau khi người dùng đã đặt lại mật khẩu thành công.
   */
  const clearRecovery = () => {
    setIsRecovery(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isRecovery, signOut, clearRecovery }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook: useAuth
 * Cho phép các component con truy cập thông tin xác thực từ AuthContext.
 * Phải được sử dụng bên trong <AuthProvider>.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
