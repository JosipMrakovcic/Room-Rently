package springboot.backend.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import springboot.backend.model.LocationSettings;
import springboot.backend.model.UnitReservation;
import springboot.backend.repository.LocationRepo;

import java.io.IOException;
import java.io.OutputStream;
import java.time.temporal.ChronoUnit;

@Service
public class PdfService {

    @Autowired
    private LocationRepo locationRepo; // Dodano za dohvaćanje adrese s admin stranice

    public void generateReservationPdf(OutputStream outputStream, UnitReservation res) throws IOException {
        // Dohvaćamo globalnu adresu (ID 1). Ako ne postoji, stavljamo fallback tekst.
        LocationSettings settings = locationRepo.findById(1L)
                .orElse(new LocationSettings(1L, "Adresa nije postavljena", ""));

        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, outputStream);

        document.open();

        // Fonts
        Font fontBrand = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24);
        Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Font fontSubtitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
        Font fontNormal = FontFactory.getFont(FontFactory.HELVETICA, 12);
        Font fontBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);

        // 1. BRANDING & TITLE
        Paragraph brand = new Paragraph("ROOM RENTLY", fontBrand);
        brand.setAlignment(Element.ALIGN_CENTER);
        document.add(brand);

        Paragraph title = new Paragraph("RESERVATION DETAILS", fontTitle);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);


        // 2. PROPERTY AND GUEST DETAILS
        document.add(new Paragraph("Accommodation: " + res.getUnit().getUnitName(), fontBold));

        // POPRAVLJENO: Adresa se sada uzima iz LocationSettings (Admin Page)
        document.add(new Paragraph("Address: " + settings.getAddress(), fontNormal));

        document.add(new Paragraph(
                "Guest: " + res.getPerson().getName() +
                        " (" + res.getPerson().getEmail() + ")",
                fontNormal
        ));
        document.add(new Paragraph(" "));

        // 3. DATES AND DURATION
        long nights = ChronoUnit.DAYS.between(res.getStartDate(), res.getEndDate());
        document.add(new Paragraph("Stay details:", fontSubtitle));
        document.add(new Paragraph("Check-in: " + res.getStartDate(), fontNormal));
        document.add(new Paragraph("Check-out: " + res.getEndDate(), fontNormal));
        document.add(new Paragraph("Duration: " + nights + " nights", fontNormal));
        document.add(new Paragraph(" "));

        // 4. SELECTED AMENITIES
        document.add(new Paragraph("Selected services:", fontSubtitle));
        if (res.getSelectedAmenities() != null && !res.getSelectedAmenities().isEmpty()) {
            List list = new List(List.UNORDERED);
            String[] amenities = res.getSelectedAmenities().split(", ");
            for (String amenity : amenities) {
                list.add(new ListItem(amenity, fontNormal));
            }
            document.add(list);
        } else {
            document.add(new Paragraph("No additional services selected.", fontNormal));
        }
        document.add(new Paragraph(" "));

        // 5. PRICE SUMMARY
        document.add(new Paragraph("Cost summary:", fontSubtitle));
        double pricePerNight = res.getUnit().getPrice();
        double total = nights * pricePerNight;

        document.add(new Paragraph(
                "Price per night: " + pricePerNight + " EUR",
                fontNormal
        ));
        Paragraph totalLine = new Paragraph(
                "TOTAL AMOUNT: " + String.format("%.2f", total) + " EUR",
                fontBold
        );
        totalLine.setSpacingBefore(10);
        document.add(totalLine);

        document.add(new Paragraph(
                "\nReservation status: " + res.getStatus(),
                fontNormal
        ));

        document.close();
    }
}