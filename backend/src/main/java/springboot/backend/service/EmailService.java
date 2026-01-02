package springboot.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
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
     * Osnovna metoda za slanje inicijalne potvrde odmah nakon kreiranja rezervacije (Pending).
     */
    public void sendEmailWithPdf(UnitReservation res) throws MessagingException, IOException {
        String subject = "Zahtjev za rezervaciju primljen - #" + res.getIdUnitReservation();
        String messageText = "Vaš zahtjev za rezervaciju je uspješno zaprimljen i trenutno je na čekanju (Pending). " +
                "Vlasnik objekta će pregledati Vaš upit u najkraćem mogućem roku.";

        sendStatusUpdateEmail(res, subject, messageText);
    }

    /**
     * Glavna metoda koja šalje email s PDF-om ovisno o promjeni statusa (Confirmed, Cancelled, Rejected).
     *
     * @param res         Objekt rezervacije iz baze
     * @param subject     Naslov emaila (npr. "REZERVACIJA POTVRĐENA")
     * @param messageText Glavni tekst poruke koji objašnjava status
     */
    public void sendStatusUpdateEmail(UnitReservation res, String subject, String messageText) throws MessagingException, IOException {
        MimeMessage message = mailSender.createMimeMessage();

        // 'true' parametar označava multipart poruku (tekst + privitak)
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(res.getPerson().getEmail());
        helper.setSubject(subject + " - " + res.getUnit().getUnitName());

        // Kreiranje HTML sadržaja emaila za ljepši prikaz
        String emailBody =
                "<div style='font-family: Arial, sans-serif; color: #333; line-height: 1.6;'>" +
                        "<h2>Poštovani/a " + res.getPerson().getName() + ",</h2>" +
                        "<p style='font-size: 16px;'>" + messageText + "</p>" +
                        "<div style='background-color: #f9f9f9; padding: 15px; border-radius: 5px; border: 1px solid #ddd;'>" +
                        "<h3>Sažetak rezervacije:</h3>" +
                        "<ul>" +
                        "<li><strong>Objekt:</strong> " + res.getUnit().getUnitName() + "</li>" +
                        "<li><strong>Termin:</strong> " + res.getStartDate() + " do " + res.getEndDate() + "</li>" +
                        "<li><strong>Status:</strong> <span style='color: #2c3e50; font-weight: bold;'>" + res.getStatus().toUpperCase() + "</span></li>" +
                        "</ul>" +
                        "</div>" +
                        "<p>Sve detalje Vašeg boravka i financijski obračun možete pronaći u <strong>priloženom PDF dokumentu</strong>.</p>" +
                        "<br>" +
                        "<p>Srdačan pozdrav,<br><strong>Room Rently tim</strong></p>" +
                        "</div>";

        helper.setText(emailBody, true);

        // 1. Generiranje PDF-a koristeći postojeći PdfService u memoriju
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        pdfService.generateReservationPdf(outputStream, res);

        // 2. Pretvaranje u bajtove za slanje
        byte[] pdfBytes = outputStream.toByteArray();

        // 3. Dodavanje PDF-a kao privitka
        String fileName = "Informacije_o_rezervaciji_" + res.getIdUnitReservation() + ".pdf";
        helper.addAttachment(fileName, new ByteArrayResource(pdfBytes));

        // 4. Slanje emaila
        mailSender.send(message);
    }
}