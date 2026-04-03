package com.eventbooking.service;

import com.eventbooking.entity.SystemConfig;
import java.util.List;
import java.util.Map;

public interface SystemConfigService {
    List<SystemConfig> getAllConfigs();
    SystemConfig updateConfig(String key, String value);
    String getConfigValue(String key, String defaultValue);
    Map<String, String> getPublicConfigs();
}
