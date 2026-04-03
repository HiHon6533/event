package com.eventbooking.service.impl;

import com.eventbooking.entity.SystemConfig;
import com.eventbooking.exception.ResourceNotFoundException;
import com.eventbooking.repository.SystemConfigRepository;
import com.eventbooking.service.SystemConfigService;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SystemConfigServiceImpl implements SystemConfigService {

    private final SystemConfigRepository systemConfigRepository;

    public static final String KEY_SERVICE_FEE = "SERVICE_FEE";
    public static final String KEY_COMMISSION_RATE = "COMMISSION_RATE";

    public SystemConfigServiceImpl(SystemConfigRepository systemConfigRepository) {
        this.systemConfigRepository = systemConfigRepository;
    }

    @PostConstruct
    public void initDefaultConfigs() {
        if (!systemConfigRepository.existsById(KEY_SERVICE_FEE)) {
            systemConfigRepository.save(SystemConfig.builder()
                    .configKey(KEY_SERVICE_FEE)
                    .configValue("10000")
                    .description("Phí dịch vụ thu thêm cho mỗi vé (Service Fee)")
                    .build());
        }
        if (!systemConfigRepository.existsById(KEY_COMMISSION_RATE)) {
            systemConfigRepository.save(SystemConfig.builder()
                    .configKey(KEY_COMMISSION_RATE)
                    .configValue("5")
                    .description("Tỷ lệ hoa hồng nền tảng thu của Ban tổ chức (%)")
                    .build());
        }
    }

    @Override
    public List<SystemConfig> getAllConfigs() {
        return systemConfigRepository.findAll();
    }

    @Override
    @Transactional
    public SystemConfig updateConfig(String key, String value) {
        SystemConfig config = systemConfigRepository.findById(key)
                .orElseThrow(() -> new ResourceNotFoundException("Config key not found"));
        config.setConfigValue(value);
        return systemConfigRepository.save(config);
    }

    @Override
    public String getConfigValue(String key, String defaultValue) {
        return systemConfigRepository.findById(key)
                .map(SystemConfig::getConfigValue)
                .orElse(defaultValue);
    }

    @Override
    public Map<String, String> getPublicConfigs() {
        Map<String, String> map = new HashMap<>();
        map.put(KEY_SERVICE_FEE, getConfigValue(KEY_SERVICE_FEE, "0"));
        return map;
    }
}
