package org.example.restaurantmanager.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
    // Chìa khóa bí mật (Secret Key) dùng để khóa và mở Token. Phải giữ kín!
    private final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    // Thời gian sống của Token: 24 giờ
    private final long EXPIRATION_TIME = 86400000;

    // Hàm tạo Token khi user đăng nhập đúng
    public String generateToken(String username, String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role) // Nhét Role (Admin/Staff) vào trong Token
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key)
                .compact();
    }

    // Hàm giải mã để lấy Role từ Token (dùng khi khách gọi API xóa/sửa)
    public Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}