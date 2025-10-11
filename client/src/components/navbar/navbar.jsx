import "./navbar.css";
import { useNavigate } from "react-router-dom";
const Navbar= ()=>{
    const navigate = useNavigate()
    const navigatelandingscreen=()=>{
        navigate("/")
    }
    return(
        <div className="navbar">
            <div className="navContainer">
            <span className="logo" onClick={navigatelandingscreen}>Hotel-Rently</span>
            <div className="navItems">
                <button className="navButton">Register</button>
                <button className="navButton">Login</button>
            </div>
            </div>
        </div>
    )
}
export default Navbar