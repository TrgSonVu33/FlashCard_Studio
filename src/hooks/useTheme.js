import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    // 1. Kiểm tra trong local storage
    const saved = localStorage.getItem('app-theme');
    if (saved) return saved;
    // 2. Dự phòng theo cài đặt hệ thống
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    // Áp dụng theme lên thẻ HTML gốc và lưu vào local storage
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme };
};
