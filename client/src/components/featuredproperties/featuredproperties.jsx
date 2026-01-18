import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./featuredproperties.css";

const Featuredproperties = () => {
  const navigate = useNavigate();

  // State menadžment: units za podatke, globalAddress za lokaciju, loading za User experience
  const [units, setUnits] = useState([]);
  const [globalAddress, setGlobalAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL;
// useEffect: Pokreće paralelno dohvaćanje podataka s dva različita endpointa pri mountanju
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Dohvaćanje top-rated jedinica (podaci dolaze iz Data transfer objekta DTO)
        const response = await axios.get(`${API_URL}/unit/top-rated`);
        setUnits(response.data);
        // 2. Dohvaćanje opće adrese objekta iz lokacijskih postavki
        const locationRes = await axios.get(`${API_URL}/api/location`);
        if (locationRes.data) {
          setGlobalAddress(locationRes.data.address);
        }
      } catch (err) {
        console.error("Greška pri dohvaćanju podataka:", err);// Zaustavi loading indikator bez obzira na ishod
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_URL]);
// Early return: Sprječava renderiranje praznog sučelja dok se podaci čekaju
  if (loading) return <div className="fp">Loading top-rated properties...</div>;
  if (units.length === 0) return <div className="fp">No ratings available at the moment.</div>;

  return (
    <div className="fp">
      {/* Mapiranje kroz niz jedinica i generiranje kartica */}
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
              {}
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