package com.eventbooking.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Dịch vụ xử lý việc gửi email tới khách hàng (Gửi OTP, Gửi vé QR, Thông báo hủy).
 */
@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Cung cấp chức năng gửi mã OTP đăng ký / quên mật khẩu qua email.
     */
    @Async
    public void sendOtpEmail(String toEmail, String fullName, String otpCode, String purpose) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("hoangnguyen6533@gmail.com", "Event Booking System");
            helper.setTo(toEmail);

            String subject;
            String purposeText;
            String actionText;

            if ("REGISTER".equals(purpose)) {
                subject = "🎫 Xác thực tài khoản - Event Booking";
                purposeText = "Bạn vừa đăng ký tài khoản trên hệ thống Event Booking.";
                actionText = "xác thực email";
            } else {
                subject = "🔑 Đặt lại mật khẩu - Event Booking";
                purposeText = "Bạn vừa yêu cầu đặt lại mật khẩu trên hệ thống Event Booking.";
                actionText = "đặt lại mật khẩu";
            }

            helper.setSubject(subject);

            String htmlContent = """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #1a1a2e; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
                    <div style="background: linear-gradient(135deg, #6c5ce7, #a29bfe); padding: 32px 24px; text-align: center;">
                        <h1 style="color: #fff; margin: 0; font-size: 24px;">🎫 Event Booking</h1>
                        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0;">Hệ thống đặt vé sự kiện</p>
                    </div>
                    <div style="padding: 32px 24px; color: #e2e8f0;">
                        <p style="margin: 0 0 8px;">Xin chào <strong style="color: #a29bfe;">%s</strong>,</p>
                        <p style="margin: 0 0 24px; color: #94a3b8;">%s</p>
                        <p style="margin: 0 0 12px; color: #94a3b8;">Mã OTP để %s của bạn là:</p>
                        <div style="background: #16213e; border: 2px solid #6c5ce7; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px;">
                            <span style="font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #6c5ce7;">%s</span>
                        </div>
                        <p style="margin: 0 0 4px; color: #f87171; font-size: 14px;">⏰ Mã này có hiệu lực trong <strong>5 phút</strong>.</p>
                        <p style="margin: 0; color: #64748b; font-size: 13px;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
                    </div>
                    <div style="background: #16213e; padding: 16px 24px; text-align: center;">
                        <p style="margin: 0; color: #475569; font-size: 12px;">© 2026 Event Booking System</p>
                    </div>
                </div>
                """.formatted(fullName, purposeText, actionText, otpCode);

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            throw new RuntimeException("Không thể gửi email: " + e.getMessage(), e);
        }
    }

    /**
     * Gửi vé điện tử kèm mã QR bằng hình ảnh nội tuyến (inline image) sau khi thanh toán thành công.
     */
    @Async
    public void sendTicketEmail(String toEmail, String fullName, String bookingCode, String eventTitle, java.time.LocalDateTime eventDate, byte[] qrImage, int currentTicket, int totalTickets) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("hoangnguyen6533@gmail.com", "Event Booking System");
            helper.setTo(toEmail);
            helper.setSubject("🎫 Vé điện tử của bạn [" + currentTicket + "/" + totalTickets + "] - " + eventTitle);

            String eventDateStr = "";
            if (eventDate != null) {
                java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy");
                eventDateStr = "<p style=\"margin: 0 0 24px; font-size: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;\">📅 Bạn đã đặt vé tham gia vào ngày: <strong style=\"color: #10b981; font-size: 18px;\">" + eventDate.format(formatter) + "</strong></p>";
            }

            String htmlContent = """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
                    <div style="background: linear-gradient(135deg, #10b981, #34d399); padding: 32px 24px; text-align: center;">
                        <h1 style="color: #fff; margin: 0; font-size: 24px;">🎫 Event Booking</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">Vé điện tử sự kiện</p>
                    </div>
                    <div style="padding: 32px 24px; color: #334155;">
                        <p style="margin: 0 0 12px; font-size: 16px;">Xin chào <strong>%s</strong>,</p>
                        <p style="margin: 0 0 24px; line-height: 1.6;">Cảm ơn bạn đã đặt vé. Thanh toán cho đơn hàng <strong>#%s</strong> của sự kiện <strong>%s</strong> đã thành công.</p>
                        %s
                        <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px;">
                            <div style="display: inline-block; background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 700; margin-bottom: 12px;">VÉ %d / %d</div>
                            <p style="margin: 0 0 16px; font-weight: 600; color: #475569;">MÃ QUÉT TẠI SỰ KIỆN</p>
                            <img src='cid:qrImageId' alt='QR Code' style="width: 200px; height: 200px; display: block; margin: 0 auto; border-radius: 8px;" />
                        </div>
                        
                        <p style="margin: 0; color: #64748b; font-size: 14px; text-align: center;">Chỉ cần giơ hình ảnh QR này để check-in tại cổng sự kiện.</p>
                    </div>
                    <div style="background: #f1f5f9; padding: 16px 24px; text-align: center;">
                        <p style="margin: 0; color: #64748b; font-size: 12px;">© 2026 Event Booking System</p>
                    </div>
                </div>
                """.formatted(fullName, bookingCode, eventTitle, eventDateStr, currentTicket, totalTickets);

            helper.setText(htmlContent, true);
            
            // Add inline image using ByteArrayResource
            org.springframework.core.io.ByteArrayResource qrResource = new org.springframework.core.io.ByteArrayResource(qrImage);
            helper.addInline("qrImageId", qrResource, "image/png");

            mailSender.send(message);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            throw new RuntimeException("Không thể gửi email vé: " + e.getMessage(), e);
        }
    }

    @Async
    public void sendCancellationEmail(String toEmail, String fullName, String eventTitle) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("hoangnguyen6533@gmail.com", "Event Booking System");
            helper.setTo(toEmail);
            helper.setSubject("🚨 Thông báo hủy sự kiện - " + eventTitle);

            String htmlContent = """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
                    <div style="background: linear-gradient(135deg, #ef4444, #f87171); padding: 32px 24px; text-align: center;">
                        <h1 style="color: #fff; margin: 0; font-size: 24px;">🎫 Event Booking</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">Thông báo quan trọng</p>
                    </div>
                    <div style="padding: 32px 24px; color: #334155;">
                        <p style="margin: 0 0 12px; font-size: 16px;">Xin chào <strong>%s</strong>,</p>
                        <p style="margin: 0 0 24px; line-height: 1.6;">Chúng tôi rất tiếc phải thông báo rằng sự kiện <strong>%s</strong> mà bạn đã mua vé đã bị <strong>HỦY</strong> từ phía ban tổ chức.</p>
                        
                        <div style="background: #fef2f2; border: 2px dashed #fca5a5; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px;">
                            <p style="margin: 0 0 16px; font-weight: 600; color: #b91c1c;">HƯỚNG DẪN HOÀN TIỀN (REFUND)</p>
                            <p style="margin: 0; font-size: 14px; color: #991b1b;">Vui lòng phản hồi (reply) lại email này kèm theo <strong>Thông tin tài khoản ngân hàng (Tên ngân hàng, Số tài khoản, Tên chủ tài khoản)</strong> và mã đơn hàng của bạn để chúng tôi tiến hành hoàn tiền trong thời gian sớm nhất.</p>
                        </div>
                        
                        <p style="margin: 0; color: #64748b; font-size: 14px; text-align: center;">Cáo lỗi vì sự bất tiện này. Cảm ơn bạn đã thông cảm.</p>
                    </div>
                    <div style="background: #f1f5f9; padding: 16px 24px; text-align: center;">
                        <p style="margin: 0; color: #64748b; font-size: 12px;">© 2026 Event Booking System</p>
                    </div>
                </div>
                """.formatted(fullName, eventTitle);

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            throw new RuntimeException("Không thể gửi email thông báo hủy: " + e.getMessage(), e);
        }
    }
}
