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

  // Provjera tokena pri svakom učitavanju za maksimalnu sigurnost
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
        } catch (err) {
          console.error("Session expired or invalid");
          logout(); 
        }
      }
    };
    verifyUser();
  }, []);

  const logout = () => {
    googleLogout();
    setUser(null);
    localStorage.removeItem("googleUser");
    localStorage.removeItem("access_token");
    // Maknuto navigate("/") kako bi ostali na istoj stranici
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
                    
                    window.location.reload(); 
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

              {/* Admin vidi samo Admin Panel */}
              {user.is_admin && (
                <button className="navButton adminBtn" onClick={() => navigate("/admin")}>
                  Admin Panel
                </button>
              )}

              {/* Owner vidi samo Dashboard */}
              {user.is_owner && (
                <button className="navButton" onClick={() => navigate("/owner-dashboard")}>
                  Dashboard
                </button>
              )}

              {/* Samo obični korisnici (koji nisu admin/owner) vide Booked Reservations */}
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
    </div>
  );
};

export default Navbar;