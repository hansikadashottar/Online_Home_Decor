package com.homedecor.onlinehomedecor.config;

import com.homedecor.onlinehomedecor.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://localhost:5174"
        ));

        configuration.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "OPTIONS"
        ));

        configuration.setAllowedHeaders(List.of("*"));

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

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

    @Bean
    public AccessDeniedHandler accessDeniedHandler() {

        return (request, response, accessDeniedException) -> {

            response.setStatus(HttpStatus.FORBIDDEN.value());
            response.setContentType("application/json");

            String message;

            if (request.getMethod().equals("POST")
                    && request.getServletPath().startsWith("/products")) {

                message = "You are not allowed to create products";

            } else if (request.getMethod().equals("PUT")
                    && request.getServletPath().startsWith("/products")) {

                message = "You are not allowed to update products";

            } else if (request.getMethod().equals("DELETE")
                    && request.getServletPath().startsWith("/products")) {

                message = "You are not allowed to delete products";

            } else if (request.getMethod().equals("POST")
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

                .cors(cors -> {})

                .authorizeHttpRequests(auth -> auth

                        // ================= USER =================

                        .requestMatchers(
                                "/users",
                                "/users/login",
                                "/users/forgot-password",
                                "/users/reset-password"
                        ).permitAll()


                        // ================= PRODUCT IMAGES =================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/images/products/**"
                        ).permitAll()


                        // ================= CATEGORY IMAGES =================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/images/categories/**"
                        ).permitAll()


                        // ================= PRODUCTS =================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/products",
                                "/products/**"
                        ).permitAll()


                        // ================= CATEGORIES =================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/categories",
                                "/categories/**"
                        ).permitAll()


                        // ================= CART =================

                        .requestMatchers(
                                "/cart",
                                "/cart/**"
                        ).hasRole("CUSTOMER")


                        // ================= ADMIN ORDERS =================
                        // IMPORTANT:
                        // Admin order rules must come BEFORE
                        // the broader customer order rules.

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/orders/admin/all"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/orders/admin/*"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/orders/admin/*/status"
                        ).hasRole("ADMIN")


                        // ================= CUSTOMER ORDERS =================

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/orders"
                        ).hasRole("CUSTOMER")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/orders/*/cancel"
                        ).hasRole("CUSTOMER")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/orders",
                                "/api/orders/*"
                        ).hasRole("CUSTOMER")


                        // ================= ADMIN PRODUCTS =================

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


                        // ================= ADMIN CATEGORIES =================

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


                        // ================= CUSTOMER PAYMENT =================

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/payments",
                                "/api/payments/verify"
                        ).hasRole("CUSTOMER")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/payments/order/*"
                        ).hasRole("CUSTOMER")


                        // ================= ADMIN PAYMENT =================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/payments/admin/**"
                        ).hasRole("ADMIN")


                        // ================= OTHER APIs =================

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