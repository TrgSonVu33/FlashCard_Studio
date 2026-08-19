import { supabase } from '@/services/supabase';

/**
 * Payment Service
 * Xử lý logic thanh toán và tạo VietQR URL.
 * 
 * === HƯỚNG DẪN SỬ DỤNG ===
 * 1. Thay thế VIETQR_CONFIG bằng thông tin ngân hàng thật của bạn.
 * 2. Khi tích hợp PayOS/Stripe thật, thay thế simulatePremiumUpgrade()
 *    bằng webhook xác nhận từ cổng thanh toán.
 */

// === CẤU HÌNH VIETQR (Thay thế bằng thông tin thật) ===
const VIETQR_CONFIG = {
  BANK_BIN: '970436',            // Mã BIN ngân hàng (VD: 970436 = Vietcombank)
  ACCOUNT_NO: '1012743065',      // Số tài khoản nhận tiền
  ACCOUNT_NAME: 'VU TRUONG SON', // Tên chủ tài khoản
  TEMPLATE: 'compact2',          // Template hiển thị QR (compact, compact2, qr_only, print)
};

/**
 * Tạo URL hình ảnh VietQR dựa trên thông tin cấu hình.
 * Sử dụng VietQR Quick Link API chính thức.
 * 
 * @param {string} userId - ID người dùng (dùng làm mã tham chiếu giao dịch)
 * @returns {string} URL hình ảnh QR code
 */
export function generateVietQRUrl(userId) {
  const { BANK_BIN, ACCOUNT_NO, ACCOUNT_NAME, TEMPLATE } = VIETQR_CONFIG;
  
  // addInfo = Nội dung chuyển khoản để định danh giao dịch
  const addInfo = encodeURIComponent(`${userId}_UPGRADE`);
  const encodedName = encodeURIComponent(ACCOUNT_NAME);
  
  // amount=0 vì đây là test mode, thay bằng giá thật khi go-live
  return `https://img.vietqr.io/image/${BANK_BIN}-${ACCOUNT_NO}-${TEMPLATE}.png?amount=0&addInfo=${addInfo}&accountName=${encodedName}`;
}

/**
 * Gọi Supabase RPC để mô phỏng việc nâng cấp Premium.
 * Hàm RPC server-side sẽ:
 *   1. Xác thực user
 *   2. Ghi nhận payment vào bảng payments
 *   3. Cập nhật plan_type trong profiles
 * 
 * @returns {Object} Kết quả từ RPC: { success, payment_id, transaction_ref, plan_type }
 * @throws {Error} Nếu RPC thất bại
 */
export async function simulatePremiumUpgrade() {
  try {
    console.log('[PaymentService] Calling simulate_premium_upgrade RPC...');
    
    const { data, error } = await supabase.rpc('simulate_premium_upgrade');
    
    if (error) {
      console.error('[PaymentService] RPC error:', error);
      throw new Error(error.message || 'Failed to process upgrade');
    }
    
    // RPC trả về JSON object
    if (!data?.success) {
      console.warn('[PaymentService] Upgrade rejected:', data?.error);
      throw new Error(data?.error || 'Upgrade was not successful');
    }
    
    console.log('[PaymentService] Upgrade successful:', data);
    return data;
    
  } catch (err) {
    console.error('[PaymentService] simulatePremiumUpgrade failed:', err);
    throw err;
  }
}

/**
 * Lấy lịch sử thanh toán của user hiện tại.
 * Có thể dùng cho trang Account/Billing trong tương lai.
 * 
 * @returns {Array} Danh sách payment records
 */
export async function fetchPaymentHistory() {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('[PaymentService] fetchPaymentHistory error:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('[PaymentService] fetchPaymentHistory failed:', err);
    return [];
  }
}

/**
 * Hàm hạ cấp người dùng về gói Basic.
 * Cập nhật trực tiếp plan_type trong bảng profiles.
 * 
 * @param {string} userId - ID của người dùng
 * @returns {boolean} true nếu thành công, false nếu thất bại
 */
export async function downgradeToBasic(userId) {
  if (!userId) return false;
  
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ plan_type: 'basic' })
      .eq('id', userId);
      
    if (error) {
      console.error('[PaymentService] downgradeToBasic error:', error);
      throw error;
    }
    
    console.log('[PaymentService] Successfully downgraded to basic for user:', userId);
    return true;
  } catch (err) {
    console.error('[PaymentService] downgradeToBasic failed:', err);
    return false;
  }
}
