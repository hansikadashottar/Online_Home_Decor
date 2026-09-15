package com.homedecor.onlinehomedecor.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
public class EmailUtil {

    @Autowired
    private JavaMailSender mailSender;
    public void sendOtpEmail(String email, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Home Decor - Password Reset OTP");
        message.setText(
                "Your OTP for resetting your Home Decor account password is: "
                        + otp
                        + "\n\nThis OTP is valid for 2 minutes."
        );
        mailSender.send(message);
    }
}
