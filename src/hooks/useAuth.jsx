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
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cờ hiệu cho biết người dùng đang trong luồng khôi phục mật khẩu (PASSWORD_RECOVERY)
  const [isRecovery, setIsRecovery] = useState(false);

  // Hàm gọi API lấy thông tin profile
  const fetchProfile = async (userId) => {
    if (!userId) {
      setProfile(null);
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data && !error) {
      console.log('[fetchProfile] SUCCESS for user:', userId, 'Data:', data);
      setProfile(data);
    } else {
      console.error('[fetchProfile] FAILED for user:', userId, 'Error:', error);
      setProfile({ plan_type: 'basic' }); // Fallback
    }
  };

  useEffect(() => {
    // 1. Lấy session hiện tại khi component mount
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        fetchProfile(currentUser.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // 2. Đăng ký listener cho các sự kiện thay đổi trạng thái xác thực
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        const newUser = newSession?.user ?? null;
        setUser(newUser);

        if (newUser) {
          await fetchProfile(newUser.id);
        } else {
          setProfile(null);
        }
        
        setLoading(false);

        // Nếu sự kiện là PASSWORD_RECOVERY (người dùng click link reset password từ email)
        // Đặt cờ isRecovery = true để App.jsx chuyển sang màn hình đặt lại mật khẩu
        if (event === 'PASSWORD_RECOVERY') {
          setIsRecovery(true);
        }
      }
    );

    // 3. Realtime: Lắng nghe thay đổi trên bảng profiles (VD: plan_type thay đổi)
    // Điều này đảm bảo UI (badge, premium gates) cập nhật ngay khi DB thay đổi
    const profileChannel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        (payload) => {
          // Chỉ cập nhật nếu thay đổi thuộc về user hiện tại
          setUser((currentUser) => {
            if (currentUser && payload.new.id === currentUser.id) {
              setProfile(payload.new);
            }
            return currentUser;
          });
        }
      )
      .subscribe();

    // 4. Cleanup: Hủy đăng ký tất cả listeners khi component unmount
    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(profileChannel);
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
    setProfile(null);
    setIsRecovery(false);
  };

  /**
   * Hàm: refreshProfile
   * Tải lại thông tin profile từ Supabase (VD: sau khi nâng cấp Premium).
   * Cho phép các component gọi để cập nhật trạng thái plan_type ngay lập tức.
   */
  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  /**
   * Hàm: clearRecovery
   * Xóa cờ isRecovery sau khi người dùng đã đặt lại mật khẩu thành công.
   */
  const clearRecovery = () => {
    setIsRecovery(false);
  };

  /**
   * Hàm: refreshUserPlan
   * Cập nhật trạng thái plan_type local ngay lập tức (optimistic update).
   * Đảm bảo giao diện (Navbar, các khóa) mở ra tức thì không độ trễ.
   */
  const refreshUserPlan = (planType) => {
    setProfile(prev => prev ? { ...prev, plan_type: planType } : { plan_type: planType });
  };

  const isPremium = profile?.plan_type === 'premium';

  return (
    <AuthContext.Provider value={{ user, session, profile, isPremium, loading, isRecovery, signOut, clearRecovery, refreshProfile, refreshUserPlan }}>
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
