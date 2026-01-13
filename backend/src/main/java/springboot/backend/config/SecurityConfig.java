package springboot.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${frontend.url}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                // Aktiviramo CORS s našim beanom ispod
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        // --- 1. JAVNE RUTE (Svi posjetitelji) ---
                        .requestMatchers(
                                "/unit/all",
                                "/unit/filter",
                                "/unit/{id:[0-9]+}",
                                "/unit/top-rated",
                                "/unit/counts-by-beds",
                                "/unit/counts-by-view",
                                "/unit/summary",
                                "/unitReservation/occupied-dates/**",
                                "/api/location" // GET metoda za adresu je javna
                        ).permitAll()

                        // --- 2. KORISNIČKE RUTE (Potreban Login) ---
                        .requestMatchers(
                                "/addPerson",
                                "/me",
                                "/updateCountry",
                                "/unitReservation/add",
                                "/unitReservation/my-reservations",
                                "/unitReservation/cancel/**", // Korisnik otkazuje svoje
                                "/unitReservation/rate/**"    // Korisnik ocjenjuje svoje
                        ).authenticated()

                        // --- 3. ADMIN/OWNER RUTE (Potreban Login + provjera u kontroleru) ---
                        .requestMatchers(
                                "/unit/add",
                                "/unit/update/**",
                                "/unitImg/**",      // Slanje i brisanje slika, delete-full
                                "/allPersons",
                                "/deletePerson/**",
                                "/updateRole/**",
                                "/unitReservation/all",           // Vlasnik gleda sve
                                "/unitReservation/update-status/**" // Vlasnik potvrđuje
                        ).authenticated()

                        // --- 4. DEFAULT ZAŠTITA ---
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth -> oauth.jwt(Customizer.withDefaults()));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Čistimo URL od kose crte na kraju radi sigurnosti
        String cleanUrl = frontendUrl.replaceAll("/$", "");

        config.setAllowedOrigins(List.of(cleanUrl));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "Accept"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L); // Cache preflight odgovora 1 sat

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}