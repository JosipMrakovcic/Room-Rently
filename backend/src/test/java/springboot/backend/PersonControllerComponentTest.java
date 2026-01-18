package springboot.backend;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import springboot.backend.model.Person;
import springboot.backend.repository.PersonRepo;

import java.util.Optional;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = SpringbootApplication.class)
@AutoConfigureMockMvc
public class PersonControllerComponentTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PersonRepo repo;

    @Test
    @DisplayName("Redovni: Uspješno dodavanje novog korisnika")
    public void testAddPerson_Success() throws Exception {
        String email = "novi@test.com";
        Mockito.when(repo.findByEmail(email)).thenReturn(Optional.empty());
        Mockito.when(repo.count()).thenReturn(1L);

        mockMvc.perform(post("/addPerson")
                        .with(jwt().jwt(j -> j.claim("email", email).claim("name", "Test User")))
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string("User added successfully"));
    }

    @Test
    @DisplayName("Rubni: Pokušaj dodavanja korisnika koji već postoji (409 Conflict)")
    public void testAddPerson_AlreadyExists() throws Exception {
        String email = "postojeci@test.com";
        Mockito.when(repo.findByEmail(email)).thenReturn(Optional.of(new Person()));

        mockMvc.perform(post("/addPerson")
                        .with(jwt().jwt(j -> j.claim("email", email)))
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isConflict())
                .andExpect(content().string("User already exists"));
    }

    @Test
    @DisplayName("Izazivanje pogreške: Provjera RuntimeException-a")
    public void testAddPerson_ThrowsException() {
        org.junit.jupiter.api.Assertions.assertThrows(Exception.class, () -> {
            mockMvc.perform(post("/addPerson")
                    .with(jwt().jwt(j -> j.claim("name", "Bez Emaila")))).andDo(print());
        });
    }

    @Test
    @DisplayName("Redovni: Dohvat postojećeg korisnika (/me)")
    public void testGetCurrentUser_Success() throws Exception {
        String email = "postojeci@test.com";
        Person p = new Person();
        p.setEmail(email);
        p.setName("Ivan Horvat");

        // Simuliramo da repo pronalazi korisnika
        Mockito.when(repo.findByEmail(email)).thenReturn(Optional.of(p));

        mockMvc.perform(get("/me")
                        .with(jwt().jwt(j -> j.claim("email", email)))
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.name").value("Ivan Horvat"));
    }

    @Test
    @DisplayName("Rubni: Korisnik s ispravnim tokenom ne postoji u bazi")
    public void testGetCurrentUser_NotFound() throws Exception {
        String email = "nepoznat@test.com";

        // Simuliramo da repo NE pronalazi korisnika
        Mockito.when(repo.findByEmail(email)).thenReturn(Optional.empty());

        mockMvc.perform(get("/me")
                        .with(jwt().jwt(j -> j.claim("email", email)))
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(content().string("User not found"));
    }

    @Test
    @DisplayName("Izazivanje pogreške: Token bez email claima")
    public void testGetCurrentUser_InvalidToken() throws Exception {
        // Šaljemo JWT bez "email" claima
        mockMvc.perform(get("/me")
                        .with(jwt().jwt(j -> j.claim("name", "Only Name")))
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Invalid token"));
    }

}