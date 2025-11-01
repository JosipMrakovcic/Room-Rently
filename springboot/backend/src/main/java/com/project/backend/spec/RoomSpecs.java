package com.project.backend.spec;

import com.project.backend.dto.SearchParams;
import com.project.backend.model.Room;
import com.project.backend.model.RoomReservation;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.*;
import java.time.LocalDate;

public class RoomSpecs {

    public static Specification<Room> available(SearchParams p) {
        return (root, query, cb) -> {
            LocalDate sd = LocalDate.parse(p.getStartDate());
            LocalDate ed = LocalDate.parse(p.getEndDate());

            Subquery<Long> sub = query.subquery(Long.class);
            Root<RoomReservation> r = sub.from(RoomReservation.class);
            sub.select(cb.literal(1L));
            sub.where(
                    cb.equal(r.get("room").get("idRoom"), root.get("idRoom")),
                    r.get("status").in("confirmed", "pending"),
                    cb.lessThan(r.get("startDate"), ed),
                    cb.greaterThan(r.get("endDate"), sd)
            );

            Predicate pred = cb.not(cb.exists(sub));

            if (p.getApartmentId() != null) {
                pred = cb.and(pred, cb.equal(root.get("apartment").get("idApartment"), p.getApartmentId()));
            }
            if (notBlank(p.getQ())) {
                String like = "%" + p.getQ().trim().toLowerCase() + "%";
                pred = cb.and(pred, cb.or(
                        cb.like(cb.lower(root.get("name")), like),
                        cb.like(cb.lower(root.get("location")), like)
                ));
            }
            if (notBlank(p.getLocation())) {
                String like = "%" + p.getLocation().trim().toLowerCase() + "%";
                pred = cb.and(pred, cb.like(cb.lower(root.get("location")), like));
            }
            if (p.getAdults() != null) {
                pred = cb.and(pred, cb.greaterThanOrEqualTo(root.get("capAdults"), p.getAdults()));
            }
            if (p.getChildren() != null) {
                pred = cb.and(pred, cb.greaterThanOrEqualTo(root.get("capChildren"), p.getChildren()));
            }
            if (p.getMinBeds() != null) {
                pred = cb.and(pred, cb.greaterThanOrEqualTo(root.get("numBeds"), p.getMinBeds()));
            }
            if (p.getHasParking() != null) {
                pred = cb.and(pred, cb.equal(root.get("hasParking"), p.getHasParking()));
            }
            if (p.getMinRating() != null) {
                pred = cb.and(pred, cb.greaterThanOrEqualTo(root.get("rating"), p.getMinRating()));
            }
            if (p.getPriceMin() != null) {
                pred = cb.and(pred, cb.greaterThanOrEqualTo(root.get("price"), p.getPriceMin()));
            }
            if (p.getPriceMax() != null) {
                pred = cb.and(pred, cb.lessThanOrEqualTo(root.get("price"), p.getPriceMax()));
            }
            return pred;
        };
    }

    private static boolean notBlank(String s) { return s != null && !s.trim().isEmpty(); }
}
