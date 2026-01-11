import "./featured.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

const Featured = () => {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;
  const [viewData, setViewData] = useState([]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await axios.get(`${API_URL}/unit/counts-by-view`);
        setViewData(res.data); // Sada dobivamo listu [{type, count, image}, ...]
      } catch (err) {
        console.error("Error fetching view data:", err);
      }
    };
    fetchCounts();
  }, [API_URL]);

  const handleViewSearch = (viewType) => {
    navigate("/hotels", { 
      state: { 
        [viewType + "View"]: true,
        date: [{ startDate: null, endDate: null, key: "selection" }] 
      } 
    });
    window.scrollTo(0, 0);
  };

  // Pomoćna funkcija za pronalaženje podataka za određeni tip
  const getDataFor = (type) => {
    return viewData.find(item => item.type === type) || { count: 0, image: null };
  };

  const categories = [
    { id: "sea", title: "Sea view", defaultImg: "/pogledmore.jpg" },
    { id: "village", title: "Village view", defaultImg: "/poglednalivadu.webp" },
    { id: "lake", title: "Lake view", defaultImg: "/poglednajezero.jpg" },
  ];

  return (
    <div className="featured">
      {categories.map((cat) => {
        const data = getDataFor(cat.id);
        // Provjeravamo počinje li data.image s "http" (S3 link) ili je relativna putanja
        const displayImg = data.image 
          ? (data.image.startsWith("http") ? data.image : `${API_URL}${data.image}`) 
          : cat.defaultImg;

        return (
          <div key={cat.id} className="featureditem" onClick={() => handleViewSearch(cat.id)}>
            <img 
              src={displayImg} 
              alt={cat.title} 
              onError={(e) => { e.target.src = cat.defaultImg; }} 
            />
            <div className="featuredtitles">
              <h1>{cat.title}</h1>
              <h2>{data.count} Units</h2>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Featured;