package com.eventbooking.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/events/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/venues/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/tickets/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/payment/vnpay-return").permitAll()
                .requestMatchers("/uploads/**").permitAll()

                // Dashboard: ADMIN + MANAGER (Manager sees only own data via service layer)
                .requestMatchers("/api/dashboard/**").hasAnyRole("ADMIN", "MANAGER")

                // Admin-only: user management, organizer request management
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // Events: ADMIN + MANAGER can create/update (service layer enforces ownership)
                .requestMatchers(HttpMethod.POST, "/api/events/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.PUT, "/api/events/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.PATCH, "/api/events/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.DELETE, "/api/events/**").hasAnyRole("ADMIN", "MANAGER")

                // Venues: Admin only
                .requestMatchers(HttpMethod.POST, "/api/venues/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/venues/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/venues/**").hasRole("ADMIN")

                // Zones: Admin only
                .requestMatchers(HttpMethod.POST, "/api/zones/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/zones/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/zones/**").hasRole("ADMIN")

                // Ticket Categories: ADMIN + MANAGER (service layer enforces ownership)
                .requestMatchers(HttpMethod.POST, "/api/ticket-categories/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.PUT, "/api/ticket-categories/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.DELETE, "/api/ticket-categories/**").hasAnyRole("ADMIN", "MANAGER")

                // Uploads: ADMIN + MANAGER
                .requestMatchers(HttpMethod.POST, "/api/upload/**").hasAnyRole("ADMIN", "MANAGER")

                // Bookings admin view: ADMIN + MANAGER
                .requestMatchers("/api/bookings/admin/**").hasAnyRole("ADMIN", "MANAGER")

                // All other endpoints require authentication
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
