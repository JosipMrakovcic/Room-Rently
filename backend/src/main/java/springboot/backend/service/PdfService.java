package springboot.backend.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;
import springboot.backend.model.UnitReservation;

import java.io.IOException;
import java.io.OutputStream;
import java.time.temporal.ChronoUnit;

@Service
public class PdfService {

    public void generateReservationPdf(OutputStream outputStream, UnitReservation res) throws IOException {
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, outputStream);

        document.open();

        // Fontovi
        Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
        Font fontSubtitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
        Font fontNormal = FontFactory.getFont(FontFactory.HELVETICA, 12);
        Font fontBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);

        // 1. NASLOV
        Paragraph title = new Paragraph("POTVRDA REZERVACIJE #" + res.getIdUnitReservation(), fontTitle);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        // 2. PODACI O OBJEKTU I GOSTU
        document.add(new Paragraph("Smještaj: " + res.getUnit().getUnitName(), fontBold));
        document.add(new Paragraph("Adresa: " + res.getUnit().getLocation(), fontNormal));
        document.add(new Paragraph("Gost: " + res.getPerson().getName() + " (" + res.getPerson().getEmail() + ")", fontNormal));
        document.add(new Paragraph(" "));

        // 3. DATUMI I TRAJANJE
        long nights = ChronoUnit.DAYS.between(res.getStartDate(), res.getEndDate());
        document.add(new Paragraph("Detalji boravka:", fontSubtitle));
        document.add(new Paragraph("Dolazak: " + res.getStartDate(), fontNormal));
        document.add(new Paragraph("Odlazak: " + res.getEndDate(), fontNormal));
        document.add(new Paragraph("Trajanje: " + nights + " noćenja", fontNormal));
        document.add(new Paragraph(" "));

        // 4. ODABRANE OPCIJE
        document.add(new Paragraph("Vaše odabrane usluge:", fontSubtitle));
        if (res.getSelectedAmenities() != null && !res.getSelectedAmenities().isEmpty()) {
            List list = new List(List.UNORDERED);
            String[] amenities = res.getSelectedAmenities().split(", ");
            for (String amenity : amenities) {
                list.add(new ListItem(amenity, fontNormal));
            }
            document.add(list);
        } else {
            document.add(new Paragraph("Nema dodatnih odabranih usluga.", fontNormal));
        }
        document.add(new Paragraph(" "));

        // 5. FINANCIJSKI OBRAČUN
        document.add(new Paragraph("Obračun troškova:", fontSubtitle));
        double pricePerNight = res.getUnit().getPrice();
        double total = nights * pricePerNight;

        document.add(new Paragraph("Cijena po noćenju: " + pricePerNight + " EUR", fontNormal));
        Paragraph totalLine = new Paragraph("UKUPNO ZA PLATITI: " + String.format("%.2f", total) + " EUR", fontBold);
        totalLine.setSpacingBefore(10);
        document.add(totalLine);

        document.add(new Paragraph("\nStatus rezervacije: " + res.getStatus(), fontNormal));

        document.close();
    }
}