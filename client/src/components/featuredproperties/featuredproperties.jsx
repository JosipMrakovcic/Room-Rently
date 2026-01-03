import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./featuredproperties.css";

const Featuredproperties = () => {
  const navigate = useNavigate();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopRated = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8080";
        const response = await axios.get(`${apiUrl}/unit/top-rated`);
        setUnits(response.data);
      } catch (err) {
        console.error("Greška pri dohvaćanju podataka:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopRated();
  }, []);

  if (loading) return <div className="fp">Učitavanje najboljih smještaja...</div>;
  if (units.length === 0) return <div className="fp">Trenutno nema dostupnih ocjena.</div>;

  return (
    <div className="fp">
      {units.map((unit) => (
        <div 
          className="fpitem" 
          key={unit.idUnit} 
          onClick={() => {
            navigate(`/hotels/${unit.idUnit}`);
            window.scrollTo(0, 0);
          }}
        >
          <img 
            src={unit.images?.length > 0 ? unit.images[0].imgUrl : "/default_image.jpg"} 
            alt={unit.unitName} 
            className="fpimg" 
          />
          <span className="fpname">{unit.unitName}</span>
          <span className="fploc">{unit.location || "Hrvatska"}</span>
          <span className="fpprice">Već od {unit.price}€</span>
          
          {/* Prikaz rejtinga iz tvoje getRating() metode iz Jave */}
          <div className="fprating">
            <button>{unit.rating ? unit.rating.toFixed(1) : "NEW"}</button>
            <span>{unit.rating >= 9.5 ? "Izvrsno" : "Odlično"}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Featuredproperties;