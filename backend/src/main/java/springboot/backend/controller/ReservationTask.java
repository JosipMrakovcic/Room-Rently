package springboot.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional; // Preporuka za sigurnost baze
import springboot.backend.model.UnitReservation;
import springboot.backend.repository.UnitReservationRepo;

import java.time.LocalDate;
import java.util.List;

@Component
public class ReservationTask {

    @Autowired
    private UnitReservationRepo repo;

    // Cron "0 0 0 * * *" znači svaki dan u ponoć.
    // Za testiranje možeš staviti "0 */1 * * * *" (svake minute)
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional // Osigurava da se promjene ispravno upišu u bazu
    public void autoCloseReservations() {
        String todayStr = LocalDate.now().toString(); // Prevarimo u String "yyyy-MM-dd"

        // Uzimamo samo one koje stvarno treba mijenjati
        List<UnitReservation> expired = repo.findExpiredConfirmedReservations(todayStr);

        if (!expired.isEmpty()) {
            for (UnitReservation res : expired) {
                res.setStatus("Completed");
                repo.save(res);
                System.out.println("Sustav: Rezervacija #" + res.getIdUnitReservation() + " za jedinicu " + res.getUnit().getUnitName() + " je postavljena na Completed.");
            }
            System.out.println("Automatska obrada završena. Broj ažuriranih rezervacija: " + expired.size());
        }
    }
}