package com.eventbooking.service;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Dịch vụ xử lý lưu trữ hình ảnh tải lên máy chủ cục bộ (Uploads), chống trùng lặp tên file.
 */
@Service
@Slf4j
public class FileStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private Path rootLocation;

    @PostConstruct
    public void init() {
        rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(rootLocation);
            log.info("📂 Upload directory ready: {}", rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + rootLocation, e);
        }
    }

    /**
     * Store a file in a sub-folder (e.g. "events", "venues").
     *
     * @param file      the uploaded file
     * @param subFolder sub-directory under uploads (e.g. "events", "venues")
     * @return the relative URL path to access the file, e.g. "/uploads/events/abc123.jpg"
     */
    public String store(MultipartFile file, String subFolder) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty or null");
        }

        try {
            Path targetDir = rootLocation.resolve(subFolder);
            Files.createDirectories(targetDir);

            // Generate unique filename to avoid collision
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFilename = UUID.randomUUID().toString() + extension;

            Path targetPath = targetDir.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            log.info("✅ File saved: {}", targetPath);
            return "/uploads/" + subFolder + "/" + uniqueFilename;

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }
}
