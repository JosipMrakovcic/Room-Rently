# Backend — Spring Boot implementacija

## Cilj

Backend aplikacija služi za autentifikaciju korisnika putem Google računa, pohranu podataka o korisnicima u bazu podataka i omogućavanje osnovnih CRUD operacija nad entitetom `Person`. Aplikacija je izrađena pomoću Spring Boot okvira, koristi Spring Security za zaštitu ruta te podržava autentifikaciju pomoću Google OAuth 2.0 tokena.

## Pokretanje backend aplikacije

### Koraci za pokretanje Spring Boot backenda

1. Otvori projekt u **IntelliJ IDEA**.
2. Provjeri da su instalirane sve ovisnosti (ako nije, u terminalu projekta pokreni naredbu `mvn clean install`).
3. Otvori glavnu klasu projekta, najčešće se nalazi u `src/main/java/springboot/backend/SpringApplication.java`.
4. Desnim klikom na datoteku **BackendApplication.java** odaberi **Run 'BackendApplication'**.
5. Nakon pokretanja, backend će po defaultu biti dostupan na adresi **[http://localhost:8080/](http://localhost:8080/)**.

Spring Boot automatski pokreće ugrađeni Tomcat server koji sluša zahtjeve i obrađuje API pozive definirane u `PersonController` klasi.

---

## Postavljanje i pokretanje frontenda

### Instalacija dodatnih paketa

U React frontend direktoriju `client`, potrebno je instalirati dodatnu biblioteku **jwt-decode** koja omogućuje dekodiranje Google ID tokena:

```bash
npm install jwt-decode
```

Ova naredba se mora pokrenuti prije `npm start`, jer frontend koristi `jwtDecode()` funkciju kako bi lokalno prikazao korisničke podatke (npr. ime i e-mail) nakon prijave putem Googlea.

### Pokretanje frontenda

1. U terminalu idi u mapu `client`:

   ```bash
   cd client
   ```
2. Ako prvi put pokrećeš projekt, instaliraj sve ovisnosti:

   ```bash
   npm install
   ```
3. Pokreni aplikaciju:

   ```bash
   npm start
   ```
4. Frontend će se otvoriti u pregledniku na adresi **[http://localhost:3000/](http://localhost:3000/)**.

---

## Struktura backend dijela projekta

Backend je organiziran u sljedeće osnovne pakete:

* **controller** – sadrži REST kontroler `PersonController` koji definira API rute.
* **config** – sadrži konfiguraciju sigurnosti (`SecurityConfig`).
* **model** – sadrži JPA entitet `Person` koji predstavlja korisnika u bazi.
* **repository** – sadrži sučelje `PersonRepo` koje proširuje `JpaRepository` i omogućava komunikaciju s bazom podataka.

Pojedinačne komponente sustava — controller, model i repository — već su detaljno opisane u dokumentu draftBaze.md. U ovom poglavlju naglasak je stavljen na implementacijski aspekt cjelokupnog backend sustava, s fokusom na sigurnosnu konfiguraciju, integraciju s Google OAuth2 autentifikacijom i način pokretanja aplikacije.

---

## Person model (model/Person.java)

### Funkcija

Klasa `Person` predstavlja entitet korisnika u bazi podataka. Svaki red tablice `person` sadrži osnovne podatke o korisniku prijavljenom putem Google računa.

### Kod i objašnjenje

```java
@Entity
@Table(name = "person")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Person {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private boolean isAdmin;

    @Column(nullable = false)
    private boolean isUser;

    @Column(nullable = false)
    private boolean isOwner;

    @Column(nullable = false)
    private String name;

    public Person(String email, boolean isAdmin, boolean isUser, boolean isOwner, String name) {
        this.email = email;
        this.isAdmin = isAdmin;
        this.isUser = isUser;
        this.isOwner = isOwner;
        this.name = name;
    }

    @OneToMany(mappedBy = "person", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ApartmentReservation> apartmentReservations;

    @OneToMany(mappedBy = "person", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RoomReservation> roomReservations;
}
```

### Objašnjenje

Dodan je konstruktor koji omogućuje stvaranje instance klase `Person` bez potrebe za navođenjem ID-a (koji se automatski generira u bazi podataka).
Koristi se kada se novi korisnik dodaje putem backend metode `addPerson()` u `PersonController` klasi.

Parametri konstruktora predstavljaju osnovne atribute korisnika:

* email — jedinstvena e-mail adresa korisnika dohvaćena iz Google JWT tokena,
* isAdmin — označava ima li korisnik administratorske ovlasti,
* isUser — označava je li korisnik registriran kao standardni korisnik,
* isOwner — označava je li korisnik u ulozi vlasnika smještaja,
* name — ime korisnika dohvaćeno iz Google JWT tokena.

Ovaj konstruktor pojednostavljuje inicijalizaciju objekata prilikom registracije korisnika, omogućujući brzu i čitljivu izradu entiteta bez potrebe za dodatnim postavljanjem vrijednosti nakon stvaranja objekta.

---

## Person Controller (controller/PersonController.java)

### Funkcija

`PersonController` je REST kontroler koji upravlja operacijama nad entitetom `Person`. Glavne funkcionalnosti:

* Dohvat svih korisnika (`GET /allPersons`)
* Dodavanje korisnika pri prijavi putem Google računa (`POST /addPerson`)
* Dohvat korisnika prema ID-u (`GET /{id}`)
* Brisanje korisnika (`DELETE /deletePerson/{id}`)

### Kod i objašnjenje

```java
@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class PersonController {

    @Autowired
    PersonRepo repo;

    @GetMapping("/allPersons")
    public List<Person> getAllPersons() {
        return repo.findAll();
    }

    @PostMapping("/addPerson")
    public ResponseEntity<?> addPerson(@AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        String name = jwt.getClaimAsString("name");

        if (email == null) {
            throw new RuntimeException("Invalid Google token: no email found.");
        }

        if (repo.findByEmail(email).isPresent()) {
            return ResponseEntity.status(409).body("User already exists");
        }

        Person person = new Person(email, true, false, false, name);
        repo.save(person);
        return ResponseEntity.ok("User added successfully");
    }

    @GetMapping("/{id}")
    public Optional<Person> getPersonById(@PathVariable Long id) {
        return repo.findById(id);
    }

    @DeleteMapping("/deletePerson/{id}")
    public void deletePerson(@PathVariable Long id) {
        repo.deleteById(id);
    }
}
```

### Objašnjenje

U klasi `PersonController` promjenjena je metoda `addPerson()`;

Ova metoda omogućuje dodavanje novog korisnika u bazu podataka nakon uspješne autentifikacije putem Google računa.
Metoda koristi JWT token poslan iz frontenda (u Authorization zaglavlju HTTP zahtjeva) kako bi dohvatila podatke o korisniku.

Detaljno objašnjenje:
 * `@PostMapping("/addPerson")` — definira REST endpoint koji prima POST zahtjeve na adresi /addPerson.
 * `@AuthenticationPrincipal Jwt jwt` — omogućuje Springu da automatski prepozna i dekodira Google JWT token te ga proslijedi metodi u obliku objekta Jwt.
 * `String email = jwt.getClaimAsString("email")` i `String name = jwt.getClaimAsString("name")` — dohvaćaju vrijednosti iz JWT tokena koje Google šalje nakon prijave (ime i e-mail korisnika).
 * U slučaju da token ne sadrži e-mail, baca se iznimka jer je e-mail obavezan podatak za registraciju.
 * Ako korisnik s istim e-mailom već postoji u bazi `(repo.findByEmail(email).isPresent())`, vraća se HTTP status 409 (Conflict) i poruka "User already exists".
 * Ako korisnik ne postoji, stvara se novi objekt klase Person pomoću konstruktora new Person(email, true, false, false, name) te se sprema u bazu putem `repo.save(person)`.
 * Nakon uspješnog dodavanja, backend vraća odgovor 200 OK s porukom "User added successfully".
 
 Ova metoda čini ključnu poveznicu između frontend autentifikacije putem GoogleLogin komponente i backend baze podataka, čime omogućuje automatsko dodavanje korisnika prilikom njihove prve prijave.

---

## PersonRepo (repository/PersonRepo.java)

### Funkcija
`PersonRepo` sučelje omogućuje komunikaciju između backend aplikacije i baze podataka za entitet `Person`.
To je sloj za pristup podacima koji koristi Spring Data JPA kako bi olakšao rad s bazom bez potrebe za pisanjem SQL upita.

### Kod i objašnjenje

```java
   package com.project.backend.repository;

   import com.project.backend.model.Person;
   import org.springframework.data.jpa.repository.JpaRepository;
   import org.springframework.data.rest.core.annotation.RepositoryRestResource;

   import java.util.Optional;

   @RepositoryRestResource(path = "person")
   public interface PersonRepo extends JpaRepository<Person, Long> {
      Optional<Person> findByEmail(String email);
   }
```
### Objašnjenje

`PersonRepo` je sučelje koje nasljeđuje `JpaRepository` i omogućuje standardne CRUD operacije (Create, Read, Update, Delete) nad entitetom Person.
Dodavanjem metode `findByEmail(String email)` proširuje se funkcionalnost repozitorija kako bi omogućio pretragu korisnika prema njihovoj e-mail adresi.

---

### Komunikacija s frontend dijelom (React GoogleLogin)

U React komponenti `Navbar.jsx` koristi se komponenta `GoogleLogin` iz biblioteke `@react-oauth/google`. Nakon uspješne prijave, frontend dohvaća `credential` (JWT token) koji se šalje backendu:

```jsx
<GoogleLogin
  onSuccess={async (credentialResponse) => {
    try {
      const idToken = credentialResponse.credential; // JWT ID token
      if (!idToken) {
        console.error("No ID token received from Google");
        return;
      }

      try {
        await axios.post(
          "http://localhost:8080/addPerson",
          {},
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
        console.log("User successfully added to DB");
      } catch (error) {
        if (error.response && error.response.status === 409) {
          console.warn("User already exists in database");
        } else {
          console.error("Error adding user to DB:", error);
        }
      }

      const decoded = jwtDecode(idToken);
      console.log("Decoded user:", decoded);

      setUser(decoded);
      localStorage.setItem("googleUser", JSON.stringify(decoded));
    } catch (err) {
      console.error("Error processing Google login:", err);
    }
  }}
  onError={() => {
    console.log("Login Failed");
  }}
/>
```

### Objašnjenje

1. Prijava — korisnik se autentificira putem Google računa.
2. Dohvat tokena — Google vraća JWT token (idToken) koji sadrži podatke o korisniku (ime, e-mail, slika).
3. Slanje backendu — token se šalje na POST /addPerson, gdje ga Spring Boot validira i sprema korisnika u bazu.
4. Dekodiranje — frontend pomoću jwt-decode čita podatke iz tokena i sprema ih u localStorage.
5. Rezultat — korisnik je prijavljen, a njegovi podaci su dostupni za prikaz u sučelju.

Ovaj proces omogućuje sigurnu i brzu autentifikaciju korisnika te automatsku sinkronizaciju s backend bazom.

---

## Security konfiguracija (config/SecurityConfig.java)

### Funkcija

`SecurityConfig` konfigurira pravila sigurnosti za REST API rute, onemogućava CSRF zaštitu (jer se koristi JWT) i omogućuje autentifikaciju putem Google OAuth2 JWT tokena.

### Kod i objašnjenje

```java
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/addPerson", "/deletePerson/**").authenticated()
                .anyRequest().permitAll()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> {}));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
```

### Objašnjenje sigurnosnih postavki

* **CSRF isključen** jer se koristi stateless autentifikacija putem JWT tokena.
* **CORS konfiguracija** omogućava zahtjeve s frontenda (`http://localhost:3000`).
* **Autorizacija ruta:**

  * `/addPerson` i `/deletePerson/**` zahtijevaju autentifikaciju.
  * Sve ostale rute (`/allPersons`, `/id`) su javno dostupne.
* **OAuth2 Resource Server konfiguracija:** omogućuje da backend validira Googleov JWT token poslan u `Authorization` zaglavlju.

### JWT provjera

Spring automatski validira JWT token pomoću Googleovog javnog ključa i, ako je token ispravan, omogućava pristup autentificiranim rutama.

Dio koda za Spring Security konfiguraciju izrađen je uz pomoć **ChatGPT (OpenAI)**.
**Datum pristupa:** 2025-10-31
**Svrha:** Implementacija sigurnosne konfiguracije za backend sustav s OAuth2 autentifikacijom.

---

## Datoteka application.properties

U `src/main/resources/application.properties` potrebno je dodati sljedeću postavku kako bi Spring znao koristiti Googleov issuer URI prilikom provjere JWT tokena:

```properties
spring.security.oauth2.resourceserver.jwt.issuer-uri=https://accounts.google.com
```

Ova postavka omogućuje Spring Securityju da automatski validira Google JWT tokene koristeći javne ključeve koje Google nudi na adresi `https://accounts.google.com`.

---

## Cjelokupni tijek autentifikacije (frontend ↔ backend)

1. Korisnik klikne na **„Login with Google“** u `Navbar.jsx`.
2. Google vraća `credential` (JWT token) nakon uspješne prijave.
3. Frontend šalje `POST` zahtjev na `http://localhost:8080/addPerson` s JWT tokenom u zaglavlju:

   ```http
   Authorization: Bearer <JWT_TOKEN>
   ```
4. Backend (Spring Security) validira JWT token i dohvaća korisničke podatke (`email`, `name`).
5. Ako korisnik ne postoji u bazi, stvara se novi zapis u tablici `person`.
6. Ako korisnik već postoji, backend vraća HTTP status `409 Conflict`.
7. Nakon toga, korisnik ostaje prijavljen u frontendu, a podaci se pohranjuju u `localStorage`.

---

## Zaključak

Ovim backend dijelom projekta ostvarena je potpuna integracija između React frontenda i Spring Boot backenda putem Google OAuth2 prijave. Backend se brine za validaciju JWT tokena, kontrolu pristupa i pohranu korisnika u bazu podataka. Cjelokupna komunikacija osigurana je standardnim sigurnosnim mehanizmima, dok je frontend zadužen za vizualnu autentifikaciju i prikaz korisničkog sučelja.

Dio dokumentacije i objašnjenja koda izrađen je uz pomoć **ChatGPT (OpenAI)** za potrebe strukturiranja i pojašnjavanja Spring Security konfiguracije.
**Datum pristupa:** 2025-11-3
**Svrha:** Dokumentacija i objašnjenje funkcionalnosti backend sustava te integracija s Google OAuth2 autentifikacijom.
