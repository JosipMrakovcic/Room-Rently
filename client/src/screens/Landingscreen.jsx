import React from 'react'
import './Landingscreen.css';
import { useNavigate } from "react-router-dom";
function LandingScreen() {
  const navigate = useNavigate()
    const navigatemain=()=>{
        navigate("/main")
    }
  return (
    <div className='row landing'>
        <div className='col-md-12'>
            <h2>Room-Rently</h2>
            <h1>"Find your perfect stay from cozy rooms to modern apartments.
            Simple search and effortless booking with Room-Rently."</h1>
            
            <button onClick={navigatemain}>Find a Place to Stay</button>
            

        </div>
    
    
    
    </div>
  )
}

export default LandingScreen
