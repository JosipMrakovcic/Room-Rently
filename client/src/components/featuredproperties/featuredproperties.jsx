import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./featuredproperties.css";

const Featuredproperties = () => {
  const navigate = useNavigate();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

  useEffect(() => {
    const fetchTopRated = async () => {
      try {
        const response = await axios.get(`${API_URL}/unit/top-rated`);
        setUnits(response.data);
      } catch (err) {
        console.error("Greška pri dohvaćanju podataka:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopRated();
  }, [API_URL]);

  if (loading) return <div className="fp">Učitavanje najboljih smještaja...</div>;
  if (units.length === 0) return <div className="fp">Trenutno nema dostupnih ocjena.</div>;

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
                src={`${API_URL}${coverImg.url}`} 
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
            <span className="fploc">{unit.location || "Hrvatska"}</span>
            <span className="fpprice">Već od {unit.price}€</span>
            
            <div className="fprating">
              <button>{unit.rating ? unit.rating.toFixed(1) : "NEW"}</button>
              <span>{unit.rating >= 9.5 ? "Izvrsno" : "Odlično"}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Featuredproperties;