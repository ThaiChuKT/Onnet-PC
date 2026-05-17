package com.onnet.onnetpc.booking.service;

import com.onnet.onnetpc.booking.entity.Booking;
import com.onnet.onnetpc.email.EmailSendResult;
import com.onnet.onnetpc.email.TransactionalEmailService;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class BookingEmailService {

    private static final Logger LOGGER = LoggerFactory.getLogger(BookingEmailService.class);
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
        .withLocale(Locale.US)
        .withZone(ZoneId.systemDefault());

    private final TransactionalEmailService emailService;

    public BookingEmailService(TransactionalEmailService emailService) {
        this.emailService = emailService;
    }

    public boolean sendPaymentConfirmation(String email, Booking booking) {
        EmailSendResult result = emailService.sendText(
            email,
            "OnnetPC booking payment confirmation #" + booking.getId(),
            buildContent(booking)
        );
        if (!result.sent()) {
            LOGGER.error(
                "Failed to send booking payment confirmation email for booking {} via {}. rootType={}, rootMessage={}",
                booking.getId(),
                result.provider(),
                result.errorType(),
                result.errorMessage()
            );
        }
        return result.sent();
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
