import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiLoader, FiArrowRight, FiHome } from 'react-icons/fi';

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // processing, success, failed
  const [message, setMessage] = useState('');
  const [bookingCode, setBookingCode] = useState('');

  useEffect(() => {
    const processPaymentReturn = async () => {
      try {
        const params = {};
        for (const [key, value] of searchParams.entries()) {
          params[key] = value;
        }

        if (Object.keys(params).length === 0) {
          setStatus('failed');
          setMessage('Không tìm thấy thông tin giao dịch');
          return;
        }

        // Add a slight artificial delay for better UX on fast connections
        await new Promise(resolve => setTimeout(resolve, 800));

        const res = await fetch(`http://localhost:8080/api/payment/vnpay-return?${new URLSearchParams(params).toString()}`);
        const data = await res.json();
        
        if (data.status === 'SUCCESS') {
          setStatus('success');
          setMessage(data.message || 'Giao dịch của bạn đã được xác nhận.');
          setBookingCode(data.bookingCode);
        } else {
          setStatus('failed');
          setMessage(data.message || 'Giao dịch không thành công hoặc đã bị hủy.');
        }
      } catch (err) {
        setStatus('failed');
        setMessage('Lỗi khi kết nối đến hệ thống. Vui lòng kiểm tra lại sau.');
      }
    };

    processPaymentReturn();
  }, [searchParams]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-lg p-8 rounded-3xl overflow-hidden shadow-2xl slide-up"
        style={{
          background: 'rgba(30, 41, 59, 0.7)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        {/* Decorative background glows */}
        <div className={`absolute -top-32 -left-32 w-64 h-64 rounded-full blur-3xl opacity-20 transition-colors duration-1000 ${status === 'success' ? 'bg-green-500' : status === 'failed' ? 'bg-red-500' : 'bg-sky-500'}`} />
        <div className={`absolute -bottom-32 -right-32 w-64 h-64 rounded-full blur-3xl opacity-20 transition-colors duration-1000 ${status === 'success' ? 'bg-green-500' : status === 'failed' ? 'bg-red-500' : 'bg-sky-500'}`} />

        <div className="relative z-10 text-center">
          
          {/* PROCESSING STATE */}
          {status === 'processing' && (
            <div className="py-12 animate-pulse">
              <div className="w-24 h-24 bg-sky-500/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                <FiLoader className="w-10 h-10 text-sky-400 animate-spin" />
                <div className="absolute inset-0 rounded-full border-t-2 border-sky-400/50 animate-spin" style={{ animationDuration: '2s' }}></div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Đang xử lý thanh toán</h2>
              <p className="text-slate-400 text-lg">Hệ thống đang xác thực giao dịch với VNPay.<br/>Vui lòng đợi trong giây lát...</p>
            </div>
          )}

          {/* SUCCESS STATE */}
          {status === 'success' && (
            <div className="py-6 slide-up">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(52,211,153,0.3)]">
                <FiCheckCircle className="w-12 h-12 text-white" />
              </div>
              
              <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 mb-3 tracking-tight">Thanh toán thành công!</h2>
              <p className="text-slate-300 text-lg mb-8">{message}</p>
              
              {bookingCode && (
                <div className="bg-slate-900/80 p-6 rounded-2xl mb-8 border border-green-500/20 shadow-inner relative overflow-hidden group hover:border-green-500/40 transition-colors">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-2xl rounded-full transform translate-x-10 -translate-y-10 group-hover:bg-green-500/20 transition-all"></div>
                  <span className="text-sm text-slate-400 font-medium block mb-2 uppercase tracking-wide">Mã vé của bạn</span>
                  <div className="flex items-center justify-center gap-3 relative z-10">
                    <span className="text-3xl font-black text-white font-mono tracking-widest">{bookingCode}</span>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col gap-3">
                <Link to="/my-bookings" className="btn btn-primary w-full flex items-center justify-center gap-2 group text-lg p-4">
                  Xem chi tiết vé
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/" className="btn w-full bg-slate-800 hover:bg-slate-700 focus:ring-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center gap-2 p-4">
                  <FiHome />
                  Về trang chủ
                </Link>
              </div>
            </div>
          )}

          {/* FAILED STATE */}
          {status === 'failed' && (
            <div className="py-6 slide-up">
              <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-rose-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                <FiXCircle className="w-12 h-12 text-white" />
              </div>
              
              <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-500 mb-3 tracking-tight">Thanh toán thất bại</h2>
              <p className="text-slate-300 text-lg mb-8">{message}</p>
              
              <div className="bg-red-500/10 p-6 rounded-2xl mb-8 border border-red-500/20 text-left">
                 <p className="text-slate-300 text-sm leading-relaxed text-center">
                   Giao dịch không thể hoàn tất. Vui lòng kiểm tra lại số dư thẻ, hạn mức giao dịch hoặc thử lại bằng một phương thức thanh toán khác.<br/><br/> Đơn đặt vé của bạn chưa bị trừ tiền.
                 </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => navigate(-1)} 
                  className="btn bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex-1 py-3 text-base flex items-center justify-center gap-2"
                >
                  Thử lại
                </button>
                <Link 
                  to="/my-bookings" 
                  className="btn btn-primary flex-1 py-3 text-base flex items-center justify-center gap-2"
                >
                  Đơn mua
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
