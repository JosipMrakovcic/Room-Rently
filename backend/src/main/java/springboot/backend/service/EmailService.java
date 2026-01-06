package springboot.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import springboot.backend.model.UnitReservation;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private PdfService pdfService;

    /**
     * Initial inquiry confirmation (No PDF needed usually, but we keep it flexible)
     */
    @Async
    public void sendEmailWithPdf(UnitReservation res) {
        sendInternal(res, "Reservation Inquiry Received",
                "Your reservation request has been successfully received and is currently PENDING. The owner will review your request shortly.");
    }

    /**
     * Status updates (Confirmed, Rejected, etc.)
     */
    @Async
    public void sendStatusUpdateEmail(UnitReservation res, String subject, String messageText) {
        sendInternal(res, subject, messageText);
    }

    /**
     * CORE LOGIC: Decides whether to attach PDF based on status
     */
    private void sendInternal(UnitReservation res, String subject, String messageText) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(res.getPerson().getEmail());
            helper.setSubject(subject + " | " + res.getUnit().getUnitName());

            // Professional HTML Template
            String emailBody =
                    "<div style='font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; border: 1px solid #eee; padding: 20px;'>" +
                            "<h2 style='color: #2c3e50;'>Dear " + res.getPerson().getName() + ",</h2>" +
                            "<p style='font-size: 16px; line-height: 1.5;'>" + messageText + "</p>" +
                            "<div style='background-color: #f8f9fa; padding: 15px; border-left: 4px solid #2c3e50; margin: 20px 0;'>" +
                            "<h4 style='margin-top: 0;'>Booking Summary:</h4>" +
                            "<p style='margin: 5px 0;'><strong>Property:</strong> " + res.getUnit().getUnitName() + "</p>" +
                            "<p style='margin: 5px 0;'><strong>Dates:</strong> " + res.getStartDate() + " to " + res.getEndDate() + "</p>" +
                            "<p style='margin: 5px 0;'><strong>Status:</strong> <span style='color: #e67e22; font-weight: bold;'>" + res.getStatus().toUpperCase() + "</span></p>" +
                            "</div>" +
                            (res.getStatus().equalsIgnoreCase("Confirmed") ?
                                    "<p>Please find your <strong>official confirmation document</strong> attached below.</p>" : "") +
                            "<br><p>Best regards,<br><strong>Room Rently Team</strong></p>" +
                            "</div>";

            helper.setText(emailBody, true);

            // LOGIC: Only attach PDF if the reservation is CONFIRMED
            if ("Confirmed".equalsIgnoreCase(res.getStatus())) {
                ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                pdfService.generateReservationPdf(outputStream, res);
                byte[] pdfBytes = outputStream.toByteArray();

                String fileName = "Booking_Confirmation_" + res.getIdUnitReservation() + ".pdf";
                helper.addAttachment(fileName, new ByteArrayResource(pdfBytes));
            }

            mailSender.send(message);
            System.out.println(">>> Professional email sent to: " + res.getPerson().getEmail() + " [Status: " + res.getStatus() + "]");

        } catch (MessagingException | IOException e) {
            System.err.println(">>> CRITICAL: Failed to send email: " + e.getMessage());
        }
    }

    /**
     * Simple notifications without detailed summaries (e.g., for cancellations or property removal)
     */
    @Async
    public void sendSimpleStatusEmail(UnitReservation res, String subject, String messageText) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

            helper.setTo(res.getPerson().getEmail());
            helper.setSubject(subject);

            String emailBody =
                    "<div style='font-family: Arial, sans-serif; color: #333; padding: 20px;'>" +
                            "<h3>Update regarding Reservation #" + res.getIdUnitReservation() + "</h3>" +
                            "<p>" + messageText + "</p>" +
                            "<p><strong>Accommodation:</strong> " + res.getUnit().getUnitName() + "</p>" +
                            "<br><p>Room Rently Team</p>" +
                            "</div>";

            helper.setText(emailBody, true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println(">>> Error sending simple email: " + e.getMessage());
        }
    }
}