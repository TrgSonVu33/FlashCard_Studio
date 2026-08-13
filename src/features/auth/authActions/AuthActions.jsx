import { useTheme } from '@/hooks/useTheme';
import ContactDropdown from '@/components/shared/contactDropdown/contactDropdown';
import '@/components/layout/navbar/navbar.css'; // Để dùng chung class của nút theme-switch

/**
 * Component: AuthActions
 * Hiển thị các nút nổi trên các trang xác thực (Login, SignUp, v.v.):
 * - Nút chuyển đổi Light/Dark mode (Góc trên phải)
 * - Nút liên hệ (Góc dưới phải)
 */
export default function AuthActions() {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Nút Theme Toggle ở góc trên phải */}
      <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 1000 }}>
        <button 
          onClick={toggleTheme} 
          className={`theme-switch ${theme === 'dark' ? 'theme-switch--dark' : ''}`}
          aria-label="Toggle Dark Mode"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '6px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div className="theme-switch-track" style={{ margin: 0 }}>
            <div className="theme-switch-thumb">
              {theme === 'dark' ? (
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{color: '#f8fafc'}}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{color: '#eab308'}}><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              )}
            </div>
          </div>
        </button>
      </div>

      {/* Nút Liên hệ ở góc dưới phải (ContactDropdown tự có position fixed trong CSS) */}
      <ContactDropdown />
    </>
  );
}
