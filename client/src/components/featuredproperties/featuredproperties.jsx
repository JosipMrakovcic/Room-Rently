import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./featuredproperties.css";

const Featuredproperties = () => {
  const navigate = useNavigate();
  const [units, setUnits] = useState([]);
  const [globalAddress, setGlobalAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/unit/top-rated`);
        setUnits(response.data);

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
        // Promjena: Koristimo imageUrl iz DTO-a umjesto pretrage po unit.images
        const displayImg = unit.imageUrl;

        return (
          <div 
            className="fpitem" 
            key={unit.idUnit} 
            onClick={() => {
              navigate(`/hotels/${unit.idUnit}`);
              window.scrollTo(0, 0);
            }}
          >
            {displayImg ? (
              <img 
                src={displayImg.startsWith("http") ? displayImg : `${API_URL}${displayImg}`} 
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
            
            <span className="fploc">
              📍 {globalAddress || unit.location || "Croatia"}
            </span>

            <span className="fpprice">From {unit.price}€</span>
            
            <div className="fprating">
              {/* Napomena: Ako želiš rating, moramo ga dodati u DTO na backendu */}
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