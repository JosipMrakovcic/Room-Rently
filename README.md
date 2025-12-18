# Room-Rently

**Modernizacija turizma u jednoj aplikaciji**
Tim: **OpenReservations [TG03.2]**
Kolegij: **Programsko inženjerstvo**
Fakultet elektrotehnike i računarstva, Sveučilište u Zagrebu

---

## Opis projekta

**Room-Rently** je web-aplikacija razvijena s ciljem modernizacije i pojednostavljenja procesa rezervacije smještaja.
Projekt omogućuje **učinkovitu komunikaciju između gostiju i ugostitelja**, transparentno upravljanje smještajem te pregled statistike za vlasnike i administratore.

Projekt je rezultat timskog rada u sklopu kolegija *Programsko inženjerstvo* te demonstrira primjenu znanja iz područja web tehnologija, autentifikacije, obrade podataka i upravljanja bazama podataka.

### Ciljevi projekta

* Pojednostavljena komunikacija između gostiju i vlasnika.
* Pouzdan proces rezervacije.
* Jednostavno korisničko iskustvo.
* Analitički uvidi za vlasnike i administratore.
* Skalabilnost sustava i lako održavanje.

### Motivacija

Cilj nam je bio razviti modernu platformu koja će spojiti sve aspekte hotelskog poslovanja od rezervacija i komunikacije do analize podataka u jedinstvenom sučelju.
Kroz projekt smo naučili timski rad u okruženju s realnim zahtjevima i modernim alatima.

---

## Funkcijski zahtjevi

| ID zahtjeva | Opis | Prioritet | Kriteriji prihvaćanja |
|--------------|------|------------|------------------------|
| F-001 | Sustav omogućuje autentifikaciju korisnika putem OAuth2 protokola (Google Sign-In). | Visok | Korisnik se može prijaviti i registrirati putem Google računa te uspješno pristupiti sustavu. |
| F-002 | Sustav razlikuje tri uloge korisnika: Gost, Voditelj hotela i Administrator. | Visok | Nakon prijave, korisniku se dodjeljuje odgovarajuća uloga i prikazuju funkcionalnosti prema ovlastima. |
| F-003 | Middleware sloj provjerava korisničku ulogu i pristup API rutama. | Visok | Neovlašteni korisnici nemaju pristup zaštićenim funkcijama. |
| F-004 | Sustav omogućuje unos, izmjenu, dohvat i brisanje smještajnih jedinica (CRUD operacije). | Visok | Voditelj hotela može uspješno unositi i uređivati smještajne jedinice. |
| F-005 | Svaka smještajna jedinica sadrži atribute: naziv, opis, broj kreveta, cijenu, tip, dostupnost i dodatne usluge. | Visok | Podaci se ispravno prikazuju i spremaju u bazu. |
| F-006 | Sustav validira unos podataka (npr. cijena > 0, broj kreveta ≥ 1). | Visok | Pogrešni podaci ne mogu biti spremljeni. |
| F-007 | API omogućuje filtriranje smještajnih jedinica prema cijeni, tipu i dostupnosti. | Srednji | Rezultati pretrage odgovaraju odabranim filtrima. |
| F-008 | Sustav omogućuje stvaranje, pregled, izmjenu i otkazivanje rezervacija (CRUD operacije). | Visok | Gost može uspješno rezervirati i otkazati smještaj. |
| F-009 | Sustav provjerava dostupnost smještaja i sprječava preklapanje termina. | Visok | Nije moguće izvršiti rezervaciju za već zauzet termin. |
| F-010 | Sustav generira potvrdu rezervacije u PDF formatu i šalje e-mail korisniku. | Visok | Nakon potvrde rezervacije, korisnik prima e-mail s PDF dokumentom. |
| F-011 | Sustav omogućuje pregled i izvoz statistike o zauzeću, gostima i popularnosti usluga. | Srednji | Administrator i voditelj hotela mogu generirati izvještaje u PDF, XLSX ili XML formatu. |
| F-012 | Sustav omogućuje prikaz smještaja na interaktivnoj karti putem Google Maps integracije. | Srednji | Lokacija smještaja ispravno se prikazuje na mapi. |
| F-013 | Sustav prikazuje dinamičnu naslovnu stranicu s tražilicom, kategorijama i istaknutim smještajima. | Srednji | Glavna stranica prikazuje ažurirane podatke i omogućuje pretragu. |
| F-014 | Gost može putem tražilice filtrirati ponudu po lokaciji, datumu, cijeni i broju osoba. | Visok | Pretraga prikazuje relevantne rezultate. |
| F-015 | Sustav šalje e-mail obavijesti o novim rezervacijama i promjenama statusa. | Visok | Korisnici dobivaju pravovremene obavijesti putem e-maila. |

---



### Statistika i izvještaji

* Pregled zauzeća jedinica po vremenskim periodima.
* Analiza gostiju po državama i gradovima.
* Izvoz podataka u **PDF**, **XLSX** i **XML** formate.

---

##  Tehnologije

* **Frontend:** React.js
* **Backend:** Spring
* **Baza podataka:** PostgreSQL
* **Autentifikacija:** OAuth2 (Google Sign-In)
* **Razvojno okruženje:** Visual Studio Code, GitHub

---

## Instalacija



---

##  Članovi tima — OpenReservations

| Ime i prezime   | Uloga / Doprinos                  |
| --------------- | --------------------------------- |
| Jakov Zekić     | Frontend razvoj                   |
| Josip Mrakovčić | Vođa/Fullstack razvoj             |
| Karlo Živković  | Frontend razvoj                   |
| Mateo Cerčić    | Backend razvoj                    |
| Nino Strčić     | Backend razvoj                    |
| Noa Rešetar     | Integracija i baze podataka       |

---

##  Kontribucije


---

##  Kodeks ponašanja

Svi članovi tima dužni su poštovati **Kodeks ponašanja studenata FER-a** te pravila profesionalne zajednice programskih inženjera.

---

## Prijava problema

U slučaju nesuglasica ili problema:

* Po potrebi, kontaktirajte voditelja projekta.

---

##  Licenca

**MIT License**

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

© 2025 OpenReservations Team — Fakultet elektrotehnike i računarstva, Sveučilište u Zagrebu

