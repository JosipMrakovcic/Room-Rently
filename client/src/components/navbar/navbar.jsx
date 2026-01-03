import "./navbar.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { googleLogout, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("googleUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // --- NOVO: State za državu ---
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const countries = ["Croatia", "Germany", "Austria", "Slovenia", "Italy", "Other"];

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const { data: verifiedUser } = await axios.get(
            `${process.env.REACT_APP_API_URL}/me`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          const decoded = jwtDecode(token);
          const finalUser = { ...decoded, ...verifiedUser };
          
          setUser(finalUser);
          localStorage.setItem("googleUser", JSON.stringify(finalUser));

          // PROVJERA: Ako u bazi nema države, prikaži modal
          if (!verifiedUser.country) {
            setShowCountryModal(true);
          }
        } catch (err) {
          console.error("Session expired or invalid");
          logout(); 
        }
      }
    };
    verifyUser();
  }, []);

  // --- NOVO: Funkcija za spremanje države ---
  const handleSaveCountry = async () => {
    if (!selectedCountry) return;
    try {
      const token = localStorage.getItem("access_token");
      await axios.put(
        `${process.env.REACT_APP_API_URL}/updateCountry`,
        { country: selectedCountry },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Osvježi lokalne podatke i zatvori modal
      const updatedUser = { ...user, country: selectedCountry };
      setUser(updatedUser);
      localStorage.setItem("googleUser", JSON.stringify(updatedUser));
      setShowCountryModal(false);
      window.location.reload(); 
    } catch (err) {
      console.error("Error updating country", err);
      alert("Greška pri spremanju države.");
    }
  };

  const logout = () => {
    googleLogout();
    setUser(null);
    localStorage.removeItem("googleUser");
    localStorage.removeItem("access_token");
    window.location.reload(); 
  };

  return (
    <div className="navbar">
      <div className="navContainer">
        <span className="logo" onClick={() => navigate("/")}>
          Room-Rently
        </span>

        <div className="navItems">
          {!user ? (
            <div className="custom-google-login">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  try {
                    const idToken = credentialResponse.credential;
                    if (!idToken) return;

                    try {
                      await axios.post(
                        `${process.env.REACT_APP_API_URL}/addPerson`,
                        {},
                        { headers: { Authorization: `Bearer ${idToken}` } }
                      );
                    } catch (err) {
                      if (err.response?.status !== 409) throw err;
                    }

                    const { data: userFromDB } = await axios.get(
                      `${process.env.REACT_APP_API_URL}/me`,
                      { headers: { Authorization: `Bearer ${idToken}` } }
                    );

                    const decoded = jwtDecode(idToken);
                    const finalUser = { ...decoded, ...userFromDB };

                    setUser(finalUser);
                    localStorage.setItem("googleUser", JSON.stringify(finalUser));
                    localStorage.setItem("access_token", idToken);
                    
                    // Ako je novi korisnik bez države, upali modal odmah nakon login-a
                    if(!userFromDB.country) {
                        setShowCountryModal(true);
                    } else {
                        window.location.reload(); 
                    }
                  } catch (err) {
                    console.error("Login Error:", err.message);
                  }
                }}
                theme="filled_blue"
                shape="pill"
                size="medium"
              />
            </div>
          ) : (
            <div className="navUserActions">
              <img
                src={user.picture}
                alt="profile"
                className="navProfileImg"
                referrerPolicy="no-referrer"
              />
              <span className="userName">{user.name}</span>

              {user.is_admin && (
                <button className="navButton adminBtn" onClick={() => navigate("/admin")}>
                  Admin Panel
                </button>
              )}

              {user.is_owner && (
                <button className="navButton" onClick={() => navigate("/owner-dashboard")}>
                  Dashboard
                </button>
              )}

              {!user.is_admin && !user.is_owner && (
                <button className="navButton" onClick={() => navigate("/booked-reservations")}>
                  Booked Reservations
                </button>
              )}

              <button className="navButton logoutBtn" onClick={logout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- NOVO: Modal za odabir države (prikazuje se samo ako country fali) --- */}
      {showCountryModal && (
        <div className="country-modal-overlay">
          <div className="country-modal">
            <h3>Dobro došli! 👋</h3>
            <p>Molimo odaberite svoju državu kako biste nastavili:</p>
            <select 
              value={selectedCountry} 
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="country-select"
            >
              <option value="">-- Odaberi državu --</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button 
              onClick={handleSaveCountry} 
              disabled={!selectedCountry}
              className="save-country-btn"
            >
              Potvrdi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;