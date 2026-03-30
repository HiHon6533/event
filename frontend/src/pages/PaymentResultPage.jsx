import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { paymentApi } from '../services/api';
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // processing, success, failed
  const [message, setMessage] = useState('');
  const [bookingCode, setBookingCode] = useState('');

  useEffect(() => {
    const processPaymentReturn = async () => {
      try {
        // Collect all URL params to send to backend exactly as received from VNPay
        const params = {};
        for (const [key, value] of searchParams.entries()) {
          params[key] = value;
        }

        if (Object.keys(params).length === 0) {
          setStatus('failed');
          setMessage('Không tìm thấy thông tin giao dịch');
          return;
        }

        const res = await fetch(`http://localhost:8080/api/payment/vnpay-return?${new URLSearchParams(params).toString()}`);
        const data = await res.json();
        
        if (data.status === 'SUCCESS') {
          setStatus('success');
          setMessage(data.message);
          setBookingCode(data.bookingCode);
        } else {
          setStatus('failed');
          setMessage(data.message);
        }
      } catch (err) {
        setStatus('failed');
        setMessage('Lỗi khi xác minh giao dịch với hệ thống');
      }
    };

    processPaymentReturn();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700 text-center">
        
        {status === 'processing' && (
          <div className="py-8">
            <FiLoader className="w-16 h-16 text-brand-400 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Đang xử lý giao dịch</h2>
            <p className="text-slate-400">Vui lòng không đóng trình duyệt lúc này...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Thanh toán thành công!</h2>
            <p className="text-slate-400 mb-6">{message}</p>
            {bookingCode && (
              <div className="bg-slate-900 p-4 rounded-xl mb-8 border border-slate-700">
                <span className="text-sm text-slate-500 block mb-1">Mã đơn vé của bạn</span>
                <span className="text-xl font-bold text-brand-400 font-mono tracking-wider">{bookingCode}</span>
              </div>
            )}
            <Link to="/my-bookings" className="btn btn-primary w-full block">Xem vé của tôi</Link>
          </div>
        )}

        {status === 'failed' && (
          <div className="py-8">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiXCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Thanh toán thất bại</h2>
            <p className="text-slate-400 mb-8">{message}</p>
            <div className="flex gap-4">
              <button onClick={() => navigate(-1)} className="btn btn-secondary flex-1">Quay lại</button>
              <Link to="/my-bookings" className="btn btn-primary flex-1">Đơn mua</Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
