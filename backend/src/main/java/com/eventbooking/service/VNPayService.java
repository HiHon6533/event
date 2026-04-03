package com.eventbooking.service;

import com.eventbooking.config.VNPayConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Dịch vụ cấu hình và mã hóa chữ ký giao dịch cho cổng thanh toán VNPay (HMAC SHA512).
 */
@Service
public class VNPayService {

    private static final Logger log = LoggerFactory.getLogger(VNPayService.class);
    private final VNPayConfig vnPayConfig;

    public VNPayService(VNPayConfig vnPayConfig) {
        this.vnPayConfig = vnPayConfig;
    }

    public String createPaymentUrl(Long bookingId, long amount, String orderInfo, String ipAddress) {
        String vnpVersion = "2.1.0";
        String vnpCommand = "pay";
        String vnpTxnRef = bookingId + "_" + System.currentTimeMillis();
        String vnpOrderType = "billpayment";
        String vnpLocale = "vn";
        String vnpCurrCode = "VND";

        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", vnpVersion);
        vnpParams.put("vnp_Command", vnpCommand);
        vnpParams.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        vnpParams.put("vnp_Amount", String.valueOf(amount * 100));
        vnpParams.put("vnp_CurrCode", vnpCurrCode);
        vnpParams.put("vnp_TxnRef", vnpTxnRef);
        vnpParams.put("vnp_OrderInfo", orderInfo);
        vnpParams.put("vnp_OrderType", vnpOrderType);
        vnpParams.put("vnp_Locale", vnpLocale);
        vnpParams.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        vnpParams.put("vnp_IpAddr", ipAddress);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnpCreateDate = formatter.format(cld.getTime());
        vnpParams.put("vnp_CreateDate", vnpCreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnpExpireDate = formatter.format(cld.getTime());
        vnpParams.put("vnp_ExpireDate", vnpExpireDate);

        // Build data to hash and querystring - EXACTLY as VNPay official Java demo
        List fieldNames = new ArrayList(vnpParams.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = (String) vnpParams.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                // Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                // Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String queryUrl = query.toString();
        String vnpSecureHash = hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnpSecureHash;

        String paymentUrl = vnPayConfig.getVnpUrl() + "?" + queryUrl;

        log.info("VNPAY hashData: {}", hashData.toString());
        log.info("VNPAY URL: {}", paymentUrl);

        return paymentUrl;
    }

    public boolean validateSignature(Map<String, String> params) {
        String vnpSecureHash = params.get("vnp_SecureHash");
        if (vnpSecureHash == null)
            return false;

        Map<String, String> fields = new HashMap<>();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            String fieldName = entry.getKey();
            String fieldValue = entry.getValue();
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                fields.put(fieldName, fieldValue);
            }
        }

        fields.remove("vnp_SecureHashType");
        fields.remove("vnp_SecureHash");

        String signValue = hashAllFields(fields);
        return signValue.equals(vnpSecureHash);
    }

    private String hashAllFields(Map<String, String> fields) {
        List fieldNames = new ArrayList(fields.keySet());
        Collections.sort(fieldNames);
        StringBuilder sb = new StringBuilder();
        Iterator itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = (String) fields.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                sb.append(fieldName);
                sb.append("=");
                sb.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
            }
            if (itr.hasNext()) {
                sb.append("&");
            }
        }
        return hmacSHA512(vnPayConfig.getHashSecret(), sb.toString());
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] result = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi tạo chữ ký HMAC SHA512", e);
        }
    }
}
