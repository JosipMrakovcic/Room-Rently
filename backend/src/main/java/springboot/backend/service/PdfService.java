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

        // Fonts
        Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
        Font fontSubtitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
        Font fontNormal = FontFactory.getFont(FontFactory.HELVETICA, 12);
        Font fontBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);

        // 1. TITLE
        Paragraph title = new Paragraph(
                "RESERVATION DETAILS",
                fontTitle
        );
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);


        // 2. PROPERTY AND GUEST DETAILS
        document.add(new Paragraph("Accommodation: " + res.getUnit().getUnitName(), fontBold));
        document.add(new Paragraph("Address: " + res.getUnit().getLocation(), fontNormal));
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
