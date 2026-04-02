import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { HiCheckCircle, HiXCircle, HiHome, HiTicket } from 'react-icons/hi';

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('');
  const [bookingCode, setBookingCode] = useState('');
  const [bookingId, setBookingId] = useState(null);
  const [transactionId, setTransactionId] = useState('');

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

        await new Promise(resolve => setTimeout(resolve, 1200));

        const res = await fetch(`http://localhost:8080/api/payment/vnpay-return?${new URLSearchParams(params).toString()}`);
        const data = await res.json();

        if (data.status === 'SUCCESS') {
          setStatus('success');
          setMessage(data.message || 'Giao dịch của bạn đã được xác nhận.');
          setBookingCode(data.bookingCode);
          setBookingId(data.bookingId);
          setTransactionId(data.transactionId || '');
        } else {
          setStatus('failed');
          setMessage(data.message || 'Giao dịch không thành công hoặc đã bị hủy.');
        }
      } catch {
        setStatus('failed');
        setMessage('Lỗi khi kết nối đến hệ thống. Vui lòng kiểm tra lại sau.');
      }
    };

    processPaymentReturn();
  }, [searchParams]);

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div className="slide-up" style={{
        position: 'relative',
        width: '100%',
        maxWidth: '520px',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'var(--bg-card)',
      }}>
        {/* Glow effect */}
        <div style={{
          position: 'absolute', top: '-100px', left: '-100px',
          width: '260px', height: '260px', borderRadius: '50%',
          filter: 'blur(80px)', opacity: 0.15, pointerEvents: 'none',
          background: status === 'success' ? '#2e8b57' : status === 'failed' ? '#ef4444' : '#d81b2e',
        }} />
        <div style={{
          position: 'absolute', bottom: '-100px', right: '-100px',
          width: '260px', height: '260px', borderRadius: '50%',
          filter: 'blur(80px)', opacity: 0.15, pointerEvents: 'none',
          background: status === 'success' ? '#2e8b57' : status === 'failed' ? '#ef4444' : '#d81b2e',
        }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '40px 32px' }}>

          {/* ═══ PROCESSING ═══ */}
          {status === 'processing' && (
            <div>
              <div style={{
                width: '90px', height: '90px', borderRadius: '50%',
                background: 'rgba(216, 27, 46, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 28px',
                border: '3px solid rgba(216, 27, 46, 0.3)',
                animation: 'spin 1.5s linear infinite',
              }}>
                <span style={{ fontSize: '2.5rem' }}>⏳</span>
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
                Đang xử lý thanh toán
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6 }}>
                Hệ thống đang xác thực giao dịch với VNPay.<br />
                Vui lòng đợi trong giây lát...
              </p>
            </div>
          )}

          {/* ═══ SUCCESS ═══ */}
          {status === 'success' && (
            <div className="fade-in">
              {/* Icon */}
              <div style={{
                width: '96px', height: '96px', borderRadius: '50%',
                background: '#2e8b57',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 0 40px rgba(16, 185, 129, 0.3)',
              }}>
                <HiCheckCircle size={52} color="white" />
              </div>

              {/* Title */}
              <h2 style={{
                fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px',
                background: '#2e8b57',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Thanh toán thành công!
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '28px' }}>
                {message}
              </p>

              {/* Ticket card */}
              {bookingCode && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.06)',
                  border: '1px dashed rgba(16, 185, 129, 0.35)',
                  borderRadius: '16px',
                  padding: '24px',
                  marginBottom: '12px',
                }}>
                  <span style={{
                    display: 'block', fontSize: '0.8rem', fontWeight: 600,
                    color: 'var(--text-muted)', textTransform: 'uppercase',
                    letterSpacing: '1.5px', marginBottom: '8px',
                  }}>Mã đơn hàng</span>
                  <span style={{
                    display: 'block', fontSize: '2rem', fontWeight: 900,
                    color: 'var(--text-primary)', fontFamily: 'monospace',
                    letterSpacing: '4px',
                  }}>{bookingCode}</span>
                </div>
              )}

              {transactionId && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '28px' }}>
                  Mã giao dịch VNPay: <strong style={{ color: 'var(--text-secondary)' }}>{transactionId}</strong>
                </p>
              )}

              <p style={{
                color: 'var(--success)', fontSize: '0.9rem', marginBottom: '28px',
                background: 'rgba(16, 185, 129, 0.08)', padding: '12px 16px', borderRadius: '12px',
              }}>
                ✉️ Vé điện tử (QR Code) đã được gửi đến email của bạn!
              </p>

              {/* Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link
                  to={bookingId ? `/bookings/${bookingId}` : '/my-bookings'}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', fontSize: '1.05rem' }}
                >
                  <HiTicket size={20} />
                  Xem chi tiết vé
                </Link>
                <Link
                  to="/"
                  className="btn"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '14px', fontSize: '1rem',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <HiHome size={18} />
                  Về trang chủ
                </Link>
              </div>
            </div>
          )}

          {/* ═══ FAILED ═══ */}
          {status === 'failed' && (
            <div className="fade-in">
              {/* Icon */}
              <div style={{
                width: '96px', height: '96px', borderRadius: '50%',
                background: '#d81b2e',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 0 40px rgba(239, 68, 68, 0.3)',
              }}>
                <HiXCircle size={52} color="white" />
              </div>

              {/* Title */}
              <h2 style={{
                fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px',
                background: '#d81b2e',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Thanh toán thất bại
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '28px' }}>
                {message}
              </p>

              {/* Info box */}
              <div style={{
                background: 'rgba(239, 68, 68, 0.06)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '28px',
                textAlign: 'left',
              }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7, margin: 0, textAlign: 'center' }}>
                  Giao dịch không thể hoàn tất. Vui lòng kiểm tra lại số dư thẻ, hạn mức giao dịch hoặc thử lại bằng phương thức thanh toán khác.<br /><br />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    💡 Đơn đặt vé của bạn chưa bị trừ tiền.
                  </span>
                </p>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => navigate(-1)}
                  className="btn"
                  style={{
                    flex: 1, padding: '14px', fontSize: '1rem',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
                    color: 'var(--text-secondary)', cursor: 'pointer',
                  }}
                >
                  ← Thử lại
                </button>
                <Link
                  to="/my-bookings"
                  className="btn btn-primary"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', fontSize: '1rem' }}
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
