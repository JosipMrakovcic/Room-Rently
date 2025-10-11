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
            <h2>Hotel-Rently</h2>
            <h1>"TESTMERGE"</h1>
            
            <button onClick={navigatemain}>Get brawl</button>
            

        </div>
    
    
    
    </div>
  )
}

export default LandingScreen
