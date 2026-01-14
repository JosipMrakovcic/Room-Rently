import "./featured.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

const Featured = () => {
  const navigate = useNavigate();
  // Dohvaćanje osnovnog URL-a API-ja iz .env datoteke
  const API_URL = process.env.REACT_APP_API_URL;
  // State za pohranu podataka o broju jedinica i slikama po tipu pogleda
  const [viewData, setViewData] = useState([]);
  // useEffect: Dohvaća podatke s backend-a čim se komponenta učita
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await axios.get(`${API_URL}/unit/counts-by-view`);
        setViewData(res.data); // Sprema listu objekata npr. [{label: "sea", count: 5, image: "url"}, ...]
      } catch (err) {
        console.error("Error fetching view data:", err);
      }
    };
    fetchCounts();
  }, [API_URL]);
  // handleViewSearch: Navigacija na stranicu s hotelima uz slanje filtriranog stanja
  const handleViewSearch = (viewType) => {
    navigate("/hotels", { 
      state: { 
        [viewType + "View"]: true,// Postavlja filter (npr. seaView: true)
        date: [{ startDate: null, endDate: null, key: "selection" }] 
      } 
    });
    window.scrollTo(0, 0);// Vraća korisnika na vrh stranice nakon klika
  };
  // getDataFor: Pomoćna funkcija za uparivanje podataka s API-ja s lokalnim kategorijama
  const getDataFor = (type) => {
  // item.label je ono što tvoj DTO šalje ("sea", "village", "lake")
  return viewData.find(item => item.label === type) || { count: 0, image: null };
};
// Definiranje statičnih kategorija koje želimo prikazati na UI-u
  const categories = [
    { id: "sea", title: "Sea view", defaultImg: "/pogledmore.jpg" },
    { id: "village", title: "Village view", defaultImg: "/poglednalivadu.webp" },
    { id: "lake", title: "Lake view", defaultImg: "/poglednajezero.jpg" },
  ];

  return (
    <div className="featured">
      {categories.map((cat) => {
        // Spajanje podataka iz API-ja za trenutnu kategoriju
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