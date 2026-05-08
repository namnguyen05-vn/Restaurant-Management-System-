package org.example.restaurantmanager.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Lấy chuỗi Token từ Header của Request gửi lên
        String authHeader = request.getHeader("Authorization");
        String token = null;

        // Chuẩn JWT luôn bắt đầu bằng chữ "Bearer "
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7); // Cắt bỏ chữ Bearer để lấy đúng cái mã
        }

        // 2. Nếu có Token, tiến hành giải mã
        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                Claims claims = jwtUtil.extractClaims(token);
                String username = claims.getSubject();
                String role = claims.get("role", String.class);

                // 3. Nếu giải mã thành công, báo cho Spring Security biết "Người này hợp lệ, có quyền Role này"
                if (username != null) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            username, null, Collections.singletonList(new SimpleGrantedAuthority(role))
                    );
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (Exception e) {
                // Nếu Token sai, hết hạn hoặc bị giả mạo -> Bỏ qua, để cho Spring Security tự chặn lại
                System.out.println("Token không hợp lệ: " + e.getMessage());
            }
        }

        // 4. Cho phép Request đi tiếp qua các lớp lọc khác
        filterChain.doFilter(request, response);
    }
}