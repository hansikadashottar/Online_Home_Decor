package com.homedecor.onlinehomedecor.config;

import com.homedecor.onlinehomedecor.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 1. 401 - JWT missing/invalid
    @Bean
    public AuthenticationEntryPoint authenticationEntryPoint() {
        return (request, response, authException) -> {

            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setContentType("application/json");

            response.getWriter().write(
                    "{\"message\":\"Authentication required\"}"
            );
        };
    }

    // 2. 403 - JWT valid but role not allowed
    @Bean
    public AccessDeniedHandler accessDeniedHandler() {
        return (request, response, accessDeniedException) -> {

            response.setStatus(HttpStatus.FORBIDDEN.value());
            response.setContentType("application/json");

            String message;

            // 3. PRODUCT - ADMIN ONLY
            if (request.getMethod().equals("POST")
                    && request.getServletPath().startsWith("/products")) {

                message = "You are not allowed to create products";

            } else if (request.getMethod().equals("PUT")
                    && request.getServletPath().startsWith("/products")) {

                message = "You are not allowed to update products";

            } else if (request.getMethod().equals("DELETE")
                    && request.getServletPath().startsWith("/products")) {

                message = "You are not allowed to delete products";
            }

            // 4. CATEGORY - ADMIN ONLY
            else if (request.getMethod().equals("POST")
                    && request.getServletPath().startsWith("/categories")) {

                message = "You are not allowed to create categories";

            } else if (request.getMethod().equals("PUT")
                    && request.getServletPath().startsWith("/categories")) {

                message = "You are not allowed to update categories";

            } else if (request.getMethod().equals("DELETE")
                    && request.getServletPath().startsWith("/categories")) {

                message = "You are not allowed to delete categories";

            } else {

                message = "You are not allowed to access this resource";
            }

            response.getWriter().write(
                    "{\"message\":\"" + message + "\"}"
            );
        };
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            AccessDeniedHandler accessDeniedHandler) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth

                        // 5. USER - PUBLIC APIs
                        .requestMatchers(
                                "/users",
                                "/users/login",
                                "/users/forgot-password",
                                "/users/reset-password"
                        ).permitAll()

                        // 6. CART - CUSTOMER ONLY
                        .requestMatchers(
                                "/cart",
                                "/cart/**"
                        ).hasRole("CUSTOMER")

                        // 7. ORDER - CUSTOMER CAN PLACE ORDER
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/orders"
                        ).hasRole("CUSTOMER")

                        // 8. ORDER - ADMIN CAN VIEW ALL ORDERS
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/orders/admin/all"
                        ).hasRole("ADMIN")

                        // 9. ORDER - ADMIN CAN VIEW SINGLE ORDER
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/orders/admin/*"
                        ).hasRole("ADMIN")

                        // 10. ORDER - ADMIN CAN UPDATE ORDER STATUS
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/orders/admin/*/status"
                        ).hasRole("ADMIN")

                        // 11. ORDER - CUSTOMER CAN CANCEL OWN ORDER
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/orders/*/cancel"
                        ).hasRole("CUSTOMER")

                        // 12. ORDER - CUSTOMER CAN VIEW OWN ORDERS
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/orders",
                                "/api/orders/**"
                        ).hasRole("CUSTOMER")

                        // 13. PRODUCT - CUSTOMER + ADMIN CAN VIEW
                        .requestMatchers(
                                HttpMethod.GET,
                                "/products",
                                "/products/**"
                        ).hasAnyRole("CUSTOMER", "ADMIN")

                        // 14. PRODUCT - ADMIN ONLY
                        .requestMatchers(
                                HttpMethod.POST,
                                "/products"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/products/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/products/**"
                        ).hasRole("ADMIN")

                        // 15. CATEGORY - CUSTOMER + ADMIN CAN VIEW
                        .requestMatchers(
                                HttpMethod.GET,
                                "/categories",
                                "/categories/**"
                        ).hasAnyRole("CUSTOMER", "ADMIN")

                        // 16. CATEGORY - ADMIN ONLY
                        .requestMatchers(
                                HttpMethod.POST,
                                "/categories"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/categories/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/categories/**"
                        ).hasRole("ADMIN")
                        // 17. PAYMENT - CUSTOMER ONLY
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/payments",
                                "/api/payments/verify"
                        ).hasRole("CUSTOMER")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/payments/order/*"
                        ).hasRole("CUSTOMER")
                        // 18. PAYMENT - ADMIN ONLY
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/payments/admin/**"
                        ).hasRole("ADMIN")

                        // 19. OTHER APIs - AUTHENTICATED USERS
                        .anyRequest().authenticated()
                )

                .exceptionHandling(exception -> exception
                        .accessDeniedHandler(accessDeniedHandler)
                        .authenticationEntryPoint(authenticationEntryPoint())
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}