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
import springboot.backend.dto.ReservationRequest;
import springboot.backend.model.Person;
import springboot.backend.model.Unit;
import springboot.backend.model.UnitReservation;
import springboot.backend.repository.PersonRepo;
import springboot.backend.repository.UnitRepo;
import springboot.backend.repository.UnitReservationRepo;
import springboot.backend.service.EmailService;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class UnitReservationControllerComponentTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockitoBean private UnitReservationRepo reservationRepo;
    @MockitoBean private PersonRepo personRepo;
    @MockitoBean private UnitRepo unitRepo;
    @MockitoBean private EmailService emailService;

    // --- KREIRANJE REZERVACIJE (POST /add) ---

    @Test
    @DisplayName("Redovni: Uspješno kreiranje rezervacije za običnog korisnika")
    public void testAddReservation_Success() throws Exception {
        String email = "gost@example.com";
        ReservationRequest req = new ReservationRequest();
        req.setUnitId(10L);
        req.setStartDate(LocalDate.now().plusDays(5));
        req.setEndDate(LocalDate.now().plusDays(10));
        req.setAdults(2);

        // Postavljamo Person prema tvom modelu
        Person gost = new Person();
        gost.setEmail(email);
        gost.setUser(true); // Ključno za prolaz if(person.isUser())
        gost.setOwner(false);
        gost.setName("Gost Korisnik");

        Unit smjestaj = new Unit();
        smjestaj.setIdUnit(10L);

        Mockito.when(personRepo.findByEmail(email)).thenReturn(Optional.of(gost));
        Mockito.when(reservationRepo.existsOverlapping(10L, req.getStartDate(), req.getEndDate())).thenReturn(false);
        Mockito.when(unitRepo.findById(10L)).thenReturn(Optional.of(smjestaj));

        mockMvc.perform(post("/unitReservation/add")
                        .with(jwt().jwt(j -> j.claim("email", email)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Reservation successfully created")));
    }

    @Test
    @DisplayName("Rubni: Korisnik s ulogom Owner pokušava rezervirati")
    public void testAddReservation_ForbiddenForOwner() throws Exception {
        String email = "vlasnik@example.com";
        ReservationRequest req = new ReservationRequest();
        req.setStartDate(LocalDate.now().plusDays(1));
        req.setEndDate(LocalDate.now().plusDays(2));

        Person vlasnik = new Person();
        vlasnik.setEmail(email);
        vlasnik.setUser(false); // Owner nije "regular user" u tvom kontroleru
        vlasnik.setOwner(true);

        Mockito.when(personRepo.findByEmail(email)).thenReturn(Optional.of(vlasnik));

        mockMvc.perform(post("/unitReservation/add")
                        .with(jwt().jwt(j -> j.claim("email", email)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andDo(print())
                .andExpect(status().isForbidden())
                .andExpect(content().string("Only regular users can make reservations."));
    }

    @Test
    @DisplayName("Izazivanje pogreške: Krajnji datum prije početnog")
    public void testAddReservation_InvalidDates() throws Exception {
        String email = "gost@example.com";
        ReservationRequest req = new ReservationRequest();
        req.setStartDate(LocalDate.now().plusDays(5));
        req.setEndDate(LocalDate.now().plusDays(4)); // GREŠKA: Kraj je prije početka

        Person gost = new Person();
        gost.setEmail(email);
        gost.setUser(true);

        Mockito.when(personRepo.findByEmail(email)).thenReturn(Optional.of(gost));

        mockMvc.perform(post("/unitReservation/add")
                        .with(jwt().jwt(j -> j.claim("email", email)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Departure date must be at least one day after arrival."));
    }

    // --- DOHVAT VLASTITIH REZERVACIJA ---

    @Test
    @DisplayName("Redovni: Uspješan dohvat liste rezervacija")
    public void testGetMyReservations_Success() throws Exception {
        String email = "test@example.com";
        UnitReservation res = new UnitReservation();
        res.setStatus("Confirmed");

        Mockito.when(reservationRepo.findByPersonEmail(email))
                .thenReturn(Collections.singletonList(res));

        mockMvc.perform(get("/unitReservation/my-reservations")
                        .with(jwt().jwt(j -> j.claim("email", email))))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].status").value("Confirmed"));
    }

    @Test
    @DisplayName("Rubni: Dohvat kada korisnik nema rezervacija")
    public void testGetMyReservations_Empty() throws Exception {
        String email = "novi@example.com";
        Mockito.when(reservationRepo.findByPersonEmail(email)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/unitReservation/my-reservations")
                        .with(jwt().jwt(j -> j.claim("email", email))))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @DisplayName("Izazivanje pogreške: Pristup bez prijave")
    public void testGetMyReservations_NoJwt() throws Exception {
        // Ne dodajemo .with(jwt())
        mockMvc.perform(get("/unitReservation/my-reservations"))
                .andDo(print())
                .andExpect(status().isUnauthorized());
    }
}