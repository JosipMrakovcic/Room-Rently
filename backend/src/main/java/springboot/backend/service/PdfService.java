package springboot.backend.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.draw.LineSeparator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import springboot.backend.model.LocationSettings;
import springboot.backend.model.UnitReservation;
import springboot.backend.repository.LocationRepo;

import java.awt.Color;
import java.io.IOException;
import java.io.OutputStream;
import java.time.temporal.ChronoUnit;

@Service
public class PdfService {

    @Autowired
    private LocationRepo locationRepo;

    public void generateReservationPdf(OutputStream outputStream, UnitReservation res) throws IOException {
        LocationSettings settings = locationRepo.findById(1L)
                .orElse(new LocationSettings(1L, "Main Street 1, City", ""));

        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, outputStream);
        document.open();

        // Fonts
        Font fontBrand = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, Color.DARK_GRAY);
        Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
        Font fontSubtitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.GRAY);
        Font fontNormal = FontFactory.getFont(FontFactory.HELVETICA, 11);
        Font fontBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);

        // 1. HEADER
        Paragraph brand = new Paragraph("ROOM RENTLY", fontBrand);
        brand.setAlignment(Element.ALIGN_RIGHT);
        document.add(brand);

        Paragraph official = new Paragraph("Official Reservation Document", fontSubtitle);
        official.setAlignment(Element.ALIGN_RIGHT);
        document.add(official);

        document.add(new Paragraph("\n"));
        document.add(new LineSeparator());
        document.add(new Paragraph("\n"));

        // 2. RESERVATION INFO
        Paragraph title = new Paragraph("RESERVATION SUMMARY", fontTitle);
        title.setSpacingAfter(15);
        document.add(title);

        document.add(new Paragraph("Booking ID: #" + res.getIdUnitReservation(), fontBold));
        document.add(new Paragraph("Property: " + res.getUnit().getUnitName(), fontNormal));
        document.add(new Paragraph("Location: " + settings.getAddress(), fontNormal));
        document.add(new Paragraph("Guest: " + res.getPerson().getName() + " (" + res.getPerson().getEmail() + ")", fontNormal));

        document.add(new Paragraph("\n"));

        // 3. DATES
        long nights = ChronoUnit.DAYS.between(res.getStartDate(), res.getEndDate());
        document.add(new Paragraph("STAY DETAILS", fontSubtitle));
        document.add(new LineSeparator());
        document.add(new Paragraph("Check-in Date: " + res.getStartDate(), fontNormal));
        document.add(new Paragraph("Check-out Date: " + res.getEndDate(), fontNormal));
        document.add(new Paragraph("Total Duration: " + nights + " nights", fontNormal));

        document.add(new Paragraph("\n"));

        // 4. AMENITIES
        document.add(new Paragraph("INCLUDED SERVICES", fontSubtitle));
        document.add(new LineSeparator());
        if (res.getSelectedAmenities() != null && !res.getSelectedAmenities().isEmpty()) {
            List list = new List(List.UNORDERED, 10);
            for (String amenity : res.getSelectedAmenities().split(", ")) {
                list.add(new ListItem(amenity, fontNormal));
            }
            document.add(list);
        } else {
            document.add(new Paragraph("Standard accommodation services.", fontNormal));
        }

        document.add(new Paragraph("\n"));

        // 5. PRICE
        document.add(new Paragraph("FINANCIAL OVERVIEW", fontSubtitle));
        document.add(new LineSeparator());
        double pricePerNight = res.getUnit().getPrice();
        double total = nights * pricePerNight;

        document.add(new Paragraph("Price per night: " + String.format("%.2f", pricePerNight) + " EUR", fontNormal));
        Paragraph totalLine = new Paragraph("TOTAL AMOUNT PAYABLE: " + String.format("%.2f", total) + " EUR", fontBold);
        totalLine.setSpacingBefore(5);
        document.add(totalLine);

        document.add(new Paragraph("\n\n"));

        // FOOTER
        Paragraph footer = new Paragraph("Thank you for choosing Room Rently. We wish you a pleasant stay!", fontNormal);
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);

        document.close();
    }
}