import { useNavigate } from "react-router-dom";
import "./propertylist.css";
import axios from "axios";
import { useEffect, useState } from "react";

const Propertylist = () => {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
  const [bedData, setBedData] = useState([]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await axios.get(`${API_URL}/unit/counts-by-beds`);
        setBedData(res.data); // Prima listu [{beds, count, image}, ...]
      } catch (err) {
        console.error("Error fetching bed counts:", err);
      }
    };
    fetchCounts();
  }, [API_URL]);

  const handleSearch = (numBeds) => {
    navigate("/hotels", { 
      state: { 
        beds: numBeds,
        date: [{ startDate: null, endDate: null, key: "selection" }] 
      } 
    });
    window.scrollTo(0, 0);
  };

  // Pomoćna funkcija za izvlačenje podataka za određeni broj kreveta
  const getDataForBeds = (num) => {
    return bedData.find(item => item.beds === num) || { count: 0, image: null };
  };

  const bedCategories = [
    { beds: 1, defaultImg: "20210710_085121.jpg" },
    { beds: 2, defaultImg: "20210710_085154.jpg" },
    { beds: 3, defaultImg: "20210710_085438.jpg" },
    { beds: 4, defaultImg: "20210710_085443.jpg" },
    { beds: 5, defaultImg: "20210710_084619.jpg" },
  ];

  return (
    <div className="pList">
      {bedCategories.map((item) => {
        const data = getDataForBeds(item.beds);
        // Ako backend vrati sliku, koristi nju, inače koristi tvoju defaultnu
        const displayImg = data.image ? `${API_URL}${data.image}` : item.defaultImg;

        return (
          <div 
            key={item.beds} 
            className="plistItem" 
            onClick={() => handleSearch(item.beds)}
          >
            <img 
              src={displayImg} 
              alt={`${item.beds} beds`} 
              className="plistimg" 
              onError={(e) => { e.target.src = item.defaultImg; }}
            />
            <div className="plisttitle">
              <h1>{item.beds} {item.beds === 1 ? "Bed" : "Beds"}</h1>
              <h2>{data.count} Units</h2>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Propertylist;