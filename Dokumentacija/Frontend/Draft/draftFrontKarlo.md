# POČETAK PROJEKTA(INSTALACIJE)

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
   
# POČETNA STRANICA

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
1. Pozadina i osnovni layout

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

2. Efekt lebdećeg svjetla u pozadini postignut je ovim CSS-om
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
3. Tekstualni elementi
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

Animacije:
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
Objašnjenje animacije:
```from``` je početak animacije te nakon toga
```opacity: 0``` znači da je element potpuno nevidljiv.
```transform: translateY(-30px)``` nam zatim govori da je pomaknut 30px prema gore izvan svoje normalne pozicije.
```to``` označava kraj animacije:
```opacity: 1``` odnosno element postaje potpuno vidljiv te se pomoću
```transform: translateY(0)``` vraća se svoju početnu poziciju.
Dakle, postepeno element ide prema dolje(ili gore u slučaju fadeInUp) i postaje vidljiv.
4. Gumb (“Get brawl”)
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

5. Responzivnost
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

# DODAVANJE OSTALIH STRANICA I NJIHOVIH RUTA

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

# DODAVANJE NAVIGACIJSKE TRAKE

U src mapu dodao sam mapu components te u njoj mapu navbar s odgovarajućim .jsx i .css datotekama te napravio isti template kao i za rute u mapi pages.
U Home.jsx sam umjesto same riječi Home stavio ```<Navbar></Navbar>``` koja sad pokazuje komponentu navigacijse trake te je bilo potrebno prenijeti tu navigacijsku traku iz komponenti pomoću putanje naredbom: 
```
   import Navbar from "../../components/navbar/navbar";
``` 

U Navbar.jsx pod return dodao sam samu strukturu navigacijske trake koja nalikuje na HTML kod s time da se imena klasa označavaju s ```className="imeKlase"```:
```
   <div className="navbar">
      <div className="navContainer">
         <span className="logo">Hotel-Rently</span>
         <div className="navItems">
            <button className="navButton">Register</button>
            <button className="navButton">Login</button>
         </div>
      </div>
   </div>
```
dakle dodan je blok element div za navigacijsku traku, container koji zaokružuje sve elemente navigacijske trake, liniski element span koji prikazuje ime stranice, te div koji sadrži gumbe na registraciju i prijavu.

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