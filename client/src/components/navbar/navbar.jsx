import "./navbar.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { googleLogout, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();

  // Učitavanje usera iz localStorage-a
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("googleUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Logout handler
  const logout = () => {
    googleLogout();
    setUser(null);
    localStorage.removeItem("googleUser");
  };

  // Navigacija na početnu
  const navigatelandingscreen = () => navigate("/");

  return (
    <div className="navbar">
      <div className="navContainer">
        <span className="logo" onClick={navigatelandingscreen}>
          Room-Rently
        </span>

        <div className="navItems">
          {!user ? (
            // Custom Google Login gumb
            <div className="custom-google-login">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  try {
                    const idToken = credentialResponse.credential; // JWT ID token
                    if (!idToken) {
                      console.error("No ID token received from Google");
                      return;
                    }

                    // Pošalji ID token backendu
                    try {
                      await axios.post(
                        "http://localhost:8080/addPerson",
                        {},
                        {
                          headers: {
                            Authorization: `Bearer ${idToken}`,
                          },
                        }
                      );
                      console.log("User successfully added to DB");
                    } catch (error) {
                      if (error.response && error.response.status === 409) {
                        console.warn("User already exists in database");
                      } else {
                        console.error("Error adding user to DB:", error);
                      }
                      // U svakom slučaju nastavi s loginom
                    }

                    // Dekodiraj token da dobiješ ime i email
                    const decoded = jwtDecode(idToken);
                    console.log("Decoded user:", decoded);

                    // Spremi korisnika lokalno
                    setUser(decoded);
                    localStorage.setItem("googleUser", JSON.stringify(decoded));
                  } catch (err) {
                    console.error("Error processing Google login:", err);
                  }
                }}
                onError={() => {
                  console.log("Login Failed");
                }}
                useOneTap
                theme="filled_blue"
                shape="rectangular"
                text="signin_with"
                size="medium"
                width="200"
                locale="en"
              />
            </div>
          ) : (
            <>
              <img
                src={user.picture}
                alt="profile"
                style={{
                  width: "35px",
                  height: "35px",
                  borderRadius: "50%",
                  marginRight: "10px",
                }}
                referrerPolicy="no-referrer"
              />
              <span>{user.name}</span>
              <button className="navButton" onClick={logout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;