package springboot.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import springboot.backend.model.UnitReservation;
import springboot.backend.repository.UnitReservationRepo;

import java.time.LocalDate;
import java.util.List;

@Component
public class ReservationTask {

    @Autowired
    private UnitReservationRepo repo;

    // Svaki dan u ponoć
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void autoCloseReservations() {

        LocalDate today = LocalDate.now();

        List<UnitReservation> expired = repo.findExpiredConfirmedReservations(today);

        if (!expired.isEmpty()) {
            for (UnitReservation res : expired) {
                res.setStatus("Completed");
                repo.save(res);

                System.out.println("Sustav: Rezervacija #" + res.getIdUnitReservation() +
                        " je automatski dovršena.");
            }
            System.out.println("Automatska obrada završena. Broj ažuriranih rezervacija: " + expired.size());
        }
    }
}