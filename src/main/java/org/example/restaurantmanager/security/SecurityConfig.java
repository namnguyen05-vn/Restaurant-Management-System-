package org.example.restaurantmanager.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(AbstractHttpConfigurer::disable)
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/error").permitAll()

                        // BỔ SUNG DÒNG NÀY: Mở cửa tự do cho tất cả các file Giao diện Web (HTML, CSS, JS, Ảnh)
                        .requestMatchers("/", "/HTML/**", "/CSS/**", "/JS/**", "/image/**", "/*.html", "/*favicon.ico").permitAll()

                        .requestMatchers("/error").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        .requestMatchers("/api/users/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/foods/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/orders").permitAll() // Khách gọi món
                        .requestMatchers(HttpMethod.GET, "/api/tables/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/orders/**").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/orders/**").permitAll()
                        // 2. NHỮNG API BẮT BUỘC PHẢI LÀ ADMIN (Khóa chặt Thêm, Sửa, XÓA)

                        // Phân quyền Món ăn
                        .requestMatchers(HttpMethod.POST, "/api/foods").hasAuthority("Admin")
                        .requestMatchers(HttpMethod.PUT, "/api/foods/**").hasAuthority("Admin")
                        .requestMatchers(HttpMethod.DELETE, "/api/foods/**").hasAuthority("Admin") // THÊM DÒNG NÀY ĐỂ KHÓA NÚT XÓA

                        // Phân quyền Bàn ăn (Chỉ Admin mới được thêm/sửa/xóa bàn)
                        .requestMatchers(HttpMethod.POST, "/api/tables").hasAuthority("Admin")
                        .requestMatchers(HttpMethod.PUT, "/api/tables/**").hasAuthority("Admin")
                        .requestMatchers(HttpMethod.DELETE, "/api/tables/**").hasAuthority("Admin")
                        .requestMatchers(HttpMethod.GET, "/api/invoices/**").hasAuthority("Admin")
                        // Phân quyền Nhân viên và Doanh thu
                        .requestMatchers("/api/dashboard/**").hasAuthority("Admin")
                        .requestMatchers("/api/users/**").hasAuthority("Admin")

                        // 3. CÁC API CÒN LẠI (Staff và Admin đều vào được)
                        // Ví dụ: Xem danh sách đơn hàng, Đổi trạng thái đơn, Thanh toán...
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}