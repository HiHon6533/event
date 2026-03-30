package com.eventbooking.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

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
}
