# Room-Rently — dokumentacija

Video koji je korišten za postavljanje (backend/frontend/baza online): [https://www.youtube.com/watch?v=jBDTsf8jsEs&list=PLacy7j-N4DaT4yWf0v1FKDPK34Iue2y3e&index=8](https://www.youtube.com/watch?v=jBDTsf8jsEs&list=PLacy7j-N4DaT4yWf0v1FKDPK34Iue2y3e&index=8)

---

## Sažetak

Ova dokumentacija opisuje **sve promjene i dodatke napravljene kako bi se cijeli Room‑Rently projekt uspješno postavio na internet (backend + frontend + baza + Docker)**. Uključuje postupak inicijalizacije novog Spring Boot projekta radi Maven Wrappera, ručno dodavanje getter/setter metoda u `Unit` i `UnitImg` modele, kreiranje Dockerfile-a (uz korištenje ChatGPT-a), te dodavanje lokalnih `.env` varijabli za jednostavnije konfiguriranje i deployment.

---

## Promjene i problemi tijekom razvoja 

1. **Inicijalizacija novog Spring Boot projekta**

   * Razlog: trebalo je generirati **Maven Wrapper** (`mvnw`, `mvnw.cmd`) kako bi se projekt mogao graditi i pokretati konzistentno na strojevima koji možda nemaju globalni `mvn`.
   * Ovo je učinjeno lokalno tijekom razvoja — nakon toga su wrapper datoteke dodane u repozitorij.

2. **Getteri i setteri u `Unit` i `UnitImg`**

   * Problem: u originalnim model klasama `Unit` i `UnitImg` nisu bili dostupni getteri i setteri.
   * Rješenje: ručno su ubačeni odgovarajući `getX()` i `setX()` metode kako bi JPA i serijalizacija radili ispravno.

3. **Dockerfile**

   * Dockerfile je izrađen korištenjem **ChatGPT**.

---

# Priprema backenda #

  ## Dockerfile  ##

```dockerfile
# Build stage
FROM maven:3.9.8-eclipse-temurin-21 AS build

WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn clean package -DskipTests

# Run stage - using one of the alternatives
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar .

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/backend-0.0.1-SNAPSHOT.jar"]
```

Ovaj Dockerfile koristi multi-stage build pristup. To znači da se aplikacija najprije gradi u jednom privremenom container-u (sa Mavenom), a zatim se rezultat (JAR datoteka) prenosi u drugi, manji container za pokretanje.
Ukratko kompajlira kod i gradi JAR.

**Napomena:** Dockerfile je generiran korištenjem ChatGPT-a.
**Datum pristupa:** 2025-11-8
**Svrha:** Generiranje Dockerfile specifično prilagođenog mojoj Spring Boot aplikaciji.

  ## Konfiguracija `.env` datoteke (lokalno)

Za olakšanu konfiguraciju baze i frontenda kreirana je `.env` datoteka s lokalnim varijablama:

```env
DATASOURCE_URL=jdbc:postgresql://localhost:5432/BazaPROGI
DATASOURCE_USER=postgres
DATASOURCE_PASSWORD=bazepodataka
FRONTEND_URL=http://localhost:3000
```

Ove varijable se koriste prilikom pokretanja backenda i prilagodbe postavki za povezivanje na bazu i frontend.

  ## Funkcija frontendUrl ##

Varijabla `frontendUrl` služi za dinamičko dohvaćanje URL-a frontenda iz ili application.properties, tako da se CORS pravila automatski prilagode okruženju. Time backend dopušta zahtjeve samo s definirane frontend adrese.

Koristi se u CORS konfiguraciji u funkciji `corsConfigurationSource` u klasi `SecurityConfig`:

config.setAllowedOrigins(List.of(frontendUrl));

  ## application.properties ##

```application.properties
spring.datasource.url=${DATASOURCE_URL}
spring.datasource.username=${DATASOURCE_USER}
spring.datasource.password=${DATASOURCE_PASSWORD}

spring.profiles.include=docker
frontend.url=${FRONTEND_URL}
```
`spring.profiles.include=docker`	Aktivira dodatni Spring profil naziva docker, što omogućuje da se određene postavke učitaju samo kada se koristi Docker okruženje.
`frontend.url=${FRONTEND_URL}`	Postavlja URL frontend aplikacije. Vrijednost se ne upisuje ručno, već se čita iz environment varijable FRONTEND_URL 
`spring.datasource.url=${DATASOURCE_URL}`	Definira URL baze podataka. Umjesto statičke vrijednosti koristi se environment varijabla DATASOURCE_URL 
`spring.datasource.username=${DATASOURCE_USER}`	Korisničko ime za pristup bazi podataka, također preuzeto iz environment varijable.
`spring.datasource.password=${DATASOURCE_PASSWORD}`	Lozinka za pristup bazi podataka, preuzeta iz environment varijable radi sigurnosti 

---

# Priprema frontenda #

Kako bi frontend aplikacija znala s kojim backendom treba komunicirati, potrebno je dodati datoteku .env u frontend projekt s ovim sadržajem:

```env
REACT_APP_API_URL=https://room-rently-backend.onrender.com
```

Za pozivanje backend API-ja bilo gdje u frontend aplikaciji moguće je koristiti:
`${process.env.REACT_APP_API_URL}`
Ova metoda dohvaća URL backenda iz .env datoteke, gdje je definiran parametar.

Nakon toga, backend se može pozivati korištenjem odgovarajućih HTTP metoda (GET, POST, PUT, DELETE, itd.).
Primjer: fetch(`${process.env.REACT_APP_API_URL}/unit/all`);

---

# Deployment backenda #

## Korak 1: Postavljanje Varijabli Okruženja ##
Prije pakiranja aplikacije, potrebno je konfigurirati njen connection string i druge postavke. To radimo postavljanjem varijabli okruženja direktno u terminalu.

```powershell
$env:DATASOURCE_URL="jdbc:postgresql://localhost:5432/BazaPROGI"
$env:DATASOURCE_USER="postgres"
$env:DATASOURCE_PASSWORD="bazepodataka"
$env:FRONTEND_URL="http://localhost:3000"
```

## Korak 2: Pakiranje Aplikacije ##
Sada kada je konfiguracija postavljena, aplikaciju trebamo pretvoriti u izvršni JAR fajl.

```powershell
./mvnw package 
```

Ova naredba pokreće Maven alat za upravljanje projektom. Preuzima sve potrebne biblioteke.
Kompajlira Java kod i pakira ga u JAR fajl unutar target direktorija. Ovaj JAR fajl je samostalna, izvršna verzija vaše aplikacije.

## Korak 3: Izrada Docker Slike ## 
Sljedeći korak je umetanje naše aplikacije u "kontejner" pomoću Docker-a. Kontejner omogućuje da aplikacija radi dosljedno na bilo kojem računalu.
Docker će slijediti upute u Dockerfileu, preuzeti službenu Java sliku, kopirati vaš JAR fajl unutar nje i konfigurirati je za pokretanje.

```powershell
docker build -t demo-deployment .
```

## Korak 4: Dijeljenje Docker Slike na Docker Hubu ##
Kako bismo aplikaciju mogli pokrenuti na serveru (npr. Render.com), potrebno je našu Docker sliku postaviti na javni registry.

```powershell
docker tag demo-deployment vase_dockerhub_ime/demo-deployment:latest
```
Zamijenite vase_dockerhub_ime sa svojim stvarnim Docker Hub korisničkim imenom.
Sada je sliku moguće gurnuti na Docker Hub.

```powershell
docker push vase_dockerhub_ime/demo-deployment:latest
```

Ova naredba uploada označenu sliku na Docker Hub registry

## Korak 5: Postavljanje na Render.com ##
Sada kada je vaša slika na Docker Hubu, možete je pokrenuti na bilo kojem servisu koji podržava Docker, kao što je Render.
 * Otvorite Render.com dashboard i kreirajte novu Web Service uslugu.
 * Odaberite opciju "Deploy an existing image from a registry".
 * U polje "Image URL" unesite putanju do vaše slike: vase_dockerhub_ime/demo-deployment:latest
 * Render će preuzeti vašu sliku i pokrenuti je. Sada vam je backend aplikacija dostupna na javnoj URL adresi koju će vam Render dodijeliti.

---

 # Deployment frontenda #
Slijediti ove korake za uspješno postavljanje frontenda na Netlify i ažuriranje konfiguracije backenda aplikacije na Renderu.

## Korak 1: Ažuriranje URL-a Backenda u Frontendu ##
Prvo je potrebno reći frontend aplikaciji gdje se nalazi backend servis na Renderu.
 * Otvorit .env datoteku u root direktoriju vašeg frontend projekta.
 * Ažurirajte varijablu koja sadrži URL backend servisa:
```env
REACT_APP_API_URL=https://vas-backend-app.onrender.com
```
Frontend aplikacija mora znati točnu adresu backend servisa kako bi mogla slati zahtjeve za podacima.

## Korak 2: Priprema Frontenda za Production ##
Prije deploymenta, frontend aplikaciju trebamo pretvoriti u optimiziranu, production-ready verziju.

```powershell
cd client
npm run build
```
npm run build - ova naredba:
 * Optimizira JavaScript kod
 * Kompajlira CSS i assets
 * Kreira build direktorij sa statičkim fajlovima spremnima za serviranje
 * Povećava performanse aplikacije za produkcijsko okruženje

## Korak 3: Deployment Frontenda na Netlify ##
 * Otvorite netlify.com i prijavite se
 * Kliknite na "Add new site" → "Deploy manually"
 * Učitajte build folder:

Netlify će automatski preuzeti i hostati statičke fajlove iz build direktorija
Dobit ćete jedinstveni URL (npr. https://vas-app.netlify.app) gdje je vaš frontend sada dostupan

## Korak 4: Ažuriranje Backenda na Renderu ##
Sada kada je frontend deployan, trebamo reći backendu da dopusti zahtjeve s ove nove adrese.

 * Otvorite vaš backend projekt na render.com
 * U dashboardu pronađite "Environment Variables" sekciju
 * Ažurirajte FRONTEND_URL varijablu: FRONTEND_URL=https://vas-app.netlify.app

## Korak 5: Konfiguracija Environment Varijabli na Netlify ##
Kako bi frontend znao gdje šaljati API zahtjeve, potrebno je postaviti backend URL kao environment varijablu.

Na Netlify dashboardu, idite na:
  * "Site settings" → "Environment variables"
  * Dodajte novu varijablu:
  REACT_APP_API_URL=https://room-rently-backend.onrender.com

  Netlify će injicirati ovu varijablu u vašu frontend aplikaciju pri buildanju. Frontend će moći pristupiti ovoj varijabli kroz process.env.REACT_APP_API_URL. Ovo omogućava frontendu da dinamički prilagodi endpointove ovisno o okruženju.

Dio dokumentacije i objašnjenja koda izrađen je uz pomoć **ChatGPT (OpenAI)** za potrebe strukturiranja i pojašnjavanja tijeka deploymenta projekta.
**Datum pristupa:** 2025-11-8
**Svrha:** Dokumentacija i objašnjenje deploymenta projekta.