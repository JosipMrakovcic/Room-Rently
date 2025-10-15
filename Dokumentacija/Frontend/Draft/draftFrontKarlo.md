# Početak projekta(instalacije)

Prvo imamo problem kako započeti projekt.
   Potrebno je bilo kreirati mapu u kojoj će biti sadržan naš projekt. Pozicionirani u nju potrebno je u terminalu upisati naredbu:
   ```
   npx create-react-app client
   ```
   gdje client predstavlja ime naše aplikacije.
   Potrebno je pozicionirati se u navedenu mapu client naredbom u terminalu: 
   ```
   cd client
   ```
   te kako bi pokrenuli našu aplikaciju glavna naredba za to jest:
   ```
   npm start
   ```
   tu naredbu je potrebno učestalo koristiti tijekom debugganja kako bi vidjeli našu aplikaciju.
   Ako skidamo ovaj projekt, potrebno je prije naredbe ``` npm start ``` upisati naredbu:
   ```
   npm install
   ```
   Po defaultu naša aplikacija bi trebala biti vidljiva na adresi http://localhost:3000/ ali u terminalu će također biti ispisana adresa za korištenje. Nakon toga potrebno je unesti adresu u bilo koji lokalni browser primjerice Google Chrome.
   Po defaultu dobili smo automatsku instaliranu React frontend stranicu koja ima logo i opis, ali služi isključivo za primjer. Većinu toga je bilo potrebno pobrisati iz predefiniranih template datoteka kako bi mogli napredovati sa svojim idejama.
   Pobrisao sam default HTML-ove iz App.js te testirao tako da napravim par h1 tagova u HTML-u unutar App.js te saveo file nakon čega mi se pojavio h1 tag na Google Chrome-u na lokalnoj stranici.
   ```
   <h1>Test</h1>
   ```
   
# Početna stranica

Nakon instalacije svega potrebnoga za početak projekta, trebalo je napraviti početnu stranicu.

Instalirao sam react-router-dom pomoću naredbe:
```
   npm i react-router-dom
```

te sam zatim u App.js implementirao kod:

```
   import LandingScreen from './screens/Landingscreen';

   import{
      BrowserRouter,
      Routes,
      Route
   } from "react-router-dom";

   function App(){
      return(

         <BrowserRouter>
            <Routes>
               <Route path="/" element={<LandingScreen></LandingScreen>}></Route>
            </Routes>
         </BrowserRouter>
      )
   }

   export default App;
```

koji omogućava da na ruti http://localhost:3000/ imamo početni zaslon(LandingScreen).

Zatim sam u mapi src stvorio novu mapu screens u kojoj sam napravio datoteke LandingScreen.jsx i LandingScreen.css koje će definirati izgled početne stranice.

# Landing Screen — React + CSS Animacija
## Cilj

Ova komponenta predstavlja početni (landing) ekran aplikacije “Hotel-Rently”.
Korisniku prikazuje naslov, podnaslov i gumb koji vodi na glavnu stranicu (/main).

## React komponenta: LandingScreen.jsx
```
import React from 'react';
import './Landingscreen.css';
import { useNavigate } from "react-router-dom";

function LandingScreen() {
  const navigate = useNavigate();

  const navigatemain = () => {
    navigate("/main");
  };

  return (
    <div className='row landing'>
      <div className='col-md-12'>
        <h2>Hotel-Rently</h2>
        <h1>"TESTMERGE"</h1>
        <button onClick={navigatemain}>Get brawl</button>
      </div>
    </div>
  );
}

export default LandingScreen;
```
Dakle, ```useNavigate()``` je hook iz React Routera koji omogućava navigaciju između ruta bez reloadanja stranice.
```navigate("/main")``` preusmjerava korisnika na rutu /main.
JSX struktura koristi Bootstrap klase (row, col-md-12) za osnovni layout, i custom klasu .landing za stiliziranje pozadine. Klasa ```row``` označava red, a ```col-md-12``` znači da stupac zauzima cijelu širinu(12/12) na ekranima srednje veličine i većim ekranima.
Sve animacije i izgled definirani su u Landingscreen.css-u.

## CSS stilovi: Landingscreen.css
### Pozadina i osnovni layout

```
.landing {
  height: 100vh; /* Puni ekran po visini */
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #2b5876, #4e4376);
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;
  animation: fadeIn 1.5s ease-in-out;
}
```
Kreira fullscreen gradient pozadinu s plavo ljubičastim tonovima.
Koristi se Flexbox za centriranje sadržaja po sredini ekrana te ulaznu animaciju odnosno fadeIn za efekt postepenog pojavljivanja.

### Efekt lebdećeg svjetla u pozadini postignut CSS-om
```
.landing::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: rotateBackground 20s linear infinite;
  z-index: 0;
}
```
Koristi se pseudo element ```::before``` da doda prozirni sloj svjetla te radial-gradient stvara svjetlosni krug koji se polako rotira pomoću:
```
@keyframes rotateBackground {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```
### Tekstualni elementi
```
.landing h2 {
  font-size: 3rem;
  letter-spacing: 2px;
  font-weight: 700;
  margin-bottom: 1rem;
  animation: slideDown 1s ease forwards;
}

.landing h1 {
  font-size: 1.8rem;
  font-weight: 400;
  color: #f8f8f8;
  max-width: 700px;
  margin: 0 auto 2rem auto;
  animation: fadeInUp 1.5s ease forwards;
}
```
h1 ima animaciju fadeInUp, lagano izlazi odozdo te h2 ima animaciju slidedown spuštanja s vrha.

### Animacije
```
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
```
Objašnjenje animacija:
```from``` je početak animacije te nakon toga
```opacity: 0``` znači da je element potpuno nevidljiv.
```transform: translateY(-30px)``` nam zatim govori da je pomaknut 30px prema gore izvan svoje normalne pozicije.
```to``` označava kraj animacije:
```opacity: 1``` odnosno element postaje potpuno vidljiv te se pomoću
```transform: translateY(0)``` vraća se svoju početnu poziciju.
Dakle, postepeno element ide prema dolje(ili gore u slučaju fadeInUp) i postaje vidljiv.
### Gumb (“Get brawl”)
```
.landing button {
  background: linear-gradient(90deg, #ffb347 0%, #ffcc33 100%);
  color: #2b2b2b;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(255, 204, 51, 0.3);
  animation: fadeIn 2s ease forwards;
}

.landing button:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(255, 204, 51, 0.4);
}
```
Koristi gradijentnu pozadinu u žuto-narančastim tonovima te ima zaobljene rubove i sjenu za 3D efekt.
```::hover``` dodaje efekt izbočenja, a fadeIn animacija na gumb se pojavi postepeno s lakoćom(glatko) te ostane na mjestu nakon završetka animacije.

### Responzivnost
 ```
@media (max-width: 768px) {
  .landing h2 {
    font-size: 2.2rem;
  }

  .landing h1 {
    font-size: 1.2rem;
    padding: 0 1rem;
  }

  .landing button {
    font-size: 1rem;
    padding: 0.7rem 1.8rem;
  }
}
```
Automatski prilagođava veličine fontova i padding gumba za manje ekrane.

# Dodavanje ostalih stranica te njihovih ruta

Osim početne stranice potrebno je napraviti i druge stranice koje će nam biti potrebne u daljnjoj izradi projekta.
U mapi src stvorio sam novu mapu pages te u njoj mape home, list i hotel.
U njima sam napravio odgovarajuće .jsx i .css datoteke, pa sam tako za home napravio Home.jsx i home.css te isto i za druge mape.
Pomoću ekstenzije "ES7+ React/Redux/React-Native snippets" za vscode, automatskom nadopunom koda, samim upisom "rafce" u Home.jsx dobio sam slijedeći predložak koda:
```
   import React from 'react'
   const Home= ()=>{
      return(
         <div>
            Home
         </div>
      )
   }
   export default Home
```

koji na stranici prikazuje samo riječ Home.
Zatim sam isto napravio i za List.jsx i Hotel.jsx te sam u App.js dodao rute:
```
   import Home from './pages/home/Home';
   import List from './pages/list/List';
   import Hotel from './pages/hotel/Hotel';
```
te u samu funkciju:
```
   <Route path="/main" element={<Home></Home>}></Route>
   <Route path="/hotels" element={<List/>}></Route>
   <Route path="/hotels/:id" element={<Hotel/>}></Route>
```
kako bi se dodavanjem puteva(path) na adresu http://localhost:3000/ prikazivale sve tri nove stranice.

Pobrisao sam import React from 'react' iz svih datoteka jer nam to nije potrebno te sam umjesto toga povezao sve .jsx datoteke s njihovim odgovarajućim .css datotekama kako bi te stranice dobile nekakav izgled. Primjer koda u Home.jsx:
```   
   import "./home.css"; 
```

# Dodavanje navigacijske trake

U src mapu dodao sam mapu components te u njoj mapu navbar s odgovarajućim .jsx i .css datotekama te napravio isti template kao i za rute u mapi pages.
U Home.jsx sam umjesto same riječi Home stavio ```<Navbar></Navbar>``` koja sad pokazuje komponentu navigacijse trake te je bilo potrebno prenijeti tu navigacijsku traku iz komponenti pomoću putanje naredbom: 
```
   import Navbar from "../../components/navbar/navbar";
``` 

U Navbar.jsx pod return dodao sam samu strukturu navigacijske trake koja nalikuje na HTML kod s time da se imena klasa označavaju s ```className="imeKlase"```:
```
import "./navbar.css";
import { useNavigate } from "react-router-dom";
const Navbar= ()=>{
    const navigate = useNavigate()
    const navigatelandingscreen=()=>{
        navigate("/")
    }
    return(
        <div className="navbar">
            <div className="navContainer">
            <span className="logo" onClick={navigatelandingscreen}>Hotel-Rently</span>
            <div className="navItems">
                <button className="navButton">Register</button>
                <button className="navButton">Login</button>
            </div>
            </div>
        </div>
    )
}
export default Navbar
```
Dakle dodan je blok element div za navigacijsku traku, container koji zaokružuje sve elemente navigacijske trake, liniski element span koji prikazuje ime stranice te div koji sadrži gumbe na registraciju i prijavu. Kao što je već prije objašnjeno, ```useNavigate()``` je hook iz React Routera te se pomoću njega, klikom na naslov stranice, zbog ```onClick={navigatelandingscreen}``` prebacujemo na početnu stranicu.

Izgled navigacijske trake osmišljen je pomoću css-a: 
```
   .navbar {
   height: 60px;
   background: linear-gradient(90deg, #0077ff, #00c6ff);
   display: flex;
   justify-content: center;
   box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
   position: sticky;
   top: 0;
   z-index: 100;
   }

   .navContainer {
   width: 100%;
   max-width: 1100px;
   color: white;
   display: flex;
   align-items: center;
   justify-content: space-between;
   padding: 0 20px;
   }
```
```.navbar{}``` određuje gdje će se nalaziti navContainer te koliko će velik biti navbar, koje boje, na kojoj poziciji u odnosu na vrh stranice te pozicijom sticky ostavljamo navigacijsku traku uvijek na vrhu bez obzira pomičemo li se prema dnu stranice. Tu nam još pomaže z-index koji nam govori da navigacijska traka mora biti ispred drugih elemenata jer ima veći z-index. Veličina navContainera je 100% širine stranice, no ograničena je na maksimalnu širinu od 1100 piksela. Boja slova je bijela te su elementi containera pozicionirani tako da između imaju prazan prostor. Dakle naziv stranice je na krajnje lijevoj poziciji te su gumbi na krajnje desnoj poziciji s time da postoji i razmak lijevo i desno od 20 piksela od granica containera i njegovog sadržaja.

```
.logo {
  font-weight: 600;
  font-size: 1.5rem;
  letter-spacing: 1px;
  cursor: pointer;
  transition: transform 0.3s ease, color 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
  color: #e0f7ff;
}
```
Određena je veličina slova teksta imena stranice te kada pređemo mišem preko njega, strelica se pretvori u oblik pokazivača što nam daje do znanja da se može kliknuti na njega. Također, ```:hover``` definira povećanje teksta te boju naslova prelaskom mišem, dok je u ```.logo{}``` definirano koliko dugo će trebati da se postigne to povećanje.

```
.navItems {
  display: flex;
  align-items: center;
}
.navButton {
  margin-left: 15px;
  border: none;
  padding: 8px 18px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 500;
  color: #0077ff;
  background-color: #ffffff;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

.navButton:hover {
  background-color: #e0f7ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 119, 255, 0.3);
}

.navButton:active {
  transform: scale(0.97);
  box-shadow: 0 2px 6px rgba(0, 119, 255, 0.2);
}
```

```.navItems{}``` određuje kako će gumbovi biti raspoređeni u njihovom containeru, dakle vodoravno te na srednjoj visini. ```.navButton{}``` osmišljen je s istim već objašnjenim funkcionalnostima kao i gumb na početnoj stranici. Određene su boje, razmak, veličina fonta, pokazivač miša te margine i obrub. ```:hover``` definira da će prelaskom mišem gumb otići prema gore, a ```:active``` da će se malo smanjiti klikom na njega.

# Izrada zaglavlja
## Dodavanje mapi te uvezivanje u Home.jsx

Pod mapu components dodao sam mapu header s odgovarajućim .css i .jsx datotekama. Kao svaku komponentu dodao sam Header u Home.jsx pomoću import naredbe:
```
import Header from "../../components/header/Header";
```
te u samu strukturu istim načinom kao i za navbar ```<Header></Header>``` ispod odgovarajuće implementacije navbar-a.
## Kartice Hotels i Apartments
Uveo sam CSS u Header.jsx kao i prije naredbom:
```
import "./header.css";
```
te naslove Hotels i Apartments koji zasad nemaju ikone, ali se mogu dodati umjesto komentara "ikona" ako bude potrebno. Također, hotele sam označio kao trenutno aktivne te sam im prema tome dodao CSS stil.
```
const Header= ()=>{
   return(
      <div className="header">
         <div className="headerContainer">
            <div className="headerList">
               <div className="headerListItem active">
                  {/* ikona*/}
                  <span>Hotels</span>
               </div>
               <div className="headerListItem">
                  {/* ikona*/}
                  <span>Apartments</span>
               </div>
            </div>
         </div>
      </div>
   )
}
export default Header
```
Sada imamo problem da zaglavlje ne liči na ništa. Potrebno je pozabaviti se CSS-om.
```
.header {
  background: linear-gradient(135deg, #003580, #004a99);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  position: relative;
}
```
Ovdje je implementirana pozadinska boja te boja teksta. Zatim raspored elemenata je linijski na centru linije. Također definiran je razmak od 40 pixela lijevo i desno od elementa, sjena te relativna pozicija.
```
.headerContainer {
  width: 100%;
  max-width: 1024px;
  text-align: center;
  margin: 0px 0px 5px 0px;
  padding: 0 20px; /*Dodan padding za mobilne uređaje */
  box-sizing: border-box;
}
.headerContainer.listmode {
  margin: 20px 0px 0px 0px;
}
```
Širina je napravljena na isti način kao i kod navigacijske trake, a text je poravnat u sredinu te container ima doljnju marginu od 5 piksela.
```
.headerList {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 80px; /* Bigger spacing since only two items */
}
```
Elementi hotela i apartmana poravnati su u sredinu te su poredani slijedno po liniji s razmakom od 80 piksela.
```
.headerListItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.3s ease, color 0.3s ease;
}
.headerListItem i {
  font-size: 2.5rem; /* Bigger icon size */
  margin-bottom: 50px;
}

.headerListItem span {
  font-size: 1.3rem;
  font-weight: 500;
}

.headerListItem:hover {
  transform: scale(1.1);
  color: #00c6ff;
}
.headerListItem.active {
  padding: 12px 24px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 15px rgba(0, 198, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}
```
Zasada nepostojeća ikona udaljena je od odgovarajućih opisa (Hotels i Apartments) 12 pixela, elementi su poravnati u sredinu te se prelaskom mišem prikazuje pointer. Napravljen je i CSS za ikone kojih trenutno nema te veličina slova i debljina za span elemente Hotels i Apartments. Prelaskom preko njih, boja teksta se mijenja u plavu te se elementi povećavaju 1.1 puta. Hotels koji je active ima svoj padding sa svih strana. Granica mu je kružnog oblika sivo-bijele boje te ima sjenu i zamućena je.

## Naslov, odlomak te gumb
U Header.jsx nakon headerList-a dodan naslov i odlomak te gumb za prijavu ili registraciju:
```
<h1 className="headerTitle">Josipova stranica? Možda ali nema Miku : ( </h1>
<p className="headerDesc">noob u fortu</p>
<button className="headerBTN">Sign in/Register</button>
```
popraćen CSS-om:
```
.headerDesc {
    margin: 20px 0;
    font-size: 1.2rem;          /* Slightly bigger for readability */
    font-weight: 500;
    color: #ffffff;                /* Softer color than black */
    line-height: 1.5;
}

.headerBTN {
    background-color: rgb(14, 95, 245);
    color: white;
    font-weight: 600;           /* Slightly bolder */
    border: none;
    padding: 12px 25px;         /* More spacious padding */
    border-radius: 8px;         /* Rounded corners for a modern look */
    cursor: pointer;
    box-shadow: 0px 4px 6px rgba(0,0,0,0.1); /* Soft shadow for depth */
    transition: all 0.3s ease;  /* Smooth transition on hover */
    margin: 30px;
   max-width: 90%; /* Osigurava da button ne prelazi širinu ekrana */
   box-sizing: border-box;
}

.headerBTN:hover {
    background-color: rgb(10, 70, 200); /* Darker shade on hover */
    transform: translateY(-2px);        /* Slight lift effect */
    box-shadow: 0px 6px 10px rgba(0,0,0,0.15); /* Slightly bigger shadow */
}
```

Odlomak ima svoje gornje i donje margine od 20 piksela te su definirana veličina, debljina i boja fonta kao i visina retka. Gumb je malo svjetlije boje od ostatka zaglavlja te su definirana obilježja fonta. Maknut je obrub, dodan razmak sa svih strana te zakrivljeni oblik granica. Također, implementirane su margine, pokazivač miša te sjena i promjena u malo tamniju boju te pomak prema gore prilikom hover-a.

## Tražilica
### Implementacija kostura te input elementa za odabir odredišta
Nakon što smo implementirali osnovne stavke, imamo problem implementacije tražilice. Dakle, nakon gumba imamo tražilicu:

```
<div className="headerSearch">
   <div className="headerSearchItem">
      {/* ikona*/}
      <input type="text" placeholder="Where are you going?" className="headerSearchInput"></input>
   </div>
   <div className="headerSearchItem">
      {/* ikona*/}
      <span className="headerSearchText">date to date</span>
   </div>
   <div className="headerSearchItem">
      {/* ikona*/}
      <span className="headerSearchText">2 adults 2 children 1 room</span>
   </div>
   <div className="headerSearchItem">
      {/* ikona*/}
      <button className="headerBTN">Search</button>
   </div>
</div>
```
Ona trenutno ima fiksne tekstove no poslije ćemo to promijeniti. Sada je potrebno promijeniti izgled tražilici u CSS-u:
```
.headerSearch{
   height: 50px;
  background-color: white;
  border: 3px solid #febb02;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 10px 0px;
  border-radius: 5px;
  position: absolute;
  bottom: -30px;
  width: 100%;
  max-width: 1024px;
  box-sizing: border-box;
}
```
Elementi tražilice imaju razmak oko sebe. Tražilica ima žuti rub koji je mrvicu zakrivljen te je tražilica pomaknuta 30 piksela na dolje u odnosu na zaglavlje i ima širinu istu kao i zaglavlje.
```
.headerSearchInput{
    border: none;
    outline: none;
    width: 100%;
   padding: 0 10px;
   box-sizing: border-box;
}
.headerSearchText{
    color: darkslategrey;
    cursor: pointer;
    padding: 0 10px;
   white-space: nowrap;
}
```
Polje za unos željenog odredišta više nema obrub te je definirana boja fiksnog teksta i dodan pokazivač pri prelasku mišem preko njih.
### Prikaz datuma te kalendara
Pratio sam youtube [tutorial](https://youtu.be/RkWpJ4XUHuw?si=9tdgdqY7-Q9KxtDY) 
kako bih instalirao react-date-range paket koji sadrži kvalitetno sučelje za odabir raspona datuma koje
će nam koristiti prilikom odabira termina u aplikaciji.
23 minute 46 sekundi je vrijeme u videozapisu kada se objasni instalacija paketa.
Instalacija paketa dobije se naredbom u terminalu :
``` 
npm install react-date-range
```

S ove [stranice](https://hypeserver.github.io/react-date-range/) iz odjeljka "DateRange" preuzeo sam kod koji se prikaže klikom na "VIEW CODE". Kod sam mrvicu promijenio tako što sam umjesto state hooka stavio date hook te sam uveo DateRange:
```
import { useState } from "react";
import {DateRange} from 'react-date-range';
const [date, setDate] = useState([
  {
    startDate: new Date(),
    endDate: null,
    key: 'selection'
  }
]);

<DateRange
   editableDateInputs={true}
   onChange={item => setDate([item.selection])}
   moveRangeOnFirstSelection={false}
   ranges={date}
/>
```
Importovi su normalno gdje i svi importovi na vrhu datoteke, konstantu sam stavio u const Header prije returna, a ```<Daterange.../>``` nakon span elementa "date to date". Ovaj kod služi za kalendar u kojemu se može birati otkad do kad želimo rezervirati sobu.
Nakon toga da bi sve radilo, bilo je potrebno preko terminala instalirati biblioteku date-fns za formatiranje datuma pomoću naredbe:
```
   npm i date-fns
```
No korištenjem naredbe naišao sam na 
problem korištenja react-date-range packagea.
Naime, verzija paketa nije bila kompatibilna te je 
rješenje bilo unesti ove dvije naredbe koje su prepravile problem kompatibilnosti verzija
```
npm uninstall date-fns
npm install date-fns@^3.0.0
```

Biblioteku sam uveo u kod pomoću importova:
```
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import {format} from  'date-fns'; // string format
```
Da bi to lijepo izgledao dodao sam klasu pod ```<DateRange.../>```:
```
   className="date"
```
i u CSS-u:
```
/* Date Picker - Desktop */
.date {
  position: absolute;
  top: 50px;
  left: 210px;
  z-index: 2;
  transform: scale(0.9); /* Smanjen date picker */
  transform-origin: top left;
}
```
Sada se biranje datuma nalazi ispod samog span elementa te ispred pozadine.

Dolazimo do problema dinamičkog prikazivanja datuma. Umjesto ```endDate: null,``` treba nam pravi datum ```endDate: new Date(),```. Statički tekst "date to date" izbacujemo te formatiramo dinamički prikaz datuma:
```
{`${format(date[0].startDate,"dd/MM/yyyy")} to ${format(date[0].endDate,"dd/MM/yyyy")}`}
```
koji su prije odabira jednaki. 
Nedostaje nam skrivanje kalendara. Na početku kalendar treba biti sakriven što znači da moramo dodati hook u const Header:
```
const [opendate,setOpendate] = useState(false)
```
Zatim je potrebna izmjena koda:
```
{opendate && <DateRange
   editableDateInputs={true}
   onChange={item => setDate([item.selection])}
   moveRangeOnFirstSelection={false}
   ranges={date}
   className="date"
/>}
```
Ovo znači da tek kada je opendate istinit, onda se otvara kalendar.
Span elementu prikaza odabranih datuma dodan je event handler:
```
onClick={()=>setOpendate(!opendate)}
```
Dakle, kada kliknemo na span element, ako je kalendar sakriven onda se prikaže i obrnuto.
### Broj osoba i soba
#### Funkcionalnost dinamičkog odabira broja osoba i soba
Sada treba i dinamički odabrati osobe te broj soba. Na početku, izbornik nije otvoren te se pretpostavlja da mora biti odabrana barem jedna odrasla osoba te jedna soba. 
```
const [openOptions, setopenOptions] = useState(false);
const [options, setoptions] = useState({
   adult:1,
   children:0,
   room:1,
})
```
Umjesto fiksnog teksta, potrebno je formatirati dinamički:
```
{`${options.adult} adult - ${options.children} children - ${options.room} room`}
```
te ćemo definirati isto ponašanje za prikazivanje i skrivanje izbornika klikom na span element kao i kod kalendara:
```
onClick={()=>setopenOptions(!openOptions)}
```
Sada napokon moramo dodati izbornik za biranje broja osoba te soba nakon span elementa:
```
{openOptions&&<div className="options">
   <div className="optionitem">
      <span className="optiontext">Adult</span>
      <div className="optioncounter">
      <button disabled={options.adult<=1} className="optioncounterbutton" onClick={()=>{
         handleoption("adult","d")
      }}>-</button>
      <span className="optioncounternumber" >{options.adult}</span>
      <button className="optioncounterbutton" onClick={()=>{
         handleoption("adult","i")
      }}>+</button>
      </div>
   </div>
   <div className="optionitem">
      <span className="optiontext">Children</span>
      <div className="optioncounter">
      <button disabled={options.children<=0} className="optioncounterbutton" onClick={()=>{
         handleoption("children","d")
      }}>-</button>
      <span className="optioncounternumber">{options.children}</span>
      <button className="optioncounterbutton"onClick={()=>{
         handleoption("children","i")
      }}>+</button>
      </div>
   </div>
   <div className="optionitem">
      <span className="optiontext">Room</span>
      <div className="optioncounter" >
      <button disabled={options.room<=1} className="optioncounterbutton" onClick={()=>{
         handleoption("room","d")
      }}>-</button>
      <span className="optioncounternumber">{options.room}</span>
      <button className="optioncounterbutton" onClick={()=>{
         handleoption("room","i")
      }}>+</button>
      </div>
   </div>
</div>}
```
Imamo gumbove koji imaju disabled ponašanje za postavljanje broja manjeg od nužnog(niti jedna odrasla osoba te niti jedna soba te negativan broj djece). Plus i minus gumb imat će definirano ponašanje pomoću funkcije handleoption koju još nismo napravili. 
Logično sada implementiramo funkciju iznad returna od Header-a:
```
   const handleoption =(name,operation)=>{
      setoptions(prev=>{
         return{
            ...prev,[name]: operation==="i" ? options[name]+1:options[name]-1,
         }
      })
   }
```
Kao što smo i u prijašnjem kodu napisali, ta funkcija prima dva parametra, ime onoga što želimo mijenjati te operaciju. Ona zatim kopira prijašnje stanje te ako je operacija "i" odnosno inkrementiranje onda dodaje jedan, a inače oduzima jedan.
#### Izgled izbornika za odabir broja osoba i soba
Još nam preostaje implementirati izgled izbornika za biranje broja osoba te soba.
```
/* Options - Desktop */
.options {
  z-index: 2;
  padding: 8px; /* Smanjen padding */
  position: absolute;
  top: 50px;
  background-color: white;
  color: gray;
  border: 2px solid rgb(255, 174, 0); /* Smanjen border */
  border-radius: 5px;
  transform: scale(0.9); /* Smanjene opcije */
  transform-origin: top left;
}
.optionitem{
   width: 180px; /* Smanjena širina */
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
.optioncounter{
   display: flex;
   align-items: center;
   gap: 8px; /* Smanjen gap */
  font-size: 11px; /* Smanjen font */
   color: black;

}
.optioncounterbutton{
   width: 25px; /* Smanjeni buttoni */
  height: 25px;
  border: 1px solid lightskyblue;
  color: #00c6ff;
  cursor: pointer;
  background-color: white;
  font-size: 0.8rem; /* Smanjen font u buttonima */
}
.optioncounterbutton:disabled{
   cursor: not-allowed;
}
```
Opcije će biti ispred ostatka stranice zbog z-komponente, isto kao i kalendar pomaknute prema dolje s sivim tekstom, bijelom pozadinom te žutim obrubom. Svaki item, odnosno npr. biranje broja odraslih osoba poredan je u jedan red širine 200 piksela s time da postoji razmak između spanova(npr. Adult) te gumbova i prikaza odgovarajućih brojeva koji su zajedno u jednom div elementu. Njihov jednostavan prikaz određen je ```.optioncounter{}``` CSS-om. Gumbovi imaju određenu visinu, širinu, obrub te pointer za prelazak s mišem. Ako su gumbi disabled onda će miš pokazivati precrtanu crvenu kružnicu kao znak zabrane. Komponenta je u potpunosti responzivna i optimizirana za tablete(max-width: 768px), mobitele(max-width: 480px) te vrlo male ekrane(max-width: 360px). Glavne prilagodbe su redukcija fontova i margina.```headerSearch``` prelazi u vertikalni layout, date i options elementi pozicioniraju se kao donji “sheet” na ekranu, a gumb i tekst postaju manji te razmaci proporcionalno kraći.
```/* Responsive Design - Tablet */
@media screen and (max-width: 768px) {
  
  .headerList {
    gap: 40px;
  }
  
  .headerListItem i {
    font-size: 2rem;
    margin-bottom: 30px;
  }
  
  .headerListItem span {
    font-size: 1.1rem;
  }
  
  .headerBTN {
    padding: 10px 8px;
    margin: 0px;
    font-size: 0.9rem;
    max-width: 85%;
  }
  
  .headerSearch {
    height: auto;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
    bottom: -40px;
    position: relative;
     margin: 0 20px 30px 20px;
    width: calc(100% - 40px);
  }
  
  .headerSearchItem {
    width: 100%;
    padding: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .date {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 50%;
    transform: scale(0.6) translateX(-50%);
    transform-origin: bottom center;
  }
  
  .options {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 50%;
    transform: scale(1.1) translateX(-50%);
    transform-origin: bottom center;
    max-height: 50vh;
    overflow-y: auto;
    padding: 10px;
  }
  
  .optionitem {
    width: 160px;
    font-size: 0.9rem;
  }
  
  .optioncounterbutton {
    width: 22px;
    height: 22px;
  }
  .headerContainer h1 {
    font-size: 1.8rem; /* smaller title */
    margin-bottom: 10px;
  }

  .headerDesc {
    font-size: 1rem; /* smaller text */
    padding: 0 15px;
    margin: 15px 0;
  }

  .header {
    padding: 30px 0; /* reduced vertical padding */
  }
}

/* Responsive Design - Mobile */
@media screen and (max-width: 480px) {
  .header {
    padding: 20px 0;
  }
  
  .headerContainer {
    padding: 0 15px;
  }
  
  .headerList {
    gap: 15px;
    flex-wrap: wrap;
    justify-content: space-around;
  }
  
  .headerListItem {
    min-width: 100px;
  }
  
  .headerListItem i {
    font-size: 1.5rem;
    margin-bottom: 15px;
  }
  
  .headerListItem span {
    font-size: 0.8rem;
    text-align: center;
  }
  
  .headerDesc {
    font-size: 0.9rem;
    margin: 15px 10px;
    padding: 0 10px;
  }
  
  .headerBTN {
    padding: 8px 16px;
    margin: 0px;
    font-size: 0.8rem;
    max-width: 80%;
  }
  
  .headerSearch {
    margin: 0 20px 30px 20px;
    width: calc(100% - 30px);
    gap: 10px;
    padding: 10px;
  }
  
  .headerSearchItem {
    padding: 6px;
    font-size: 0.9rem;
  }
  
  .headerSearchInput {
    font-size: 0.9rem;
    padding: 0 8px;
  }
  
  .headerSearchText {
    font-size: 0.9rem;
    padding: 0 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .date {
    transform: scale(0.7) translateX(-50%);
  }
  
  .options {
    transform: scale(1.1) translateX(-50%);
    padding: 8px;
    max-height: 60vh;
  }
  
  .optionitem {
    width: 140px;
    font-size: 0.8rem;
    margin-bottom: 6px;
  }
  
  .optioncounter {
    gap: 6px;
    font-size: 0.7rem;
  }
  
  .optioncounterbutton {
    width: 20px;
    height: 20px;
    font-size: 0.7rem;
  }
   .headerContainer h1 {
    font-size: 1.4rem; /* much smaller title */
    margin-bottom: 8px;
  }

  .headerDesc {
    font-size: 0.85rem;
    line-height: 1.4;
    padding: 0 10px;
    margin: 10px 0;
  }

  .header {
    padding: 20px 0; /* tighter header spacing */
  }
}

/* Extra Small Devices */
@media screen and (max-width: 360px) {
  .headerList {
    gap: 10px;
  }
  
  .headerListItem {
    min-width: 80px;
  }
  
  .headerListItem i {
    font-size: 1.3rem;
    margin-bottom: 10px;
  }
  
  .headerListItem span {
    font-size: 0.7rem;
  }
  
  .headerBTN {
    padding: 6px 12px;
    margin: 10px;
    font-size: 0.75rem;
    max-width: 75%;
  }
  
  .headerSearch {
    margin: 15px 10px 0 10px;
    width: calc(100% - 20px);
  }
}

/* Additional utility for mobile date/options positioning */
.mobile-bottom-sheet {
  position: fixed !important;         /* Fiksira element u odnosu na prozor preglednika */
  bottom: 0 !important;               /* Postavlja ga na dno ekrana */
  left: 0 !important;                 /* Širina se proteže od lijevog do desnog ruba */
  right: 0 !important;
  border-radius: 15px 15px 0 0 !important; /* Zaobljeni gornji rubovi za estetski izgled */
  box-shadow: 0 -5px 20px rgba(0,0,0,0.3) !important; /* Sjena iznad panela za efekt izdizanja */
  max-height: 80vh !important;        /* Panel zauzima maksimalno 80% visine ekrana */
  overflow-y: auto !important;        /* Ako je sadržaj predugačak, omogućava skrolanje */
}
```
```.mobile-bottom-sheet``` klasa služi za pozicioniranje elemenata poput kalendara i options prozora u donji dio ekrana kada se koristi mobilni prikaz.
Cilj joj je simulirati izgled tzv. “bottom sheet” panela, kakvi se često koriste u mobilnim aplikacijama npr. Booking, Google Maps,itd.
U Komentarima za pojedine linije su objašnjeni značaji ali ti isti nisu u kodu.

Dodajmo navbar i header na stranicu /hotels pomoću List.jsx-a:
```
import React from "react";
import "./list.css";
import Navbar from "../../components/navbar/navbar";
import Header from "../../components/header/Header";

const List= ()=>{
   return(
      <div><Navbar></Navbar><Header type ="list"></Header>
      </div>
   )
}
export default List
```
Ovdje smo također dodali prop type ="list" kako bi na ruti /hotels mogli vidjeti samo dio headera. Sada je u Header.jsx potrebno implementirati taj prop. 
```
const Header= ({type})=>{
   /* isti kod kao i prije*/
}
```
Dakle, prenesli smo taj prop te je od h1 tag-a pa do zadnjeg itema potrebno zatvoriti strukturu s {} zagradama te unutar zagrada ```<></>``` prije toga treba napisati da ako tip nije "list" onda će biti vidljiv ostatak headera, a inače su vidljivi samo spanovi Hotels i Apartments zaokruženi s svojim div elementima. Sada kod izgleda ovako:
```
{type !== "list" &&<>
   /*od h1 pa sve do zadnjeg itema*/
</>}
```
Potrebno je još promijeniti da ako je tip "list" onda imamo dvije klase, a inače samo jednu zbog css-a:
```
<div className={type==="list"? "headerContainer listmode":"headerContainer"}>
```
U CSS-u nadodamo kod za gornju marginu, kako bi se Hotels i Apartments prikazivali više dolje u usporedbi sa main stranicom:
```
.headerContainer.listmode{
     margin: 20px 0px 0px 0px;
}
```
Na poslijetku, potrebno je za search dodati onclick event handler koji će prebaciti stranicu na adresu /hotels.
```
<button className="headerBTN" onClick={handleSearch}>Search</button>
```
Sada nam još ostaje napraviti funkciju handleSearch pomoću hooka useNavigate uvezivanjem:
```
import { useNavigate } from "react-router-dom";
```
te dodatkom sljedećeg koda:
```
const [destination,setdestination] = useState("")
const navigate = useNavigate()
const handleSearch=()=>{
   navigate("/hotels",{state:{destination,date,options}})
}
```
na zakomentiranome mjestu(pri vrhu prije returna):
```
const Header= ({type})=>{
   /* ovdje dodati*/
   return()
}
```
Klikom na gumb "Search" mijenja se adresa na /hotels te se šalje odabrano stanje.
Odredište se mijenja pomoću promjene u kodu za input:
```
<input type="text" placeholder="Where are you going?" className="headerSearchInput" onChange={e=>setdestination(e.target.value)}></input>
```
Nakon svake promjene input-a, destination se postavlja na upisanu vrijednost.

# Izrada featured komponente

Do sada smo napravili samo navigacijsku traku te zaglavlje. Potrebno je napraviti još mnogo komponenti koje će popuniti ostatak glavne stranice. U Home.jsx dodat ćemo nakon headera jedan div container:
```
<div className="homecontainer"></div>
```
te je u mapu components potrebno dodati novu komponentu(mapu) featured s odgovarajućim .css i .jsx datotekama. U homecontainer možemo dodati komponentu featured ```<Featured></Featured>``` te uvesti komponentu u Home.jsx naredbom ```import Featured from "../../components/featured/featured";``` i containeru dati CSS stil:
```
.homecontainer{
    margin-top: 50px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 30px;
    padding: 0 10px;
}
```
Sada se homecontainer nalazi 50 piksela ispod headera. Svaki njegov element je centriran, u svome redu s razmakom između svakog reda(elementa containera) od 30 piksela i padding-om s lijeve i desne strane od 10 piksela.

Preostaje nam izraditi komponentu Featured:
```
import "./featured.css";
const Featured= ()=>{
    return(
        <div className="featured">
            <div className="featureditem">
                <img src="/among us.png "alt="Featured" />
                <div className="featuredtitles">
                    <h1>amongus NOOB</h1>
                    <h2>123 propeties</h2>
                </div>
            </div>

            <div className="featureditem">
                <img src="/image.png "alt="Featured" />
                <div className="featuredtitles">
                    <h1>amongus PRO</h1>
                    <h2>123 propeties</h2>
                </div>
            </div>

            <div className="featureditem">
                <img src="/amogus1.png "alt="Featured" />
                <div className="featuredtitles">
                    <h1>amongus HACKER</h1>
                    <h2>123 propeties</h2>
                </div>
            </div>
        </div>
    )
}
export default Featured
```
Radi jednostavnosti, za sada ćemo dodati 3 statična elementa sa svojim slikama te naslovima. One će označavati najpopularnija mjesta te koliko se posjeda tamo iznajmljuje. Ovi elementi trenutno ne pašu na stranici pa je bilo potrebno pozabaviti se s CSS-om:
```
.featured {
  width: 100%;
  max-width: 1024px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 24px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
  z-index: 1;
}
```
Širina je ista kao i kod ostatka komponenti. Ako smo na manjim ekranima, elementi će se prebaciti u novi red po potrebi. Oni imaju razmak između od 24 piksela, padding sa svih strana od 20 piksela, automatske margine s lijeve i desne strane te su u potpunosti zajedno s granicama unutar featured div-a te ispred ostalih komponenti stranice koji imaju z-index manji od 1 odnosno iza kalendara i izbornika za biranje broja osoba i broja soba.
```
.featureditem {
  position: relative;
  flex: 1 1 calc(33.333% - 24px);
  height: 260px;
  color: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.featureditem:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}
```
Svaki element ima relativnu poziciju, visinu od 260 piksela te mu je omogućeno povećanje ako ima mjesta, smanjenje ako nema mjesta te mu je početna širina tećina div-a featured umanjena za 24 piksela zbog razmaka od 24 piksela između elemenata. Tekst je bijele boje te svaki element ima zaobljene rubove i ako su elementi preveliki onda se taj overflow sakrije. Kursor je pokazivač što implicira da se elementi mogu kliknuti. Promjene pozicije i sjene traju 0.3 sekunde, a početna sjena je pomaknuta 4 piksela ispod elementa s zamućenjem radijusa 12 piksela te navedenom bojom sjene. Prelaskom preko elementa mišem, element se pomakne prema gore za 6 piksela te postaje veća i tamnija.
```
.featuredimg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease, filter 0.5s ease;
  filter: brightness(70%);
}

.featureditem:hover .featuredimg {
  transform: scale(1.05);
  filter: brightness(60%);
}

/* Add a subtle overlay gradient for readability */
.featureditem::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent 50%);
}
```
Slike su širine i visine 100% featureditem containera te prekrivaju cijeli okvir s time da je višak odrezan. Prikazane su sa 70% svjetline te su tranzicije glatke u trajanju od 0.5 sekundi. Kada se prelazi mišem preko featureditema, onda se slika unutar njega poveća za 5% te se svjetlina smanji na 60%. Da bi tekst na slici bio čitljiviji, dodan je prazan element preko cijelog featureditem-a koji počinje od dna s 60% neprozirnom crnom te na pola featureditem-a postaje potpuno nevidlj.
```
.featuredtitles {
  position: absolute;
  bottom: 20px;
  left: 20px;
  z-index: 2;
}

.featuredtitles h1 {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 6px;
  color: #fff;
}

.featuredtitles h2 {
  font-size: 16px;
  font-weight: 400;
  color: #f1f1f1;
}

/* Responsive behavior */
@media (max-width: 768px) {
  .featureditem {
    flex: 1 1 calc(50% - 24px);
    height: 220px;
  }
}

@media (max-width: 480px) {
  .featureditem {
    flex: 1 1 100%;
    height: 200px;
  }

  .featuredtitles h1 {
    font-size: 18px;
  }
}
```
Naslovi se nalaze 20 piksela iznad dna featureditem-a te 20 piksela desno od lijeve granice featureditem-a. Također, nalaze se ispred cijele featured komponente. Naslovi imaju određenu veličinu te debljinu i boju, a glavni naslov mjesta ima i donju marginu od 6 piksela. Na manjim ekranima, svaki featureditem će zauzimati pola odnosno cijelu širinu zaslona, pa će tako u istome redu biti dva odnosno jedan item. Osim toga, određena im je i visina te će na zaslonu širine manje od 480 piksela, glavni naslov koji označava mjesto imati veličinu fonta 18 piksela.

# Komponenta propertylist

Na glavnu stranicu(u Home.jsx), nakon featured komponente, dadao sam naslov za propertylist:
```
<h1 className="hometitle">Browse by property type</h1>
```
te u CSS stil:
```
.hometitle{
    width: 100%;
    max-width: 1024px;
    font-size: 20px;
    box-sizing: border-box;
    text-align: center;
}

@media (max-width: 600px){
    .hometitle{
        font-size: 16px;
    }
}
```
kako bi širina odgovarala širini ostalih komponenti te da bi se naslov prikazao na sredini zaslona. Za manje ekrane, smanjena je i veličina fonta.
Sada dodajmo mapu za komponentu propertylist te odgovarajuće .css i .jsx datoteke. Napravimo HTML stukturu istu kao i za featured komponentu:
```
import "./propertylist.css";

const Propertylist= ()=>{
    return(
        <div className="pList">
            <div className="plistItem">
                <img src="20210710_085121.jpg" alt="" className="plistimg" />
                <div className="plisttitle">
                    <h1>Hotels</h1>
                    <h2>69 hotels</h2>
                </div>
            </div>

            <div className="plistItem">
                <img src="20210710_085154.jpg" alt="" className="plistimg" />
                <div className="plisttitle">
                    <h1>Apartments</h1>
                    <h2>21 Apartments</h2>
                </div>
            </div>

            <div className="plistItem">
                <img src="20210710_085438.jpg" alt="" className="plistimg" />
                <div className="plisttitle">
                    <h1>Motels</h1>
                    <h2>67 Motels</h2>
                </div>
            </div>

            <div className="plistItem">
                <img src="20210710_085443.jpg" alt="" className="plistimg" />
                <div className="plisttitle">
                    <h1>Villas</h1>
                    <h2>420 Villas</h2>
                </div>
            </div>

            <div className="plistItem">
                <img src="20210710_084619.jpg" alt="" className="plistimg" />
                <div className="plisttitle">
                    <h1>Rooms</h1>
                    <h2>41 Rooms</h2>
                </div>
            </div>
        </div>
    )
}
export default Propertylist
```
te dodajmo naš propertylist na glavnu stranicu nakon njegovog naslova naredbom ```<Propertylist></Propertylist>```. Sada je potrebno komponenti dati svoj stil:
```
.pList {
  width: 100%;
  max-width: 1024px;
  display: flex;
  flex-wrap: wrap; /* allows wrapping on smaller screens */
  justify-content: space-between;
  gap: 24px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

.plistItem {
  flex: 1 1 calc(33.333% - 24px); /* 3 items per row */
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  background-color: #fff;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.plistItem:hover {
  transform: translateY(-6px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}

.plistimg {
  width: 100%;
  height: 180px;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.plistItem:hover .plistimg {
  transform: scale(1.05);
}
```
Glavni container kao i njegovi elementi(itemi) i slike imaju standardni stil koji smo koristili i kod featured komponente gdje je isti i objašnjen. Razlike u odnosu na njega su to da ovdje nemamo definiranu visinu itema, z-index containera i izmjenu svjetline slika, a imamo definiranu visinu slika od 180 piksela. Ostatak CSS stila:
```
.plisttitle {
  padding: 14px 16px;
  text-align: left;
  background-color: #fff;
}

.plisttitle > h1 {
  font-size: 20px;
  font-weight: 700;
  color: #222;
  margin-bottom: 6px;
}

.plisttitle > h2 {
  font-size: 16px;
  font-weight: 400;
  color: #666;
}

/* Add some responsive behavior */
@media (max-width: 768px) {
  .plistItem {
    flex: 1 1 calc(50% - 24px); /* 2 items per row on tablet */
  }
}

@media (max-width: 480px) {
  .plistItem {
    flex: 1 1 100%; /* full width on small screens */
  }

  .plistimg {
    height: 160px;
  }
}
```
Budući da je visina fiksna, ovdje naslovi neće biti preko nego ispod slike. Naslovi imaju padding sa svih strana, poravnat tekst u lijevo te bijelu pozadinu. Veći naslov ima određen veći i deblji font tamnije boje te je donjom marginom odvojen od manjeg naslova. Za manje ekrane određena su dva elementa liste u svakome redu, a za najmanje ekrane imamo samo jedan element u redu te je visina slike umanjena za 20 piksela.