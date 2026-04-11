package edu.cit.taghoy.lostlink.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import jakarta.annotation.PostConstruct;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    /** Optional override; if blank, uses spring.mail.username (typical for Gmail). */
    @Value("${lostlink.mail.from:}")
    private String fromAddress;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${lostlink.mail.enabled:false}")
    private boolean enabled;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @PostConstruct
    void logMailBootstrap() {
        if (!enabled) {
            log.warn(
                    "Email is OFF (lostlink.mail.enabled=false). Set MAIL_ENABLED=true in the same process that runs Spring Boot.");
            return;
        }
        if (!StringUtils.hasText(mailUsername)) {
            log.warn("Email enabled but spring.mail.username is empty — set MAIL_USERNAME.");
            return;
        }
        String from = StringUtils.hasText(fromAddress) ? fromAddress.trim() : mailUsername;
        log.info("Email enabled — SMTP user configured, From={}, posting sends to each user's registered email.",
                from);
    }

    @Async
    public void sendWelcome(String to, String firstName) {
        send(to,
             "Welcome to LostLink!",
             "Hi " + firstName + ",\n\n"
                     + "Welcome to LostLink — the campus lost & found platform.\n"
                     + "You can now post lost or found items and help reunite belongings with their owners.\n\n"
                     + "Stay safe,\nThe LostLink Team");
    }

    @Async
    public void sendItemPostedConfirmation(String to, String firstName, String itemTitle, String status) {
        send(to,
             "Your " + status.toLowerCase() + " report has been posted",
             "Hi " + firstName + ",\n\n"
                     + "Your report \"" + itemTitle + "\" (" + status + ") has been successfully posted to the campus feed.\n"
                     + "Other students can now see it and reach out if they recognize the item.\n\n"
                     + "— LostLink");
    }

    private void send(String to, String subject, String body) {
        if (!enabled) {
            log.warn("Mail skipped (disabled) — would send to={} subject=\"{}\"", to, subject);
            return;
        }
        try {
            String from = StringUtils.hasText(fromAddress) ? fromAddress.trim() : mailUsername;
            if (!StringUtils.hasText(from)) {
                log.error("Cannot send mail: set MAIL_USERNAME or MAIL_FROM");
                return;
            }
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(from);
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(body);
            mailSender.send(msg);
            log.info("Mail sent to={} subject=\"{}\"", to, subject);
        } catch (Exception e) {
            log.error("Failed to send mail to={}: {}", to, e.getMessage());
        }
    }
}
