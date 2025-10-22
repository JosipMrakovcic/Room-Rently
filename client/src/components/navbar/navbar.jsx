import "./navbar.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useGoogleLogin, googleLogout } from "@react-oauth/google";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();

  //LOadanje usera iz local storeagea
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("googleUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  //loginanje handler
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });

        setUser(res.data);
        localStorage.setItem("googleUser", JSON.stringify(res.data)); //spremanje podataka u localstorage
        console.log("User info:", res.data);

        await axios.post("http://localhost:8080/user", res.data); //slanje podataka prema backendu

      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    },
    onError: (error) => console.log("Login Failed:", error),
  });

  //logoutanje handler
  const logout = () => {
    googleLogout();
    setUser(null);
    localStorage.removeItem("googleUser");
  };

  const navigatelandingscreen = () => navigate("/");

  return (
    <div className="navbar">
      <div className="navContainer">
        <span className="logo" onClick={navigatelandingscreen}>
          Room-Rently
        </span>

        <div className="navItems">
          {!user ? (
            <button className="navButton" onClick={() => login()}>
              Login with Google
            </button>
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
