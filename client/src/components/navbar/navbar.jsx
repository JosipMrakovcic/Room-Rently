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
    localStorage.removeItem("access_token"); 
    window.location.reload();
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
                    const idToken = credentialResponse.credential;
                    if (!idToken) return;

                    try {
                      await axios.post(`${process.env.REACT_APP_API_URL}/addPerson`, {}, {
                        headers: { Authorization: `Bearer ${idToken}` },
                      });
                    } catch (err) {
                      // Ako već postoji user (409), to nije greška
                      if (err.response && err.response.status !== 409) {
                        throw err;
                      }
                    }

                    // Sad uvijek dohvaća podatke
                    const { data: userFromDB } = await axios.get(
                      `${process.env.REACT_APP_API_URL}/me`,
                      { headers: { Authorization: `Bearer ${idToken}` } }
                    );

                    const decoded = jwtDecode(idToken);
                    const finalUser = { ...decoded, ...userFromDB };

                    setUser(finalUser);
                    localStorage.setItem("googleUser", JSON.stringify(finalUser));
                    localStorage.setItem("access_token", idToken);
                    // Refresh da se prikaže admin gumb
                    window.location.reload();

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