import { useNavigate } from "react-router-dom";
import "./propertylist.css";
import axios from "axios";
import { useEffect, useState } from "react";

const Propertylist = () => {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;
  const [counts, setCounts] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await axios.get(`${API_URL}/unit/counts-by-beds`);
        setCounts(res.data);
      } catch (err) {
        console.error("Error fetching bed counts:", err);
      }
    };
    fetchCounts();
  }, [API_URL]);

  // Pomoćna funkcija za navigaciju s filtriranjem kreveta
  const handleSearch = (numBeds) => {
    // Navigiramo na /hotels i šaljemo informaciju o krevetima
    navigate("/hotels", { state: { beds: numBeds } });
    window.scrollTo(0, 0);
  };

  const bedCategories = [
    { beds: 1, img: "20210710_085121.jpg" },
    { beds: 2, img: "20210710_085154.jpg" },
    { beds: 3, img: "20210710_085438.jpg" },
    { beds: 4, img: "20210710_085443.jpg" },
    { beds: 5, img: "20210710_084619.jpg" },
  ];

  return (
    <div className="pList">
      {bedCategories.map((item) => (
        <div 
          key={item.beds} 
          className="plistItem" 
          onClick={() => handleSearch(item.beds)}
        >
          <img src={item.img} alt="" className="plistimg" />
          <div className="plisttitle">
            <h1>{item.beds} {item.beds === 1 ? "Bed" : "Beds"}</h1>
            <h2>{counts[item.beds] || 0} Units</h2>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Propertylist;