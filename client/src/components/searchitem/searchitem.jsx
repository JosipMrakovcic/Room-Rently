import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./searchitem.css";

const Searchitem = ({ unit }) => {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;
  const [globalAddress, setGlobalAddress] = useState("Loading address...");

  // --- 1. DODAJ STANJE ZA UČITAVANJE ---
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/location`);
        if (res.data && res.data.address) {
          setGlobalAddress(res.data.address);
        } else {
          setGlobalAddress("Zagreb, Croatia");
        }
      } catch (err) {
        setGlobalAddress("Zagreb, Croatia");
      }
    };
    fetchLocation();
  }, [API_URL]);


  // --- OVAKO IZMIJENI FUNKCIJU ---
const getCoverImage = () => {
  // Ako unit još nije učitan ili nema images niz
  if (!unit || !unit.images || unit.images.length === 0) {
    return "/default_room.jpg";
  }

  const coverImg = unit.images.find((img) => img.url && img.url.includes("/cover/"));
  
  if (coverImg && coverImg.url) {
    return `${API_URL}${coverImg.url}`;
  }

  return "/default_room.jpg"; 
};



  // Pomoćna funkcija za dinamički tekst ocjene na temelju tvog izračunatog prosjeka
  const getRatingLabel = (rating) => {
    if (!rating) return "No reviews yet";
    if (rating >= 9.5) return "Exceptional";
    if (rating >= 9.0) return "Superb";
    if (rating >= 8.5) return "Excellent";
    if (rating >= 8.0) return "Very Good";
    return "Good";
  };

  const coverImg = unit.images?.find((img) => img.url && img.url.includes("/cover/"));
  const fullCoverUrl = coverImg ? `${API_URL}${coverImg.url}` : null;

  return (
    <div className="searchitem" onClick={() => navigate(`/hotels/${unit.idUnit}`)}>
    
    {/* --- OVAKO IZMIJENI CIJELI KONTEJNER SLIKE --- */}
    <div className="siimgContainer">
      {fullCoverUrl ? (
        <img 
          src={fullCoverUrl} 
          alt="" 
          className="siimg" 
          onLoad={() => setImageLoaded(true)}
          onError={(e) => { e.target.style.display = 'none'; }} 
          style={{ opacity: imageLoaded ? 1 : 0 }}
        />
      ) : (
        /* Ovaj blok se prikazuje AKO NEMA cover slike - nema <img> taga, nema titranja */
        <div className="siNoPhoto">
          <span className="noPhotoIcon">📷</span>
          <span className="noPhotoText">No photo available</span>
        </div>
      )}
    </div>
      {/* 2. OPIS (Sredina) */}
      <div className="sidesc">
        <h1 className="siTitle">{unit.unitName}</h1>
        <span className="siLocation">📍 {globalAddress}</span>
        
        <span className="siSubtitle">
          {unit.isApartment ? "Entire Apartment" : "Private Room"} • {unit.numRooms} {unit.numRooms === 1 ? "Bedroom" : "Bedrooms"} • {unit.numBeds} {unit.numBeds === 1 ? "Bed" : "Beds"}
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

      {/* 3. DETALJI (Desno) */}
      <div className="sidetails">
        <div className="sirating">
          {/* Koristimo getRatingLabel da automatski ispiše kategoriju */}
          <span>{getRatingLabel(unit.rating)}</span>
          {/* Ako unit.rating postoji (nije null), prikazujemo ga zaokruženog, inače stavljamo n/a ili tvoj default */}
          <button>{unit.rating ? unit.rating.toFixed(1) : "n/a"}</button>
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