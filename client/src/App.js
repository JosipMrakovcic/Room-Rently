import "./App.css";
import LandingScreen from "./screens/Landingscreen";
import ApartmentForm from "./pages/form/form";
import RentalUnits from "./pages/administration/RentalUnits";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import List from "./pages/list/List";
import Hotel from "./pages/hotel/Hotel";
import { GoogleOAuthProvider } from "@react-oauth/google";
import UserReservations from "./components/userreservations/userreservations";
import OwnerDashboard from "./components/ownerdashboard/OwnerDashboard";

import { useEffect } from 'react';

function App() {

  return (
    /* 1. GoogleOAuthProvider: Omogućuje Google prijavu u cijeloj aplikaciji. 
      clientId se dobiva s Google Cloud Console.
    */
    <GoogleOAuthProvider clientId="939982947137-jkggl2itogjo9neanp87ika3vnnva7a4.apps.googleusercontent.com">
      {/* 2. BrowserRouter: Omogućuje navigaciju bez osvježavanja stranice (SPA) */}
      <BrowserRouter>
      {/* 3. Routes: Kontejner koji odlučuje koja će se komponenta prikazati ovisno o URL-u */}
        <Routes>
          {/* JAVNE RUTE (Dostupne svim korisnicima) */}
          <Route path="/" element={<LandingScreen />} />
          <Route path="/main" element={<Home />} />
          <Route path="/hotels" element={<List />} />
          <Route path="/hotels/:id" element={<Hotel />} />
          {/* ADMINISTRATIVNE RUTE (Za unos i uređivanje smještaja) */}
          <Route path="/form" element={<ApartmentForm />} />
          <Route path="/form/:id" element={<ApartmentForm />} /> 
          <Route path="/admin" element={<RentalUnits />} />
          {/* KORISNIČKE I VLASNIČKE RUTE */}
          <Route path="/booked-reservations" element={<UserReservations />} />
          <Route path="/owner-dashboard" element={<OwnerDashboard />} />
          
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
