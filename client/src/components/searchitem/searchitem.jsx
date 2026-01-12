import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./searchitem.css";

const Searchitem = ({ unit }) => {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;
  const [globalAddress, setGlobalAddress] = useState("Loading address...");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isError, setIsError] = useState(false); // Novo stanje za grešku
  const isFetching = useRef(false);

  useEffect(() => {
    if (isFetching.current) return;
    const fetchLocation = async () => {
      isFetching.current = true;
      try {
        const res = await axios.get(`${API_URL}/api/location`);
        if (res.data?.address) setGlobalAddress(res.data.address);
      } catch (err) {
        setGlobalAddress("Zagreb, Croatia");
      }
    };
    fetchLocation();
  }, [API_URL]);

  const getCoverImage = () => {
    if (unit.coverImage) {
      return unit.coverImage.startsWith("http") 
        ? unit.coverImage 
        : `${API_URL}${unit.coverImage}`;
    }
    return null; // Vraćamo null ako nema slike u bazi
  };

  const getRatingLabel = (rating) => {
    if (!rating) return "No reviews yet";
    if (rating >= 9.5) return "Exceptional";
    if (rating >= 9.0) return "Superb";
    if (rating >= 8.5) return "Excellent";
    if (rating >= 8.0) return "Very Good";
    return "Good";
  };

  // Base64 za prozirni pixel (sigurno protiv loop-a)
  const transparentPixel = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

  return (
    <div className="searchitem" onClick={() => navigate(`/hotels/${unit.idUnit}`)}>
      <div className="siimgContainer">
        {/* Prikazujemo "No Photo" div ako slika nije nađena ili je nema */}
        {(isError || !getCoverImage()) ? (
          <div className="siNoPhoto">
             <span>📷 No Photo Found</span>
          </div>
        ) : (
          <img 
            src={getCoverImage()} 
            alt={unit.unitName} 
            className="siimg" 
            onLoad={() => setImageLoaded(true)}
            onError={(e) => { 
              e.target.onerror = null; 
              e.target.src = transparentPixel; // Postavlja prozirno umjesto slike
              setIsError(true); // Prikazuje "No Photo" overlay
            }} 
            style={{ opacity: imageLoaded ? 1 : 0 }}
          />
        )}
        {!imageLoaded && !isError && getCoverImage() && <div className="siImgPlaceholder"></div>}
      </div>

      <div className="sidesc">
        <h1 className="siTitle">{unit.unitName}</h1>
        <span className="siLocation">📍 {unit.location || globalAddress}</span>
        
        <span className="siSubtitle">
          {unit.apartment ? "Entire Apartment" : "Private Room"} • {unit.numRooms} {unit.numRooms === 1 ? "Bedroom" : "Bedrooms"} • {unit.numBeds} {unit.numBeds === 1 ? "Bed" : "Beds"}
        </span>
        
        <span className="siFeaturesText">
          {unit.capAdults} {unit.capAdults === 1 ? "adult" : "adults"} · {unit.capChildren} {unit.capChildren === 1 ? "child" : "children"}
        </span>

        <div className="siFeatures">
           {unit.hasWifi && <span className="siFeatureTag">Free WiFi</span>}
           {unit.hasParking && <span className="siFeatureTag">Parking</span>}
           {unit.hasAirConditioning && <span className="siFeatureTag">AC</span>}
        </div>
        
        <span className="siCancelOp">Free cancellation</span>
        <span className="siCancelOpSubtitle">You can cancel later, so lock in this great price today!</span>
      </div>

      <div className="sidetails">
        <div className="sirating">
          <span>{getRatingLabel(unit.averageRating)}</span>
          <button>{unit.averageRating ? unit.averageRating.toFixed(1) : "n/a"}</button>
        </div>
        <div className="sidetailtexts">
          <span className="siprice">€{unit.price}</span>
          <span className="sitaxop">Includes taxes and fees</span>
          <button className="sicheckbutton">See availability</button>
        </div>
      </div>
    </div>
  );
};

export default Searchitem;