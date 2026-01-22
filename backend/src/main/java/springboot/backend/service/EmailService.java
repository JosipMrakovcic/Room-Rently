package springboot.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import springboot.backend.model.UnitReservation;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;

@Service
public class EmailService {

    @Value("${BREVO_API_KEY}")
    private String apiKey;

    @Value("${BREVO_SENDER_EMAIL}")
    private String senderEmail; // Ovo povlači verified mail s Rendera

    @Autowired
    private PdfService pdfService;

    private final RestTemplate restTemplate = new RestTemplate();
    private final String BREVO_URL = "https://api.brevo.com/v3/smtp/email";

    @Async
    public void sendEmailWithPdf(UnitReservation res) {
        sendInternal(res, "Reservation Inquiry Received",
                "Your reservation request has been successfully received and is currently PENDING. The owner will review your request shortly.");
    }

    @Async
    public void sendStatusUpdateEmail(UnitReservation res, String subject, String messageText) {
        sendInternal(res, subject, messageText);
    }

    private void sendInternal(UnitReservation res, String subject, String messageText) {
        System.out.println(">>> [LOG] Pokrećem sendInternal za: " + res.getPerson().getEmail());

        // Provjera API ključa u logovima
        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println(">>> [LOG] UPOZORENJE: API ključ je NULL ili prazan!");
        } else {
            System.out.println(">>> [LOG] API ključ učitan (duljina: " + apiKey.length() + ")");
        }

        try {
            // HTML Template
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

            // Priprema privitka (PDF)
            List<Map<String, String>> attachments = new ArrayList<>();
            if ("Confirmed".equalsIgnoreCase(res.getStatus())) {
                System.out.println(">>> [LOG] Status je Confirmed, kreiram PDF...");
                ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                pdfService.generateReservationPdf(outputStream, res);
                byte[] pdfBytes = outputStream.toByteArray();
                String base64Pdf = Base64.getEncoder().encodeToString(pdfBytes);

                Map<String, String> attachment = new HashMap<>();
                attachment.put("content", base64Pdf);
                attachment.put("name", "Booking_Confirmation_" + res.getIdUnitReservation() + ".pdf");
                attachments.add(attachment);
                System.out.println(">>> [LOG] PDF uspješno generiran i dodan u listu.");
            }

            // Kreiranje JSON-a za Brevo
            Map<String, Object> payload = new HashMap<>();
            payload.put("sender", Map.of("name", "Room Rently", "email", senderEmail));
            payload.put("to", List.of(Map.of("email", res.getPerson().getEmail(), "name", res.getPerson().getName())));
            payload.put("subject", subject + " | " + res.getUnit().getUnitName());
            payload.put("htmlContent", emailBody);

            if (!attachments.isEmpty()) {
                payload.put("attachment", attachments);
            }

            // HTTP Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", apiKey != null ? apiKey.trim() : "");

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            System.out.println(">>> [LOG] Šaljem POST zahtjev na Brevo API...");

            // Slanje zahtjeva
            ResponseEntity<String> response = restTemplate.postForEntity(BREVO_URL, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println(">>> Professional email sent via API to: " + res.getPerson().getEmail() + " [Status: " + res.getStatus() + "]");
            } else {
                System.err.println(">>> [LOG] Brevo API vratio neočekivan status: " + response.getStatusCode());
            }

        } catch (HttpClientErrorException e) {
            System.err.println(">>> [LOG] BREVO API GREŠKA (4xx): " + e.getStatusCode());
            System.err.println(">>> [LOG] DETALJI ODGOVORA: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            System.err.println(">>> CRITICAL: Failed to send email via API: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Async
    public void sendSimpleStatusEmail(UnitReservation res, String subject, String messageText) {
        System.out.println(">>> [LOG] Pokrećem sendSimpleStatusEmail za: " + res.getPerson().getEmail());
        try {
            String emailBody =
                    "<div style='font-family: Arial, sans-serif; color: #333; padding: 20px;'>" +
                            "<h3>Update regarding Reservation #" + res.getIdUnitReservation() + "</h3>" +
                            "<p>" + messageText + "</p>" +
                            "<p><strong>Accommodation:</strong> " + res.getUnit().getUnitName() + "</p>" +
                            "<br><p>Room Rently Team</p>" +
                            "</div>";

            Map<String, Object> payload = new HashMap<>();
            payload.put("sender", Map.of("name", "Room Rently", "email", senderEmail));
            payload.put("to", List.of(Map.of("email", res.getPerson().getEmail(), "name", res.getPerson().getName())));
            payload.put("subject", subject);
            payload.put("htmlContent", emailBody);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", apiKey != null ? apiKey.trim() : "");

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            System.out.println(">>> [LOG] Šaljem Simple Email na Brevo...");
            restTemplate.postForEntity(BREVO_URL, entity, String.class);

            System.out.println(">>> Simple email sent via API to: " + res.getPerson().getEmail());
        } catch (HttpClientErrorException e) {
            System.err.println(">>> [LOG] BREVO API GREŠKA (Simple): " + e.getResponseBodyAsString());
        } catch (Exception e) {
            System.err.println(">>> Error sending simple email via API: " + e.getMessage());
        }
    }
}