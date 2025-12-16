import React, { useState, useEffect } from "react";
import "./hotel.css";
import Navbar from "../../components/navbar/navbar";
import Header from "../../components/header/Header";
import Maillist from "../../components/maillist/maillist";
import Footer from "../../components/footer/footer";
import ReserveModal from "../../components/reservations/ReserveModal";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const Hotel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const [unit, setUnit] = useState(null);
  const [globalAddress, setGlobalAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [slidenumber, setslidenumber] = useState(0);
  const [open, setopen] = useState(false);
  const [openReserve, setOpenReserve] = useState(false);

  const photos = [
    { src: "/20210710_084619.jpg" },
    { src: "/20210710_085443.jpg" },
    { src: "/20210710_085121.jpg" },
    { src: "/20210710_085154.jpg" },
    { src: "/20210710_085438.jpg" },
    { src: "/20210710_084619.jpg" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const unitRes = await axios.get(`${API_URL}/unit/${id}`);
        setUnit(unitRes.data);

        const locationRes = await axios.get(`${API_URL}/api/location`);
        if (locationRes.data) {
          setGlobalAddress(locationRes.data.address);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, API_URL]);

  const handleopen = (i) => {
    setslidenumber(i);
    setopen(true);
  };

  const handlemove = (direction) => {
    let newslidenumber;
    if (direction === "l") {
      newslidenumber = slidenumber === 0 ? 5 : slidenumber - 1;
    } else {
      newslidenumber = slidenumber === 5 ? 0 : slidenumber + 1;
    }
    setslidenumber(newslidenumber);
  };

  if (loading) return <div className="hotelcontainer">Loading...</div>;
  if (!unit) return <div className="hotelcontainer">Unit not found.</div>;

  const totalGuests = unit.capAdults + unit.capChildren;

  // Provjera ima li ikakvih amenities
  const hasAnyAmenity = 
    unit.hasWifi || unit.hasParking || unit.hasAirConditioning || 
    unit.hasBreakfast || unit.hasTowels || unit.hasShampoo || 
    unit.hasHairDryer || unit.hasHeater;

  return (
    <div>
      <Navbar />
      <Header type="list" />
      
      {openReserve && (
        <ReserveModal setOpenReserve={setOpenReserve} unitId={id} />
      )}

      <div className="hotelcontainer">
        {open && (
          <div className="slider">
            <span className="close" onClick={() => setopen(false)}>❌</span>
            <span className="arrow" onClick={() => handlemove("l")}>⬅️</span>
            <div className="sliderwrapper">
              <img src={photos[slidenumber].src} alt="" className="sliderimg" />
            </div>
            <span className="arrow" onClick={() => handlemove("r")}>➡️</span>
          </div>
        )}

        <div className="hotelwrapper">
          <div className="hotelButtonsTop">
            <button className="backToList" onClick={() => navigate(-1)}>
              ⬅ Back to Search
            </button>
            <button className="booknow" onClick={() => setOpenReserve(true)}>
              Reserve Now
            </button>
          </div>
          
          <h1 className="hoteltitle">{unit.unitName}</h1>
          
          <div className="hoteladress">
            <span>📍 {globalAddress || unit.location || "Zagreb, Croatia"}</span>
          </div>

          <span className="hoteldistance">
            Excellent location – {unit.isApartment ? "Spacious Apartment" : "Comfortable Room"}
          </span>

          <span className="hotelpricehighlight">
            Price per night: <b>€{unit.price}</b>
          </span>

          <div className="hotelimages">
            {photos.map((photo, index) => (
              <div className="hotelimgwrapper" key={index}>
                <img
                  onClick={() => handleopen(index)}
                  src={photo.src}
                  alt=""
                  className="hotelimg"
                />
              </div>
            ))}
          </div>

          <div className="hoteldetails">
            <div className="hoteldetailstexts">
              <h1 className="hoteltitle">{unit.mainDescName}</h1>
              <p className="hoteldesc">{unit.mainDescContent}</p>
              
              {unit.secDescName && (
                <>
                  <h2 className="hoteltitle" style={{fontSize: "20px", marginTop: "20px"}}>{unit.secDescName}</h2>
                  <p className="hoteldesc">{unit.secDescContent}</p>
                </>
              )}

              <div className="unitInfoList">
                <h3>Unit Details:</h3>
                <ul>
                  <li>🚪 {unit.numRooms} {unit.numRooms === 1 ? "Room" : "Rooms"}</li>
                  <li>👥 {unit.capAdults} {unit.capAdults === 1 ? "Adult" : "Adults"}</li>
                  <li>🧒 {unit.capChildren} {unit.capChildren === 1 ? "Child" : "Children"}</li>
                </ul>
              </div>

              <div className="amenitiesHighlight">
                <h3>Included Amenities:</h3>
                {hasAnyAmenity ? (
                  <div className="amenityTags">
                    {unit.hasWifi && <span className="amenityTag">✅ Free WiFi</span>}
                    {unit.hasParking && <span className="amenityTag">✅ Free Parking</span>}
                    {unit.hasAirConditioning && <span className="amenityTag">✅ Air Conditioning</span>}
                    {unit.hasBreakfast && <span className="amenityTag">✅ Breakfast included</span>}
                    {unit.hasTowels && <span className="amenityTag">✅ Towels</span>}
                    {unit.hasShampoo && <span className="amenityTag">✅ Shampoo</span>}
                    {unit.hasHairDryer && <span className="amenityTag">✅ Hair Dryer</span>}
                    {unit.hasHeater && <span className="amenityTag">✅ Heating</span>}
                  </div>
                ) : (
                  <p className="noAmenitiesText">😔 Sorry, no specific amenities listed for this unit.</p>
                )}
              </div>
            </div>
            
            <div className="hoteldetailsprice">
              <div className="hotelDetailsPrice">
                <h1>Property Highlights</h1>
                <span>
                  Perfect for <b>{totalGuests} {totalGuests === 1 ? "guest" : "guests"}</b>!
                  <br />
                  Rating: {unit.rating ? `${unit.rating}/10` : "No rating yet"}
                </span>
                <h2>
                  <b>€{unit.price}</b> (per night)
                </h2>
                <button onClick={() => setOpenReserve(true)}>Reserve or Book Now!</button>
              </div>
            </div>
          </div>

          <div className="gmap-frame" style={{ marginTop: "20px" }}>
            <iframe
              width="100%"
              height="450"
              style={{ border: 0, borderRadius: "10px" }}
              loading="lazy"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(globalAddress || "Zagreb")}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              frameBorder="0"
              title="Google Maps"
            ></iframe>
          </div>
        </div>
        <Maillist />
        <Footer />
      </div>
    </div>
  );
};

export default Hotel;