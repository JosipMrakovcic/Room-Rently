import "./featured.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

const Featured = () => {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;
  const [counts, setCounts] = useState({ sea: 0, village: 0, lake: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await axios.get(`${API_URL}/unit/counts-by-view`);
        setCounts(res.data);
      } catch (err) {
        console.error("Error fetching view counts:", err);
      }
    };
    fetchCounts();
  }, [API_URL]);

  // Funkcija za navigaciju na filtere na temelju pogleda
  const handleViewSearch = (viewType) => {
    const filterState = {
      seaView: viewType === "sea",
      villageView: viewType === "village",
      lakeView: viewType === "lake"
    };
    
    navigate("/hotels", { state: filterState });
    window.scrollTo(0, 0);
  };

  return (
    <div className="featured">
      <div className="featureditem" onClick={() => handleViewSearch("sea")}>
        <img src="/pogledmore.jpg" alt="Sea view" />
        <div className="featuredtitles">
          <h1>Sea view</h1>
          <h2>{counts["sea"] || 0} Units</h2>
        </div>
      </div>

      <div className="featureditem" onClick={() => handleViewSearch("village")}>
        <img src="/poglednalivadu.webp" alt="Village view" />
        <div className="featuredtitles">
          <h1>Village view</h1>
          <h2>{counts["village"] || 0} Units</h2>
        </div>
      </div>

      <div className="featureditem" onClick={() => handleViewSearch("lake")}>
        <img src="/poglednajezero.jpg" alt="Lake view" />
        <div className="featuredtitles">
          <h1>Lake view</h1>
          <h2>{counts["lake"] || 0} Units</h2>
        </div>
      </div>
    </div>
  );
};

export default Featured;