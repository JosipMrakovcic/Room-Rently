# Room-Rently

**Modernizacija turizma u jednoj aplikaciji**
Tim: **OpenReservations [TG03.2]**
Kolegij: **Programsko inženjerstvo**
Fakultet elektrotehnike i računarstva, Sveučilište u Zagrebu

---

## 📖 Opis projekta

**Room-Rently** je web-aplikacija razvijena s ciljem modernizacije i pojednostavljenja procesa rezervacije smještaja.
Projekt omogućuje **učinkovitu komunikaciju između gostiju i ugostitelja**, transparentno upravljanje smještajem te pregled statistike za vlasnike i administratore.

Projekt je rezultat timskog rada u sklopu kolegija *Programsko inženjerstvo* te demonstrira primjenu znanja iz područja web tehnologija, autentifikacije, obrade podataka i upravljanja bazama podataka.

### 🎯 Ciljevi projekta

* Pojednostavljena komunikacija između gostiju i vlasnika.
* Pouzdan proces rezervacije.
* Jednostavno korisničko iskustvo.
* Analitički uvidi za vlasnike i administratore.
* Skalabilnost sustava i lako održavanje.

### 💡 Motivacija

Cilj nam je bio razviti modernu platformu koja će spojiti sve aspekte hotelskog poslovanja — od rezervacija i komunikacije do analize podataka — u jedinstvenom sučelju.
Kroz projekt smo naučili timski rad u okruženju s realnim zahtjevima i modernim alatima.

---

## ⚙️ Funkcijski zahtjevi

### Frontend

* Pregled i pretraživanje smještajnih jedinica.
* Rezervacija i upravljanje korisničkim profilom.
* Prikaz obavijesti i statusa rezervacija.

### Backend

* Autentifikacija i autorizacija korisnika putem **OAuth2 (Google Sign-In)**.
* Podrška za tri korisničke uloge: **Korisnik**, **Vlasnik**, **Administrator**.
* Middleware za kontrolu pristupa funkcijama.
* Upravljanje rezervacijama (CRUD), sprječavanje preklapanja, slanje potvrda (PDF + e-mail).

### Baza podataka

* Evidencija korisnika, smještajnih jedinica i rezervacija.
* Pohrana povijesti transakcija i statusa.

### Statistika i izvještaji

* Pregled zauzeća jedinica po vremenskim periodima.
* Analiza gostiju po državama i gradovima.
* Izvoz podataka u **PDF**, **XLSX** i **XML** formate.

---

## 🚀 Tehnologije

* **Frontend:** React.js
* **Backend:** Node.js / Express
* **Baza podataka:** MongoDB / PostgreSQL
* **Autentifikacija:** OAuth2 (Google Sign-In)
* **Izvještaji:** PDFKit, XLSX writer
* **Razvojno okruženje:** Visual Studio Code, GitHub

---

## 🧩 Instalacija

1. Klonirajte repozitorij:

   ```bash
   git clone https://github.com/username/room-rently.git
   ```
2. Instalirajte ovisnosti:

   ```bash
   npm install
   ```
3. Pokrenite backend:

   ```bash
   npm run server
   ```
4. Pokrenite frontend:

   ```bash
   npm start
   ```
5. Aplikacija će biti dostupna na `http://localhost:3000`.

---

## 👥 Članovi tima — OpenReservations

| Ime i prezime   | Uloga / Doprinos                  |
| --------------- | --------------------------------- |
| Jakov Zekić     | Frontend razvoj                   |
| Josip Mrakovčić | Backend razvoj                    |
| Karlo Živković  | Integracija i baze podataka       |
| Mateo Cerčić    | UI/UX dizajn i dokumentacija      |
| Nino Strčić     | DevOps i testiranje               |
| Noa Rešetar     | Autentifikacija i API povezivanje |

---

## 🤝 Kontribucije

Za upute o doprinosima pogledajte dokument **CONTRIBUTING.md**.
Tim se obvezuje na poštivanje **Kodeksa ponašanja** i etičkih načela FER-a i IEEE-a.

---

## 🧭 Kodeks ponašanja

Svi članovi tima dužni su poštovati **Kodeks ponašanja studenata FER-a** te pravila profesionalne zajednice programskih inženjera.
Poželjno je:

* Otvorena komunikacija u timu.
* Poštivanje tuđeg rada.
* Pravovremeno rješavanje sukoba.

---

## ⚠️ Prijava problema

U slučaju nesuglasica ili problema:

* Obratite se nastavniku (**Vlado Sruk**) ili asistentu (**Miljenko Krhen**).
* Pokušajte otvoreno razgovarati unutar tima.
* Po potrebi, kontaktirajte voditelja projekta.

---

## 🪪 Licenca

**Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)**

Ovaj repozitorij sadrži otvorene obrazovne sadržaje (OER).
Dozvoljeno je dijeljenje i prilagodba sadržaja uz uvjet:

* **navođenja autora**,
* **nekomercijalne uporabe**,
* **dijeljenja pod istim uvjetima**.

Za više informacija: [https://creativecommons.org/licenses/by-nc-sa/4.0/](https://creativecommons.org/licenses/by-nc-sa/4.0/)

---

© 2025 OpenReservations Team — Fakultet elektrotehnike i računarstva, Sveučilište u Zagrebu

