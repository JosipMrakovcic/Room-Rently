import './App.css';
import LandingScreen from './screens/Landingscreen';
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import Home from './pages/home/Home';
import List from './pages/list/List';
import Hotel from './pages/hotel/Hotel';
import { GoogleOAuthProvider } from '@react-oauth/google';


import { useEffect } from 'react';

function App() {

  return (
    <GoogleOAuthProvider clientId="163730135993-4a4kfcsq2qvjgqrn5iiosgj3r5ovh25r.apps.googleusercontent.com">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingScreen />} />
          <Route path="/main" element={<Home />} />
          <Route path="/hotels" element={<List />} />
          <Route path="/hotels/:id" element={<Hotel />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
