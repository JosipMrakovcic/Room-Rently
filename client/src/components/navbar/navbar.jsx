import "./navbar.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { googleLogout, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

// Definiramo podatke izvan komponente da ne stvaramo objekt pri svakom renderu
const countriesData = {
  Croatia: ["Zagreb", "Split", "Rijeka", "Osijek", "Zadar", "Other"],
  Germany: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Other"],
  Austria: ["Vienna", "Salzburg", "Graz", "Innsbruck", "Other"],
  Slovenia: ["Ljubljana", "Maribor", "Koper", "Other"],
  Italy: ["Rome", "Milan", "Naples", "Turin", "Other"],
  Hungary: ["Budapest", "Debrecen", "Szeged", "Miskolc", "Other"],
  Serbia: ["Belgrade", "Novi Sad", "Niš", "Kragujevac", "Other"],
  BiH: ["Sarajevo", "Banja Luka", "Zenica","Tuzla", "Other"],
  Montenegro : ["Podgorica", "Nikšić", "Herceg Novi", "Pljevlja", "Other"],
};

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("googleUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // --- STATE ZA LOKACIJU ---
  const [showCountryModal, setShowCountryModal] = useState(false);
  
  // Odabrane vrijednosti iz dropdowna
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  // Vrijednosti za ručni unos (ako je odabrano "Other")
  const [customCountry, setCustomCountry] = useState("");
  const [customCity, setCustomCity] = useState("");

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

          // Ako u bazi nema države ILI grada, prikaži modal
          if (!verifiedUser.country || !verifiedUser.city) {
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

  // Resetiraj grad ako korisnik promijeni državu
  useEffect(() => {
    setSelectedCity("");
    setCustomCity("");
  }, [selectedCountry]);

  const handleSaveLocation = async () => {
    // Logika: Koju vrijednost šaljemo?
    // Ako je država "Other", šaljemo customCountry. Inače selectedCountry.
    const finalCountry = selectedCountry === "Other" ? customCountry : selectedCountry;
    
    // Ako je država "Other" ILI grad "Other", šaljemo customCity. Inače selectedCity.
    const finalCity = (selectedCountry === "Other" || selectedCity === "Other") ? customCity : selectedCity;

    if (!finalCountry || !finalCity) {
        alert("Please fill in all fields.");
        return;
    }

    try {
      const token = localStorage.getItem("access_token");
      await axios.put(
        `${process.env.REACT_APP_API_URL}/updateCountry`, // Endpoint se i dalje zove isto (ili promijeni u controlleru)
        { country: finalCountry, city: finalCity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = { ...user, country: finalCountry, city: finalCity };
      setUser(updatedUser);
      localStorage.setItem("googleUser", JSON.stringify(updatedUser));
      setShowCountryModal(false);
      window.location.reload();
    } catch (err) {
      console.error("Error updating location", err);
      alert("Error while saving location.");
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

                    // Provjera kod logina: fali li country ili city?
                    if (!userFromDB.country || !userFromDB.city) {
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

      {/* --- MODAL ZA ODABIR LOKACIJE --- */}
      {showCountryModal && (
        <div className="country-modal-overlay">
          <div className="country-modal">
            <h3>Welcome! 👋</h3>
            <p>Please complete your profile to continue:</p>
            
            {/* 1. Odabir države */}
            <label>Country:</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="country-select"
            >
              <option value="">-- Select Country --</option>
              {Object.keys(countriesData).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="Other">Other</option>
            </select>

            {/* Ako je odabrano 'Other' za državu, prikaži input za ručni unos */}
            {selectedCountry === "Other" && (
                <input 
                    type="text" 
                    placeholder="Type your country..." 
                    value={customCountry}
                    onChange={(e) => setCustomCountry(e.target.value)}
                    className="custom-input"
                    //style={{marginTop: "10px", width: "100%", padding: "8px"}}
                />
            )}

            {/* 2. Odabir grada (prikazuje se samo ako je država odabrana i nije Other) */}
            {selectedCountry && selectedCountry !== "Other" && (
                <>
                <label id="city">City:</label>
                <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="country-select"
                >
                    <option value="">-- Select City --</option>
                    {countriesData[selectedCountry]?.map((city) => (
                    <option key={city} value={city}>
                        {city}
                    </option>
                    ))}
                </select>
                </>
            )}

            {/* Prikaz inputa za grad ako je:
                a) Država "Other" (tada uvijek ručno pišemo grad)
                b) Država odabrana, ali je grad "Other" 
            */}
            {(selectedCountry === "Other" || selectedCity === "Other") && (
                 <input 
                 type="text" 
                 placeholder="Type your city..." 
                 value={customCity}
                 onChange={(e) => setCustomCity(e.target.value)}
                 className="custom-input"
                 //style={{marginTop: "10px", width: "100%", padding: "8px"}}
             />
            )}

            <button
              onClick={handleSaveLocation}
              // Disable ako bilo što fali
              disabled={
                // Ako je država standardna, mora biti odabran grad (ili upisan ako je Other)
                (selectedCountry !== "Other" && !selectedCity) ||
                (selectedCountry !== "Other" && selectedCity === "Other" && !customCity) ||
                // Ako je država Other, moraju biti upisani i država i grad
                (selectedCountry === "Other" && (!customCountry || !customCity))
              }
              className="save-country-btn"
              style={{marginTop: "20px"}}
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;