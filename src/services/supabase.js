import { createClient } from '@supabase/supabase-js'

/**
 * File cấu hình dịch vụ Supabase (BaaS - Backend as a Service).
 * Sử dụng thư viện @supabase/supabase-js để tạo một máy khách (client) 
 * giao tiếp với cơ sở dữ liệu Postgres và các dịch vụ khác của Supabase.
 */

// Lấy các biến môi trường (Environment Variables) cấu hình kết nối Supabase.
// Vite yêu cầu các biến môi trường phía client phải bắt đầu bằng tiền tố VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Khởi tạo và xuất (export) instance (client) duy nhất của Supabase.
 * Việc export như thế này giúp toàn bộ ứng dụng (hooks, components) 
 * có thể import và tái sử dụng chung một kết nối duy nhất thay vì tạo lại nhiều lần.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
