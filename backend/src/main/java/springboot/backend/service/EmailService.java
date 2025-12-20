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

    public void sendEmailWithPdf(UnitReservation res) throws MessagingException, IOException {
        MimeMessage message = mailSender.createMimeMessage();

        // MimeMessageHelper s 'true' omogućuje dodavanje privitaka (multipart)
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(res.getPerson().getEmail());
        helper.setSubject("Potvrda rezervacije #" + res.getIdUnitReservation() + " - " + res.getUnit().getUnitName());

        String emailContent = "Poštovani " + res.getPerson().getName() + ",\n\n" +
                "Vaša rezervacija je potvrđena! U privitku se nalazi službena potvrda s detaljima.\n\n" +
                "Radujemo se Vašem dolasku.\n\n" +
                "Srdačan pozdrav,\n" +
                "Hotel Rently tim";

        helper.setText(emailContent);

        // 1. Generiraj PDF u ByteArrayOutputStream (memoriju)
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        pdfService.generateReservationPdf(outputStream, res);

        // 2. Pretvori stream u bajtove za privitak
        byte[] pdfBytes = outputStream.toByteArray();

        // 3. Dodaj privitak u email
        helper.addAttachment("Potvrda_Rezervacije_" + res.getIdUnitReservation() + ".pdf",
                new ByteArrayResource(pdfBytes));

        // 4. Pošalji email
        mailSender.send(message);
    }
}