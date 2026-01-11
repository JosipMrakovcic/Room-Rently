import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./featuredproperties.css";

const Featuredproperties = () => {
  const navigate = useNavigate();
  const [units, setUnits] = useState([]);
  const [globalAddress, setGlobalAddress] = useState(""); // Dodano stanje za globalnu adresu
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Dohvaćamo najbolje ocijenjene jedinice
        const response = await axios.get(`${API_URL}/unit/top-rated`);
        setUnits(response.data);

        // 2. Dohvaćamo globalnu adresu lokacije (isto kao u Hotel.jsx)
        const locationRes = await axios.get(`${API_URL}/api/location`);
        if (locationRes.data) {
          setGlobalAddress(locationRes.data.address);
        }
      } catch (err) {
        console.error("Greška pri dohvaćanju podataka:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_URL]);

  if (loading) return <div className="fp">Loading top-rated properties...</div>;
  if (units.length === 0) return <div className="fp">No ratings available at the moment.</div>;

  return (
    <div className="fp">
      {units.map((unit) => {
        const coverImg = unit.images?.find((img) => img.url.includes("/cover/"));

        return (
          <div 
            className="fpitem" 
            key={unit.idUnit} 
            onClick={() => {
              navigate(`/hotels/${unit.idUnit}`);
              window.scrollTo(0, 0);
            }}
          >
            {coverImg ? (
              <img 
                src={coverImg.url.startsWith("http") ? coverImg.url : `${API_URL}${coverImg.url}`} 
                alt={unit.unitName} 
                className="fpimg" 
                onError={(e) => { e.target.src = "/default_image.jpg"; }}
              />
            ) : (
              <div className="fpNoPhoto">
                <span className="cameraIcon">📷</span>
                <span>No photo available</span>
              </div>
            )}

            <span className="fpname">{unit.unitName}</span>
            
            {/* Logika za adresu: Prioritet ima globalAddress, pa unit.location, pa unit.address */}
            <span className="fploc">
              📍 {globalAddress || unit.location || unit.address || "Croatia"}
            </span>

            <span className="fpprice">From {unit.price}€</span>
            
            <div className="fprating">
              <button>{unit.rating ? unit.rating.toFixed(1) : "NEW"}</button>
              <span>{unit.rating >= 9.5 ? "Excellent" : "Very Good"}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Featuredproperties;