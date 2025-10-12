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
U njima sam napravio odgovarajuće .jsx i .css datoteke. Pa sam tako za home napravio Home.jsx i home.css te isto i za druge mape.
Pomoću automatske nadopune koda, samim upisom "rafce" u Home.jsx dobio sam slijedeći predložak koda:
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
te naslove Hotels i Apartments koji zasad nemaju ikone, ali se mogu dodati umjesto komentara "ikona" ako bude potrebno. Također, hotele sam označio kao trenutno aktivne i container kao listmode te sam im prema tome dodao CSS stil.
```
const Header= ()=>{
   return(
      <div className="header">
         <div className="headerContainer listmode">
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
}
.headerContainer.listmode{
     margin: 20px 0px 0px 0px;
}
```
Širina je napravljena na isti način kao i kod navigacijske trake, a text je poravnat u sredinu te container ima doljnju marginu 5 piksela te container koji je ujedno i listmode ima gornju marginu 20 piksela.
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
   height: 30px;
   background-color: white;
   border: 3px solid #febb02;
   display: flex;
   align-items: center;
   justify-content:space-around;
   padding: 10px 0px;
   border-radius: 5px ;
   position: absolute;
   bottom: -30px; 
   width: 100%;
   max-width: 1024px;
}
```
Elementi tražilice imaju razmak oko sebe. Tražilica ima žuti rub koji je mrvicu zakrivljen te je tražilica pomaknuta 30 piksela na dolje u odnosu na zaglavlje i ima širinu istu kao i zaglavlje.
```
.headerSearchInput{
    border: none;
    outline: none;
}
.headerSearchText{
    color: darkslategrey;
    cursor: pointer;
}
```
Polje za unos željenog odredišta više nema obrub te je definirana boja fiksnog teksta i dodan pokazivač pri prelasku mišem preko njih.
### Prikaz datuma te kalendara
S npmjs.com stranice uzet je paket react-date-range:
> **NAPISATI KAKO SE SKINUO PAKET**
te kod s malim preinakama iz state u date te s dodatkom DateRange importa:
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

> **OPISATI ŠTO NIJE RADILO I PREPRAVITI AKO KRIVO PIŠEM INSTALACIJU**

Nakon toga da bi sve radilo, bilo je potrebno preko terminala instalirati biblioteku date-fns za formatiranje datuma pomoću naredbe:
```
   npm i date-fns
```
te ju uvesti u kod pomoću importova:
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
.date{
    position: absolute;
    top :50px;
    left: 210px; 
    z-index: 2;
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
.options{
   z-index: 2;
   padding: 10px;
   position: absolute;
   top: 50px;
   background-color:white;
   color:gray;
   border: 3px solid rgb(255, 174, 0);
   border-radius: 5px;
}
.optionitem{
   width: 200px;
   display: flex;
   justify-content: space-between;
}
.optioncounter{
   display: flex;
   align-items: center;
   gap: 10px;
   font-size: 12px;
   color: black;

}
.optioncounterbutton{
   width: 30px;
   height: 30px;
   border: 1px solid lightskyblue;
   color: #00c6ff;
   cursor: pointer;
   background-color: white;
}
.optioncounterbutton:disabled{
   cursor: not-allowed;
}
```
Opcije će biti ispred ostatka stranice zbog z-komponente, isto kao i kalendar pomaknute prema dolje s sivim tekstom, bijelom pozadinom te žutim obrubom. Svaki item, odnosno npr. biranje broja odraslih osoba poredan je u jedan red širine 200 piksela s time da postoji razmak između spanova(npr. Adult) te gumbova i prikaza odgovarajućih brojeva koji su zajedno u jednom div elementu. Njihov jednostavan prikaz određen je ```.optioncounter{}``` CSS-om. Gumbovi imaju određenu visinu, širinu, obrub te pointer za prelazak s mišem. Ako su gumbi disabled onda će miš pokazivati precrtanu crvenu kružnicu kao znak zabrane.