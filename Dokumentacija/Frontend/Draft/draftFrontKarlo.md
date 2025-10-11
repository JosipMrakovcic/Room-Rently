# POČETAK PROJEKTA(INSTALACIJE)

Prvo imamo problem kako započeti projekt.
   !!!Napisati kako se instalira možda taj početni projekt
   
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

!!!Objasniti landing screen (.jsx i .css)

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
U Home.jsx sam umjesto same riječi Home stavio **```<Navbar></Navbar>```** koja sad pokazuje komponentu navigacijse trake te je bilo potrebno prenijeti tu navigacijsku traku iz komponenti pomoću putanje naredbom: 
```
   import Navbar from "../../components/navbar/navbar";
``` 

U Navbar.jsx pod return dodao sam samu strukturu navigacijske trake koja nalikuje na HTML kod s time da se imena klasa označavaju s **```className="imeKlase"```**:
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
**```.navbar{}```** određuje gdje će se nalaziti navContainer te koliko će velik biti navbar, koje boje, na kojoj poziciji u odnosu na vrh stranice te pozicijom sticky ostavljamo navigacijsku traku uvijek na vrhu bez obzira pomičemo li se prema dnu stranice. Tu nam još pomaže z-index koji nam govori da navigacijska traka mora biti ispred drugih elemenata jer ima veći z-index. Veličina navContainera je 100% širine stranice, no ograničena je na maksimalnu širinu od 1100 piksela. Boja slova je bijela te su elementi containera pozicionirani tako da između imaju prazan prostor. Dakle naziv stranice je na krajnje lijevoj poziciji te su gumbi na krajnje desnoj poziciji s time da postoji i razmak lijevo i desno od 20 piksela od granica containera i njegovog sadržaja.