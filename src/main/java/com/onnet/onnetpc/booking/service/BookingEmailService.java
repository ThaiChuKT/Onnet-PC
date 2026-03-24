package com.onnet.onnetpc.booking.service;

import com.onnet.onnetpc.booking.entity.Booking;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class BookingEmailService {

    private static final Logger LOGGER = LoggerFactory.getLogger(BookingEmailService.class);
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
        .withLocale(Locale.US)
        .withZone(ZoneId.systemDefault());

    private final JavaMailSender mailSender;
    private final String bookingMailFrom;

    public BookingEmailService(
        JavaMailSender mailSender,
        @Value("${app.email.booking.from:${app.email.verification.from:no-reply@onnetpc.local}}") String bookingMailFrom
    ) {
        this.mailSender = mailSender;
        this.bookingMailFrom = bookingMailFrom;
    }

    public void sendPaymentConfirmation(String email, Booking booking) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(bookingMailFrom);
            message.setTo(email);
            message.setSubject("OnnetPC booking payment confirmation #" + booking.getId());
            message.setText(buildContent(booking));
            mailSender.send(message);
        } catch (Exception ex) {
            LOGGER.error("Failed to send booking payment confirmation email for booking {}", booking.getId(), ex);
        }
    }

    private String buildContent(Booking booking) {
        String startTime = booking.getStartTime() == null ? "-" : DATE_TIME_FORMATTER.format(booking.getStartTime());
        String endTime = booking.getEndTime() == null ? "-" : DATE_TIME_FORMATTER.format(booking.getEndTime());
        String specName = booking.getSpec() == null ? "Machine" : booking.getSpec().getSpecName();
        String totalPrice = booking.getTotalPrice() == null ? "0.00" : booking.getTotalPrice().toPlainString();

        return "Your booking has been paid successfully.\n\n"
            + "Booking ID: #" + booking.getId() + "\n"
            + "Machine group: " + specName + "\n"
            + "Start time: " + startTime + "\n"
            + "End time: " + endTime + "\n"
            + "Total paid: $" + totalPrice + "\n"
            + "Status: PAID\n\n"
            + "You can now go to Rentals and click Start session when your slot starts.";
    }
}
