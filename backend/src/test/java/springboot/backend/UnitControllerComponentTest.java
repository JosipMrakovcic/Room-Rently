package springboot.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import springboot.backend.model.Unit;
import springboot.backend.repository.UnitRepo;
import springboot.backend.repository.UnitReservationRepo;

import java.util.List;
import java.util.Optional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = SpringbootApplication.class)
@AutoConfigureMockMvc
public class UnitControllerComponentTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UnitRepo unitRepo;

    @MockitoBean
    private UnitReservationRepo reservationRepo;

    @Autowired
    private ObjectMapper objectMapper;

    // --- DODAVANJE JEDINICE ---

    @Test
    @DisplayName("Redovni: Uspješno dodavanje sobe s generiranjem pod-soba")
    public void testAddUnit_Success() throws Exception {
        Unit unit = new Unit();
        unit.setUnitName("Hotel Central");
        unit.setPrice(100);
        unit.setCapAdults(2);
        unit.setApartment(false);
        unit.setNumSameRooms(2);

        Mockito.when(unitRepo.findByUnitName("Hotel Central")).thenReturn(Optional.empty());
        Mockito.when(unitRepo.save(Mockito.any(Unit.class))).thenAnswer(i -> i.getArguments()[0]);

        mockMvc.perform(post("/unit/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(unit)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unitName").value("Hotel Central"));
    }

    @Test
    @DisplayName("Rubni: Naziv jedinice već postoji")
    public void testAddUnit_DuplicateName() throws Exception {
        Unit unit = new Unit();
        unit.setUnitName("Postojeci");

        Mockito.when(unitRepo.findByUnitName("Postojeci")).thenReturn(Optional.of(new Unit()));

        mockMvc.perform(post("/unit/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(unit)))
                .andDo(print())
                .andExpect(status().isConflict())
                .andExpect(content().string("Unit already exists"));
    }

    @Test
    @DisplayName("Izazivanje pogreške: Neispravna cijena")
    public void testAddUnit_InvalidPrice() throws Exception {
        Unit unit = new Unit();
        unit.setPrice(0); // Prema kodu, cijena mora biti > 0 (price < 1 vraća badRequest)

        mockMvc.perform(post("/unit/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(unit)))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Price must be a positive number."));
    }

    // --- AŽURIRANJE JEDINICE ---

    @Test
    @DisplayName("Redovni: Uspješno ažuriranje cijene")
    public void testUpdateUnit_Success() throws Exception {
        Unit existing = new Unit();
        existing.setIdUnit(1L);
        existing.setPrice(50);

        Unit payload = new Unit();
        payload.setPrice(80);

        Mockito.when(unitRepo.findById(1L)).thenReturn(Optional.of(existing));
        Mockito.when(unitRepo.save(Mockito.any(Unit.class))).thenAnswer(i -> i.getArguments()[0]);

        mockMvc.perform(put("/unit/update/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.price").value(80.0));
    }

    @Test
    @DisplayName("Rubni: Smanjenje broja soba blokirano rezervacijom")
    public void testUpdateUnit_RoomsWithReservations() throws Exception {
        // 1. Pripremamo postojeću jedinicu koja ima 5 soba u bazi
        Unit existingUnit = new Unit();
        existingUnit.setIdUnit(1L);
        existingUnit.setNumSameRooms(5);
        existingUnit.setApartment(false);

        // Dodajemo barem jednu sobu u listu kako bi currentRooms.size() bio veći od 2
        List<Unit> rooms = new java.util.ArrayList<>();
        for(int i=0; i<5; i++) {
            Unit r = new Unit();
            r.setUnitName("Soba " + i);
            rooms.add(r);
        }
        existingUnit.setListOfRooms(rooms);

        // 2. Payload koji šaljemo (želimo smanjiti na 2 sobe)
        Unit payload = new Unit();
        payload.setNumSameRooms(2);
        payload.setApartment(false);

        // 3. Mockiranje
        Mockito.when(unitRepo.findById(1L)).thenReturn(Optional.of(existingUnit));

        // Simuliramo da postoji aktivna rezervacija za sobu koju pokušavamo obrisati
        Mockito.when(reservationRepo.existsByUnitAndStatusInAndEndDateAfter(
                        Mockito.any(Unit.class), Mockito.anyList(), Mockito.any(java.time.LocalDate.class)))
                .thenReturn(true);

        mockMvc.perform(put("/unit/update/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("active reservations")));
    }

    @Test
    @DisplayName("Izazivanje pogreške: Nepostojeći ID jedinice")
    public void testUpdateUnit_NotFound() throws Exception {
        Mockito.when(unitRepo.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(put("/unit/update/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new Unit())))
                .andDo(print())
                .andExpect(status().isInternalServerError())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Unit can't be found.")));
    }
}