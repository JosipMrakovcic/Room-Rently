# Drugi ciklus 

## Početne instalacije

* Prilikom korištenja nove verzije koda bilo je potrebno instalirati dodatne pakete unutar client foldera. Instalacije su izvršene pomoću sljedećih naredbi:

```bash 
npm install chart.js react-chartjs-2
```

* Ovi paketi koriste se za prikaz grafova i vizualizaciju podataka unutar aplikacije.

```bash 
npm install jspdf
```

* Paket jspdf omogućuje generiranje i preuzimanje PDF dokumenata iz aplikacije.

```bash 
npm install xlsx
```

* Paket xlsx koristi se za rad s Excel datotekama, uključujući izvoz i obradu tabličnih podataka.

## Izmjene u glavnoj routing konfiguraciji App.js

* U datoteci App.js ažurirana je konfiguracija ruta kako bi se omogućio pristup korisničkim rezervacijama i kontrolnoj ploči vlasnika.

#### Dodana ruta za korisničke rezervacije:
```jsx
<Route path="/booked-reservations" element={<UserReservations />} />
```

* Ruta /booked-reservations vodi na komponentu UserReservations


#### Dodana ruta za kontrolnu ploču vlasnika
```jsx
<Route path="/owner-dashboard" element={<OwnerDashboard />} />
```

* Ruta /owner-dashboard vodi na OwnerDashboard komponentu.

## Dodavanje gumba za rezervaciju na stranici hotela

* Na stranici Hotel implementiran je gumb za rezervaciju smještaja (Book Now te Reserve Now), koji korisniku omogućuje otvaranje modalnog prozora za potvrdu rezervacije odabrane jedinice.

### Upravljanje stanjem rezervacije

* Za kontrolu prikaza rezervacijskog modala korišten je React hook useState. 
* Dodano je novo stanje openReserve, koje određuje hoće li se prikazati komponenta ReserveModal.

```jsx 
const [openReserve, setOpenReserve] = useState(false);
```

* Također je korišten hook useParams kako bi se dohvatila identifikacija trenutne smještajne jedinice (id) iz URL-a:

```jsx 
const { id } = useParams();
```
### Prikaz rezervacijskog modala

* Komponenta ReserveModal renderira se uvjetno, samo u slučaju kada je stanje openReserve postavljeno na true. 
* Kao propsi joj se prosljeđuju funkcija za zatvaranje modala i ID smještajne jedinice.

```jsx 
{openReserve && (
  <ReserveModal setOpenReserve={setOpenReserve} unitId={id} />
)}
```

### Gumb Reserve Now

* Na vrhu stranice hotela dodan je glavni gumb za rezervaciju, označen kao Reserve Now.
* Klikom na gumb mijenja se stanje openReserve u true, čime se otvara rezervacijski modal.

```jsx 
<button className="booknow" onClick={() => setOpenReserve(true)}>
  Reserve Now
</button>
```

* Ovaj gumb je istaknut kako bi bio lako vidljiv korisniku odmah po učitavanju stranice.

### Gumb Reserve or Book Now

* Dodatni gumb za rezervaciju nalazi se unutar sekcije s cijenom i detaljima smještaja.
* Njegova funkcionalnost identična je glavnom gumbu odnosno služi kao alternativna opcija za pokretanje procesa rezervacije.

```jsx 
<button onClick={() => setOpenReserve(true)}>
  Reserve or Book Now !
</button>
```

### Funkcionalnost gumba

Oba gumba otvaraju isti rezervacijski modal ,koriste zajedničko stanje (openReserve),
prosljeđuju ID hotela/smještajne jedinice za daljnju obradu rezervacije.

# ReserveModal komponenta
## Uvozi i CSS
```jsx
import "./reserveModal.css";
import { useState } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format } from "date-fns";
```

* reserveModal.css su lokalni stilovi.
* useState je React hook za lokalno stanje.
* DateRange iz react-date-range je UI picker za izbor raspona datuma.
* date-fns → format služi za formatiranje datuma prije slanja.

## Potpis komponente i props

```jsx
const ReserveModal = ({ setOpenReserve, unitId }) => { ... }
```

* setOpenReserve funkcija iz roditelja koja zatvara/otvara modal.
* unitId ID smještajne jedinice. Ako ga nema, koristi se fakeId.

### Fake ID
```jsx
const fakeId = unitId || Math.floor(Math.random() * 10000);
```
* Ako unitId nije dostupan, generira se nasumičan fakeId .
## Stanja komponente
```jsx
const [options, setOptions] = useState({
    parking: false,
    wifi: false,
    breakfast: false,
    towels: false,
    shampoo: false,
    hairDryer: false,
    heater: false,
    airConditioning: false,
  });

  const [dates, setDates] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const [guests, setGuests] = useState({
    adults: 1,
    children: 0,
  });

  const [showThanks, setShowThanks] = useState(false);
```

* options objekt s dostupnim dodatnim uslugama poput parkinga, wifi-a, ... Vrijednosti su boolean.
* dates niz s objektom raspona datuma za DateRange komponentu.
* guests broj odraslih i djece; odrasli imaju minimum 1.
* showThanks kontrolira prikaz thank-you ekrana nakon potvrde.

## Pomoćna funkcija za mijenjanje gostiju
```jsx
const modifyGuests = (type, op) => {
    setGuests((prev) => {
      let newValue;
      if (op === "inc") {
        newValue = prev[type] + 1;
      } else {
        if (type === "adults") {
          newValue = Math.max(1, prev[type] - 1);
        } else {
          newValue = Math.max(0, prev[type] - 1);
        }
      }
      return { ...prev, [type]: newValue };
    });
  };
```
* type je "adults" ili "children".
* op je "inc" ili "dec" (increment ili decrement).
* Održava minimalne granice (najmanje 1 adult, 0 children).

## Validacija prije slanja

```jsx
const validate = () => {
    if (dates[0].startDate > dates[0].endDate) {
      alert("Start date cannot be after end date");
      return false;
    }
    if (guests.adults < 1) {
      alert("At least 1 adult required");
      return false;
    }
    return true;
  };
```
* Provjerava ispravnost raspona datuma.
* Provjerava minimalan broj odraslih.

## Potvrda rezervacije
```jsx
 const handleConfirm = () => {
    if (!validate()) return;

    const reservationData = {
      startDate: format(dates[0].startDate, "yyyy-MM-dd"),
      endDate: format(dates[0].endDate, "yyyy-MM-dd"),
      status: "Pending",
      unit: { idUnit: Number(unitId) },
      adults: guests.adults,
      children: guests.children,
      options: options,
      fakeId: fakeId,
    };

    console.log("DATA TO SEND TO BACKEND:", reservationData);

    // Prikaži Thank You ekran
    setShowThanks(true);
  };
```

* Formatira datume spremne za backend.
* Polje unit s idUnit (pretvoreno u broj).
* status postavljen na "Pending" može se prilagoditi prema API specifikaciji.
* Trenutno se podaci samo logiraju u konzolu; ovdje treba dodati fetch/axios poziv za slanje na server.
* Na kraj funkcije se postavlja showThanks na true da prikaže potvrdu.

## Thank You ekran

* Kada je showThanks === true komponenta vraća poseban sadržaj: 
```jsx
if (showThanks) {
    return (
      <div className="reserveOverlay">
        <div className="reserveBox">
          <button className="closeBtn" onClick={() => setOpenReserve(false)}>
            ✕
          </button>
          <div className="thanksContainer">
            <h2>Reservation Confirmed!</h2>
            <p>Reserve Apartment ID: {fakeId}</p>
            <p>We sent you a confirmation via email.</p>
            <div className="buttonGroup">
              <button className="confirmBtn" onClick={() => alert("Resent!")}>
                Resend Email
              </button>
              <button className="closeThanksBtn" onClick={() => setOpenReserve(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
```

* overlay s tekstom „Reservation Confirmed!“
* prikaz fakeId
* gumb za ponovno slanje emaila (Resend Email) koji trenutno radi alert("Resent!")
* gumb za zatvaranje (Close) koji poziva setOpenReserve(false)

## Glavno sučelje za rezervaciju
```jsx
return (
    <div className="reserveOverlay">
      <div className="reserveBox">
        <button className="closeBtn" onClick={() => setOpenReserve(false)}>
          ✕
        </button>

        <h2>Reserve Apartment ID: {fakeId}</h2>

        <div className="picker">
          <DateRange
            ranges={dates}
            onChange={(item) => setDates([item.selection])}
            minDate={new Date()}
          />
        </div>

        <div className="guests">
          <div>
            Adults: {guests.adults}
            <button onClick={() => modifyGuests("adults", "inc")}>+</button>
            <button onClick={() => modifyGuests("adults", "dec")}>-</button>
          </div>

          <div>
            Children: {guests.children}
            <button onClick={() => modifyGuests("children", "inc")}>+</button>
            <button onClick={() => modifyGuests("children", "dec")}>-</button>
          </div>
        </div>

        <div className="unitOptions">
          <h3>Available Options</h3>
          <div className="optionsContainer">
            {Object.entries(options).map(([key, value]) => (
              <label className="optionCard" key={key}>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => setOptions({ ...options, [key]: !value })}
                />
                <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
              </label>
            ))}
          </div>
        </div>

        <button className="confirmBtn" onClick={handleConfirm}>
          Confirm Reservation
        </button>
      </div>
    </div>
  );
};

export default ReserveModal;
```

Glavni prikaz sadrži:

* closeBtn setOpenReserve(false) zatvara modal
* naslov Reserve Apartment ID: {fakeId}
* DateRange picker:
```jsx
<DateRange
  ranges={dates}
  onChange={(item) => setDates([item.selection])}
  minDate={new Date()}
/>
```
* Postavljen minDate na danas kako bi se spriječio odabir prošlih datuma.
* Sekcija za goste s plus/minus gumbima koji koriste modifyGuests.
* Sekcija Available Options gdje se options mapiraju u checkbox-e:
```jsx
{Object.entries(options).map(([key, value]) => (
  <label className="optionCard" key={key}>
    <input type="checkbox" checked={value} onChange={() => setOptions({ ...options, [key]: !value })} />
    <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
  </label>
))}
```
* Gumb Confirm Reservation koji pokreće handleConfirm.

# ReserveModal CSS

## Overlay pozadina modala
```css
.reserveOverlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}
```

* Modal koristi fullscreen overlay koji prekriva cijelu stranicu
* Tamna prozirna pozadina (rgba(0,0,0,0.6)) 
* flex centriranje postavlja modal u sredinu ekrana
* z-index: 999 sprječava prekrivanje modala drugim elementima

## Glavni modalni okvir
```css
.reserveBox {
  background: white;
  padding: 25px;
  border-radius: 10px;
  width: 450px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 0 20px rgba(0,0,0,0.2);
  position: relative;
}
```

* Bijela pozadina i zaobljeni rubovi
* max-height: 90vh i overflow-y: auto omogućuju scroll na manjim ekranima
* position: relative omogućuje apsolutno pozicioniranje gumba za zatvaranje

## Gumb za zatvaranje modala
```css
.closeBtn {
  position: absolute;
  right: 15px;
  top: 15px;
  cursor: pointer;
  background: none;
  border: none;
  font-size: 22px;
  z-index: 10;
}
```

* Smješten u gornjem desnom kutu modala
* Bez pozadine i obruba 
* Veliki font osigurava vidljivost

## Date picker sekcija
```css
.picker {
  margin-top: 15px;
}
```
* Dodaje vertikalni razmak između naslova i DateRange komponente

## Sekcija za broj gostiju
```css
.guests {
  margin-top: 20px;
}

.guests div {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
```
* Fleksni raspored 
* Podrška za više redova na manjim ekranima

## Gumbi za povećanje/smanjenje broja gostiju
```css
.guests button {
  padding: 5px 10px;
  border-radius: 6px;
  border: none;
  background: #0071c2;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.guests button:hover {
  background: #005a9c;
}
```

* Plava boja prati primarnu temu aplikacije
* hover efekt 

## Opcije smještaja
```css
.unitOptions {
  margin-top: 20px;
}

.optionsContainer {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
  gap: 10px;
  margin-top: 10px;
}
```

* CSS Grid omogućuje automatsku prilagodbu broja stupaca
* Opcije se raspoređuju u kartice koje se prilagođavaju širini zaslona

## Kartice opcija
```css
.optionCard {
  display: flex;
  align-items: flex-start;
  padding: 10px 8px;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  background: #f9f9f9;
  transition: all 0.2s ease;
  min-height: 44px;
}

.optionCard:hover {
  background: #e6f0ff;
  border-color: #0071c2;
}
```
* Kartice se ponašaju kao klikabilne cjeline
* Hover efekt 

## Checkbox i tekst opcija
```css
.optionCard input {
  margin-right: 8px;
  accent-color: #0071c2;
  flex-shrink: 0;
  margin-top: 2px;
}

.optionCard span {
  flex: 1;
  font-size: 0.95em;
  line-height: 1.4;
  word-break: break-word;
}
```

* Boja checkboxa usklađena s primarnom bojom aplikacije
* Tekst se automatski lomi pri manjim dimenzijama

## Gumb za potvrdu rezervacije
```css
.confirmBtn {
  margin-top: 20px;
  padding: 12px;
  width: 100%;
  background: #0071c2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirmBtn:hover {
  background: #005a9c;
}
```

* Glavni akcijski gumb jasno istaknut punom širinom
* Vizualno dosljedan svim ostalim interaktivnim elementima

## Gumbi na Thank You ekranu
```css
.buttonGroup {
  display: flex;
  gap: 10px;
  width: 100%;
  margin-top: 20px;
}

.closeThanksBtn {
  padding: 12px;
  background: #555;
  color: white;
  border: none;
  border-radius: 8px;
}
```

* Gumbi su jednako raspodijeljeni
* Close gumb koristi neutralniju boju radi razlikovanja od primarne akcije

## Thank You sadržaj
```css
.thanksContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
```
* Centraliziran sadržaj za jasnu vizualnu potvrdu uspješne rezervacije

## Responzivni dizajn 

### do 480px

* Modal se prilagođava širini ekrana
* Grid opcija se komprimira
* Gumbi zadržavaju dodirnu pristupačnost

### do 400px, 360px, 340px

* Smanjuje se font i padding
* Opcije se slažu u manje kolone ili jednu kolonu
* Sve ostaje čitljivo i funkcionalno na vrlo malim uređajima

# Pregled i upravljanje korisničkim rezervacijama UserReservations

Komponenta UserReservations omogućuje korisniku pregled svih njegovih rezervacija,
 prikaz detalja svake rezervacije te opciju njezinog otkazivanja uz potvrdu.
Također uključuje navigaciju natrag na glavnu stranicu i povratnu informaciju o uspješno izvršenom otkazivanju.

## Uvozi i ovisnosti
```jsx
import "./userReservations.css";
import { useState } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
```

* userReservations.css stilovi stranice
* useState služi upravljanje lokalnim stanjem
* date-fns/format formatiranje datuma u čitljiv oblik
* useNavigate programatska navigacija između ruta

## Navigacija
```jsx
const navigate = useNavigate();
```
* Omogućuje povratak korisnika na glavnu stranicu /main pritiskom na gumb

## Stanje rezervacija 

```jsx
const [reservations, setReservations] = useState([
  {
    id: 101,
    startDate: new Date("2025-12-10"),
    endDate: new Date("2025-12-15"),
    adults: 2,
    children: 1,
    options: { wifi: true, breakfast: false, parking: true },
    status: "Confirmed",
  },
  ...
]);
```

* Rezervacije su trenutno simulirane lažni podatci radi testiranja UI-a

### Svaka rezervacija sadrži:
* id  identifikator rezervacije
* datume dolaska i odlaska
* broj gostiju
* odabrane dodatne usluge
* status (Confirmed, Pending, Cancelled)

## Stanja za otkazivanje rezervacije
```jsx
const [cancelModal, setCancelModal] = useState(null);
const [confirmedCancel, setConfirmedCancel] = useState(null);
```

* cancelModal sadrži ID rezervacije koja se želi otkazati
* confirmedCancel koristi se za prikaz potvrde uspješnog otkazivanja

## Pokretanje otkazivanja
```jsx
const handleCancelClick = (resId) => {
  setCancelModal(resId);
};
```
* Klik na Cancel pohranjuje ID rezervacije
* Aktivira se modal za potvrdu otkazivanja

## Potvrda otkazivanja
```jsx
const confirmCancel = () => {
  setReservations((prev) =>
    prev.map((r) =>
      r.id === cancelModal ? { ...r, status: "Cancelled" } : r
    )
  );
  setConfirmedCancel(cancelModal);
  setCancelModal(null);
};
```
* Mijenja status rezervacije u "Cancelled"
* Zatvara confirmation modal
* Otvara prozor s porukom o uspješnom otkazivanju

## Gumb za povratak
```jsx
<button className="backButton" onClick={() => navigate("/main")}>
  ← Back to Main Page
</button>
```
* Omogućuje brz povratak na glavnu stranicu aplikacije

## Zaglavlje rezervacija

```jsx
<h2>Your Current Reservations</h2>
<p>{reservations.length} reservation(s)</p>
```

Prikaz ukupnog broja korisnikovih rezervacija


## Prazno stanje bez rezervacija
```jsx
{reservations.length === 0 && (
        <div className="emptyState">
          <p>No reservations found.</p>
          <button className="primaryButton" onClick={() => navigate("/main")}>
            Book Now
          </button>
        </div>
      )}

```

### Ako nema rezervacija:
* prikazuje se poruka
* nudi se gumb Book Now za brzu rezervaciju

## Popis rezervacija

```jsx
<div className="reservationsList">
        {reservations.map((res) => (
          <div key={res.id} className="reservationCard">
            <div className="reservationHeader">
              <span className="reservationId">Reservation #{res.id}</span>
              <span className={`reservationStatus ${res.status.toLowerCase()}`}>
                {res.status}
              </span>
            </div>

            <div className="reservationDetails">
              <div className="detailItem">
                <span className="detailLabel">Dates:</span>
                <span className="detailValue">
                  {format(res.startDate, "MMM dd, yyyy")} - {format(res.endDate, "MMM dd, yyyy")}
                </span>
              </div>

              <div className="detailItem">
                <span className="detailLabel">Guests:</span>
                <span className="detailValue">
                  {res.adults} Adult{res.adults !== 1 ? "s" : ""}
                  {res.children > 0 && `, ${res.children} Child${res.children !== 1 ? "ren" : ""}`}
                </span>
              </div>

              <div className="detailItem">
                <span className="detailLabel">Amenities:</span>
                <span className="detailValue">
                  {res.options.wifi && "Wi-Fi "}
                  {res.options.breakfast && "Breakfast "}
                  {res.options.parking && "Parking"}
                  {!res.options.wifi && !res.options.breakfast && !res.options.parking && "None selected"}
                </span>
              </div>
            </div>

            <div className="reservationActions">
              {res.status !== "Cancelled" && (
                <button className="cancelButton" onClick={() => handleCancelClick(res.id)}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
```

* Svaka rezervacija je prikazana kao zasebna kartica
### Kartica sadrži:
* ID rezervacije
* Status rezervacije (dinamička CSS klasa)
* Datume boravka formatirani pomoću date-fns
* Broj gostiju
* Odabrane dodatne usluge

### Dinamički prikaz statusa
```jsx
<span className={`reservationStatus ${res.status.toLowerCase()}`}>
```

#### Omogućuje različite boje za:
* confirmed
* pending
* cancelled

### Gumb za otkazivanje

```jsx
{res.status !== "Cancelled" && (
  <button className="cancelButton">Cancel</button>
)}
```

* Gumb se prikazuje samo za aktivne rezervacije
* Već otkazane rezervacije nemaju opciju ponovnog otkazivanja

## Modal za potvrdu otkazivanja

```jsx
{cancelModal && (
        <div className="reserveOverlay">
          <div className="reserveBox">
            <h2>Are you sure you want to cancel this reservation?</h2>
            <div className="confirmationActions">
              <button className="primaryButton" onClick={confirmCancel}>
                Yes, Cancel
              </button>
              <button className="secondaryButton" onClick={() => setCancelModal(null)}>
                No, Go Back
              </button>
            </div>
          </div>
        </div>
      )}
```

* Prikazuje se kada korisnik klikne Cancel
* Koristi isti overlay princip kao rezervacija
### Dvije opcije:
* Yes, Cancel
* No, Go Back

## Modal za uspješno otkazivanje

```jsx
{confirmedCancel && (
        <div className="reserveOverlay">
          <div className="reserveBox">
            <div className="successIcon">✓</div>
            <h2>Reservation #{confirmedCancel} Cancelled!</h2>
            <p>The reservation has been successfully cancelled.</p>
            <button className="primaryButton" onClick={() => setConfirmedCancel(null)}>
              Back to Reservations
            </button>
          </div>
        </div>
      )}
```

* Vizualna potvrda uspješnog otkazivanja
* Prikazuje ID otkazane rezervacije
* Gumb vraća korisnika na popis rezervacija

# UserReservations CSS

## Osnovni izgled stranice
```css
.userReservationsPage {
  font-family: Arial, sans-serif;
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
  background-color: #e6f2ff;
  color: #003366;
}
```

* Centralno poravnata stranica s maksimalnom širinom
* Svijetloplava pozadina 

## Gumb za povratak na glavnu stranicu
```css
.backButtonContainer {
  margin-bottom: 20px;
}

.backButton {
  background-color: #cce6ff;
  color: #003366;
  border-radius: 6px;
  cursor: pointer;
}
```

* Istaknut, ali nenametljiv gumb plavkaste boje

## Zaglavlje s brojem rezervacija

```css
.reservationsHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reservationsCount {
  font-size: 14px;
  color: #00509e;
}
```

* Fleksni raspored omogućuje uredan izgled
* Broj rezervacija jasno prikazan desno

## Popis rezervacija

```css
.reservationsList {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
```
* Vertikalni raspored kartica s jednakim razmacima

## Kartica rezervacije

```css
.reservationCard {
  border: 1px solid #cce0ff;
  border-radius: 8px;
  padding: 15px;
  background-color: #ffffff;
}
```

* Kartice su suptilno izdignute zbog sjene
* Jasno odvajanje pojedinih rezervacija

## Zaglavlje kartice
```css
.reservationId {
  font-weight: bold;
}
```

* ID rezervacije lako uočljiv

## Detalji rezervacije

```css
.detailItem {
  margin-bottom: 6px;
}

.detailLabel {
  font-weight: 600;
}
```

* Svaki podatak jasno označen većim font weightom

## Akcijski gumbi
```css
.reservationActions {
  display: flex;
  gap: 30px;
}

.cancelButton,
.primaryButton,
.secondaryButton {
  border-radius: 6px;
  cursor: pointer;
}
```

* Gumbi su jasno razdvojeni
* Jedinsteni stil za sve akcije

## Gumb za otkazivanje

```css
.cancelButton {
  background-color: #007bff;
  color: #ffffff;
}
```

* Vizualno istaknuta primarna akcija
* Hover stanje

## Empty state bez rezervacija

```css
.emptyState {
  text-align: center;
  margin-top: 50px;
}
```

* Prijateljska poruka kada nema rezervacija
* Nudi se jasna sljedeća akcija Book Now

## Modal za potvrdu / uspjeh
```css
.reserveOverlay {
  position: fixed;
  background-color: rgba(0,0,0,0.4);
}

.reserveBox {
  background-color: #ffffff;
  border-radius: 10px;
  text-align: center;
}
```

* Konzistentan dizajn s ostalim dijelovima
* Fokusira korisnika na ključnu poruku

## Ikona uspješnog otkazivanja

```css
.successIcon {
  font-size: 40px;
  color: #007bff;
}
```

* Jasna vizualna potvrda akcije

## Status rezervacije
```css
.reservationStatus {
  font-weight: bold;
  text-transform: uppercase;
}
```
### Boje statusa:
* Confirmed zelena (uspješna rezervacija)
* Pending žuta (na čekanju)
* Cancelled – crvena (otkazana)

* Ovakav prikaz omogućuje brzu identifikaciju stanja rezervacije.

## Responzivni dizajn (@media max-width: 600px)

* Smanjeni padding i font
* Kartice ostaju čitljive
* Gumbi prelaze u puni stupčasti raspored
* prilagođen mobilnim uređajima

# OwnerDashboard komponenta

## Uvozi i CSS

```jsx
import React, { useRef, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import "./OwnerDashboard.css";
import { useNavigate } from "react-router-dom";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
```

* React, useState, useRef.
* Bar, Pie chart komponente iz react-chartjs-2.
* jsPDF generiranje PDF dokumenata.
* XLSX generiranje Excel datoteka.
* OwnerDashboard.css lokalni stilovi za dashboard.
* useNavigate React Router hook za navigaciju.
* ChartJS.register(...) registracija potrebnih Chart.js modula skale, elementi, tooltipovi, legenda.

## Funkcija komponente i navigacija
```jsx
export default function OwnerDashboard() {
  const navigate = useNavigate();
  const goBack = () => navigate("/main");
```
* goBack vraća korisnika na /main stranicu.

## Refovi za chartove
```jsx
  const occupancyRef = useRef(null);
  const countryRef = useRef(null);
  const servicesRef = useRef(null);
```
* Svaki ref se koristi za pristup Chart komponenti kako bi se mogao izvesti u PDF.

## Stanje komponente
```jsx
  const [reservations, setReservations] = useState([
    { idUnitReservation: 1, startDate: "2025-12-01", endDate: "2025-12-05", status: "Confirmed", person: { id: 1, name: "Ivan Horvat" }, unit: { unitName: "Room 101" } },
    { idUnitReservation: 2, startDate: "2025-12-03", endDate: "2025-12-07", status: "Pending", person: { id: 2, name: "Anna Müller" }, unit: { unitName: "Room 102" } },
    { idUnitReservation: 3, startDate: "2025-12-02", endDate: "2025-12-06", status: "Confirmed", person: { id: 3, name: "John Smith" }, unit: { unitName: "Suite 201" } },
  ]);

  const [popup, setPopup] = useState({ visible: false, action: "", reservationId: null });
```
* reservations niz rezervacija s detaljima poput ime gosta, jedinica, datumi, status.
* popup kontrolira prikaz potvrde akcije nad rezervacijom (confirm/reject).

## Podaci za chartove
```jsx
  const occupancyData = { labels: ["Room 101", "Room 102", "Suite 201"], datasets: [{ label: "Occupancy (%)", data: [70, 85, 60], backgroundColor: "rgba(75, 192, 192, 0.6)" }] };

  const guestsByCountryData = { labels: ["Croatia", "Germany", "USA", "Italy"], datasets: [{ label: "Guests by Country", data: [40, 30, 20, 10], backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"] }] };

  const popularServicesData = { labels: ["Breakfast", "WiFi", "Parking"], datasets: [{ label: "Popular Services", data: [50, 80, 30], backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"] }] };
```

* occupancyData postotak popunjenosti po jedinici.
* guestsByCountryData broj gostiju po zemlji.
* popularServicesData popularnost dodatnih usluga.

## Funkcija za dodavanje chartova u PDF
```jsx
  const addChartToPDF = (doc, chartRef, x, y, width = 140, height = 90) => {
    const chart = chartRef.current;
    if (!chart) return;
    const image = chart.toBase64Image();
    doc.addImage(image, "PNG", x, y, width, height);
  };
```

* Dohvaća Base64 sliku iz Chart komponente i dodaje u PDF dokument.
## Export funkcije
### PDF statistike
```jsx
  const exportStatsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Hotel Statistics", 20, 20);
    doc.setFontSize(12);
    doc.text("Occupancy", 20, 32);
    addChartToPDF(doc, occupancyRef, 20, 35);
    doc.text("Guests by Country", 20, 135);
    addChartToPDF(doc, countryRef, 20, 140);
    doc.addPage();
    doc.text("Popular Services", 20, 20);
    addChartToPDF(doc, servicesRef, 20, 30);
    doc.save("hotel_statistics.pdf");
  };
```
### Excel statistike
```jsx
  const exportStatsXLSX = () => {
    const ws = XLSX.utils.json_to_sheet([
      { Occupancy: occupancyData.datasets[0].data.join(", ") },
      { GuestsByCountry: guestsByCountryData.datasets[0].data.join(", ") },
      { PopularServices: popularServicesData.datasets[0].data.join(", ") }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stats");
    XLSX.writeFile(wb, "hotel_statistics.xlsx");
  };
```
### PDF rezervacije
```jsx
  const exportReservationsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Current Reservations", 20, 20);
    doc.setFontSize(12);
    reservations.forEach((r, i) => {
      doc.text(`${r.person.name} | ${r.unit.unitName} | ${r.startDate} - ${r.endDate} | Status: ${r.status}`, 20, 35 + i * 10);
    });
    doc.save("reservations.pdf");
  };
```
### Excel rezervacije
```jsx
  const exportReservationsXLSX = () => {
    const ws = XLSX.utils.json_to_sheet(
      reservations.map((r) => ({ Guest: r.person.name, Unit: r.unit.unitName, StartDate: r.startDate, EndDate: r.endDate, Status: r.status }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reservations");
    XLSX.writeFile(wb, "reservations.xlsx");
  };
```
### Popup za potvrdu akcije
```jsx
  const handleActionClick = (action, reservationId) => {
    setPopup({ visible: true, action, reservationId });
  };

  const confirmAction = () => {
    setReservations((prev) =>
      prev.map((r) =>
        r.idUnitReservation === popup.reservationId
          ? { ...r, status: popup.action === "Confirm" ? "Confirmed" : "Rejected" }
          : r
      )
    );
    setPopup({ visible: false, action: "", reservationId: null });
  };

  const cancelAction = () => {
    setPopup({ visible: false, action: "", reservationId: null });
  };
```
* handleActionClick otvara popup za odabranu rezervaciju.
* confirmAction mijenja status rezervacije.
* cancelAction zatvara popup bez promjene.

## Glavno sučelje komponente

### Navigacija i naslov

```jsx
<div className="owner-dashboard">
  <button className="return-btn" onClick={goBack}>⬅ Return</button>
  <h1>Owner Dashboard</h1>
```

### Sekcija statistike

```jsx
<section className="statistics">
  <h2>Statistics</h2>
  <div className="charts">
    <div className="chart-container"><Bar ref={occupancyRef} data={occupancyData} /></div>
    <div className="chart-container"><Pie ref={countryRef} data={guestsByCountryData} /></div>
    <div className="chart-container"><Pie ref={servicesRef} data={popularServicesData} /></div>
  </div>
  <div className="export-buttons">
    <button onClick={exportStatsPDF}>Export Stats PDF</button>
    <button onClick={exportStatsXLSX}>Export Stats XLSX</button>
  </div>
</section>
```

### Chartovi i gumbi za export statistike.

#### Sekcija rezervacija

```jsx
<section className="reservations">
  <h2>Current Reservations</h2>
  <div className="reservation-container">
    <table className="reservation-table">
      <thead>...</thead>
      <tbody>
        {reservations.map((r) => (
          <tr key={r.idUnitReservation}>
            <td>{r.person.name}</td>
            <td>{r.unit.unitName}</td>
            <td>{r.startDate}</td>
            <td>{r.endDate}</td>
            <td>{r.status}</td>
            <td>
              {r.status === "Pending" && (
                <>
                  <button className="confirm-btn" onClick={() => handleActionClick("Confirm", r.idUnitReservation)}>Confirm</button>
                  <button className="reject-btn" onClick={() => handleActionClick("Reject", r.idUnitReservation)}>Reject</button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="reservation-cards">
      {reservations.map((r) => (
        <div key={r.idUnitReservation} className="reservation-card">
          <p><strong>Guest:</strong> {r.person.name}</p>
          <p><strong>Unit:</strong> {r.unit.unitName}</p>
          <p><strong>Start:</strong> {r.startDate}</p>
          <p><strong>End:</strong> {r.endDate}</p>
          <p><strong>Status:</strong> {r.status}</p>
          {r.status === "Pending" && (
            <div className="card-buttons">
              <button className="confirm-btn" onClick={() => handleActionClick("Confirm", r.idUnitReservation)}>Confirm</button>
              <button className="reject-btn" onClick={() => handleActionClick("Reject", r.idUnitReservation)}>Reject</button>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>

  <div className="export-buttons">
    <button onClick={exportReservationsPDF}>Export Reservations PDF</button>
    <button onClick={exportReservationsXLSX}>Export Reservations XLSX</button>
  </div>
</section>
```

* Prikaz rezervacija u tablici i karticama.
* Akcije Confirm i Reject dostupne samo za Pending rezervacije.
* Export gumbi za PDF i Excel rezervacija.

#### Popup potvrde
```jsx
{popup.visible && (
  <div className="popup-overlay">
    <div className="popup">
      <p>Are you sure you want to {popup.action} this reservation?</p>
      <div className="popup-buttons">
        <button onClick={confirmAction} className="confirm-btn">{popup.action}</button>
        <button onClick={cancelAction} className="reject-btn">Cancel</button>
      </div>
    </div>
  </div>
)}
```
* Sučelje za potvrdu akcije nad rezervacijom Confirm/Reject.

# OwnerDashboard CSS dokumentacija

## Glavni kontejner
```css
.owner-dashboard {
  padding: 20px;
  font-family: Arial, sans-serif;
  background: #f0f8ff;
  color: #333;
}
```

* Glavni wrapper dashboarda.
* Postavlja padding, font i osnovne boje pozadine i teksta.

## Gumb za povratak
```css
.owner-dashboard .return-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 15px;
}
.owner-dashboard .return-btn:hover {
  background: #0056b3;
}
```
* Plavi gumb za navigaciju natrag.
* Hover efekt tamnije plave boje.

## Naslovi
```css
.owner-dashboard h1,
.owner-dashboard h2 {
  color: #004080;
}
```

* H1 i H2 naslovima dodana tamnoplava boja.

## Sekcije statistike i rezervacija

```css
.owner-dashboard .statistics,
.owner-dashboard .reservations {
  background: #ffffff;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0,0,0,0.1);
}
```

* Bijele kartice sa zaobljenim rubovima i blagom sjenom.
* Unutarnji padding i razmak između sekcija.

## Chartovi
```css
.owner-dashboard .charts {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.owner-dashboard .chart-container {
  flex: 1;
  min-width: 250px;
  max-width: 500px;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
```

* Flex layout za chartove s razmakom između.
* Svaki chart u kartici s paddingom, sjenom i zaobljenim rubovima.

## Tablica rezervacija (desktop)
```css
.owner-dashboard .reservation-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}
.owner-dashboard .reservation-table th,
.owner-dashboard .reservation-table td {
  padding: 12px;
  border-bottom: 1px solid #ddd;
  text-align: left;
}
.owner-dashboard .reservation-table th {
  background-color: #cce6ff;
  color: #004080;
}
.owner-dashboard .reservation-table tr:nth-child(even) {
  background: #f2f2f2;
}
```

* Standardna tablica s obrubom između redova.
* Header plave boje s bijelim tekstom.
* Svaki drugi red ima svijetlosivu pozadinu.

## Kartice rezervacija (mobile)
```css
.owner-dashboard .reservation-cards {
  display: none;
}
.owner-dashboard .reservation-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 15px;
  margin-bottom: 15px;
}
.owner-dashboard .card-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}
```

* Karte rezervacija prikazane samo na mobilnim uređajima.
* Sličan styling kao bijele kartice sekcija.
* Dugmad unutar kartica centrirana i s razmakom.

## Opći stil za dugmad
```css
.owner-dashboard button {
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.owner-dashboard .confirm-btn {
  background: #4caf50;
  color: white;
  margin-right: 5px;
}
.owner-dashboard .reject-btn {
  background: #f44336;
  color: white;
}
```

* Standardiziran padding, border-radius i cursor.
* confirm-btn zelen, reject-btn crven.

## Dugmad za export
```css
.owner-dashboard .export-buttons {
  margin-top: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.owner-dashboard .export-buttons button {
  background: #4a6fa5;
  color: white;
}
.owner-dashboard .export-buttons button:hover {
  background: #385d8a;
}
```

* Flex layout s razmakom između gumbi za eksport PDF/XLSX.
* Plava boja s hover efektom.

## Popup overlay
```css
.owner-dashboard .popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}
.owner-dashboard .popup {
  background: white;
  padding: 20px 30px;
  border-radius: 10px;
  text-align: center;
}
.owner-dashboard .popup-buttons {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  gap: 15px;
}
```

* Fullscreen overlay za popup.
* Popup centralno pozicioniran, s paddingom, bijelom pozadinom i zaobljenim rubovima.
* Dugmad centrirana s razmakom.

## Responsivnost

```css
@media (max-width: 768px) {
  .owner-dashboard .reservation-table {
    display: none;
  }
  .owner-dashboard .reservation-cards {
    display: block;
  }
}
```

* Na tabletima i manjim uređajima tablica nestaje, kartice se prikazuju.

### Mobilni layout
```css
@media (max-width: 480px) {
  .owner-dashboard .charts {
    flex-direction: column;
    gap: 15px;
  }
  .owner-dashboard .chart-container {
    max-width: 100%;
  }
  .owner-dashboard .export-buttons {
    flex-direction: column;
    gap: 10px;
  }
  .owner-dashboard .popup-buttons {
    flex-direction: column;
  }
}
```

* Na vrlo malim ekranima chartovi, export dugmad i popup dugmad se slažu vertikalno.
* Maksimalna širina chartova 100%.

Dio koda te CSS kod u ovom repozitoriju je unaprijeđen s pomoću alata ChatGPT (OpenAI) te Deepseek AI.
Većina stranica je generirana putem umjetne inteligencije te kasnije nadograđena. 
Razlog korištenja umjetne inteligencije je lakši razvoj sučelja za unos te prikaz podataka po našim željenim parametrima te povezani CSS stil. Cijele razgovore možete pronaći na poveznicama:
* https://chat.deepseek.com/share/80m7j40ozlghwa73a5
* https://chat.deepseek.com/share/cwctmnpt9wkgyaqkbf
* https://chat.deepseek.com/share/8ryo5sd96q2ou6bu5s
* https://chatgpt.com/share/693037fe-a7a4-800a-9db7-3ddf30826c6f
* https://chatgpt.com/share/69303814-a6b4-800a-968e-c02618a7767c
* https://chatgpt.com/share/69303822-46b8-800a-ab49-a30ab24edf87
* https://chat.deepseek.com/share/hrj63k72zlnck8sed4
AI mi je stvorio osnovne stranice sa povezanim CSS-ovima koja je kasnije ručno nadograđena.
**Alat:** ChatGPT (OpenAI)  te Deepseek AI
**Datum dokumentiranja:** 2025-12-8
**Svrha:** Izrada osnovnih sučelja radi potrebe nadogranje i jednostavnosti te prikladnih CSS stilova za stranice.
