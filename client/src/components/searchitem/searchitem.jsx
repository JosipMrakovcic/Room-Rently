import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./searchitem.css";

const Searchitem = ({ unit }) => {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;
  const [globalAddress, setGlobalAddress] = useState("Loading address...");

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/location`);
        if (res.data && res.data.address) {
          setGlobalAddress(res.data.address);
        } else {
          setGlobalAddress("Zagreb, Croatia");
        }
      } catch (err) {
        setGlobalAddress("Zagreb, Croatia");
      }
    };
    fetchLocation();
  }, [API_URL]);

  return (
    <div className="searchitem" onClick={() => navigate(`/hotels/${unit.idUnit}`)}>
      {/* 1. SLIKA (Dodano jer je falilo u tvom JSX-u) */}
      <img 
        src={unit.photos?.[0] || "/default_room.jpg"} 
        alt="" 
        className="siimg" 
      />

      {/* 2. OPIS (Sredina) */}
      <div className="sidesc">
        <h1 className="siTitle">{unit.unitName}</h1>
        <span className="siLocation">📍 {globalAddress}</span>
        
        <span className="siSubtitle">
          {unit.isApartment ? "Entire Apartment" : "Private Room"} • {unit.numRooms} {unit.numRooms === 1 ? "Bedroom" : "Bedrooms"}
        </span>
        
    <span className="siFeaturesText">
      {unit.capAdults} {unit.capAdults === 1 ? "adult" : "adults"} · {unit.capChildren} {unit.capChildren === 1 ? "child" : "children"}
    </span>

        <div className="siFeatures">
           {unit.hasWifi && <span className="siFeatureTag">Free WiFi</span>}
           {unit.hasParking && <span className="siFeatureTag">Parking</span>}
           {unit.hasAirConditioning && <span className="siFeatureTag">AC</span>}
        </div>
        
        <span className="siCancelOp">Free cancellation</span>
        <span className="siCancelOpSubtitle">You can cancel later, so lock in this great price today!</span>
      </div>

      {/* 3. DETALJI (Desno) */}
      <div className="sidetails">
        <div className="sirating">
          <span>Excellent</span>
          <button>{unit.rating || "8.9"}</button>
        </div>
        <div className="sidetailtexts">
          <span className="siprice">€{unit.price}</span>
          <span className="sitaxop">Includes taxes and fees</span>
          <button className="sicheckbutton">See availability</button>
        </div>
      </div>
    </div>
  );
};

export default Searchitem;