import "./reserveModal.css";
import { useState } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format, differenceInCalendarDays } from "date-fns";
import axios from "axios";

const ReserveModal = ({ setOpenReserve, unit }) => {
  const [options, setOptions] = useState({
    parking: false,
    wifi: false,
    breakfast: false,
    towels: false,
    shampoo: false,
    hairDryer: false,
    heater: false,
    airConditioning: false,
  });

  const [dates, setDates] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const [guests, setGuests] = useState({
    adults: 1,
    children: 0,
  });

  const [showThanks, setShowThanks] = useState(false);

  // --- 1. PROVJERA AUTENTIKACIJE NA POČETKU ---
  const token = localStorage.getItem("access_token");

  if (!token) {
    return (
      <div className="reserveOverlay">
        <div className="reserveBox" style={{ textAlign: "center", padding: "40px" }}>
          <button className="closeBtn" onClick={() => setOpenReserve(false)}>✕</button>
          <h2>Access Denied</h2>
          <p>You must be logged in with Google to make a reservation.</p>
          <button
            className="confirmBtn"
            onClick={() => {
              setOpenReserve(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!unit) return null;

  const maxAdults = unit.capAdults || 1;
  const maxChildren = unit.capChildren || 0;
  const totalMaxCapacity = maxAdults + maxChildren;

  const availableAmenities = [
    { key: "hasParking", label: "Parking", stateKey: "parking" },
    { key: "hasWifi", label: "WiFi", stateKey: "wifi" },
    { key: "hasBreakfast", label: "Breakfast", stateKey: "breakfast" },
    { key: "hasTowels", label: "Towels", stateKey: "towels" },
    { key: "hasShampoo", label: "Shampoo", stateKey: "shampoo" },
    { key: "hasHairDryer", label: "Hair Dryer", stateKey: "hairDryer" },
    { key: "hasHeater", label: "Heater", stateKey: "heater" },
    { key: "hasAirConditioning", label: "Air Conditioning", stateKey: "airConditioning" },
  ].filter(amenity => unit[amenity.key] === true);

  const modifyGuests = (type, op) => {
    setGuests((prev) => {
      const currentTotal = prev.adults + prev.children;
      if (op === "inc") {
        if (currentTotal >= totalMaxCapacity) return prev;
        if (type === "adults" && prev.adults >= maxAdults) return prev;
        if (type === "children" && prev.children >= maxChildren) return prev;
        return { ...prev, [type]: prev[type] + 1 };
      } else {
        const minVal = type === "adults" ? 1 : 0;
        return { ...prev, [type]: Math.max(minVal, prev[type] - 1) };
      }
    });
  };

  // --- LOGIKA ZA IZRAČUN NOĆENJA ---
  const nightCount = differenceInCalendarDays(dates[0].endDate, dates[0].startDate);

  const handleConfirm = async () => {
    // KLJUČNA VALIDACIJA: Sprječavanje rezervacije od 0 dana (npr. 16. do 16.)
    if (nightCount <= 0) {
      alert("Please select at least one night. Your departure date must be at least one day after arrival.");
      return;
    }

    try {
      const savedUser = localStorage.getItem("googleUser");
      if (!savedUser) return;

      const currentUser = JSON.parse(savedUser);

      if (!currentUser.id) {
        alert("User data error. Please refresh the page.");
        return;
      }

      const selectedAmenitiesList = Object.keys(options).filter(key => options[key] === true);

      const reservationData = {
        startDate: format(dates[0].startDate, "yyyy-MM-dd"),
        endDate: format(dates[0].endDate, "yyyy-MM-dd"),
        personId: currentUser.id,
        unitId: unit.idUnit,
        adults: guests.adults,
        children: guests.children,
        amenities: selectedAmenitiesList
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/unitReservation/add`,
        reservationData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.status === 200 || response.status === 201) {
        setShowThanks(true);
      }
    } catch (err) {
      console.error("Reservation error:", err);
      const errorMessage = err.response?.data || "An error occurred.";
      alert(typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage);
    }
  };

  if (showThanks) {
    return (
      <div className="reserveOverlay">
        <div className="reserveBox">
          <button className="closeBtn" onClick={() => setOpenReserve(false)}>✕</button>
          <div className="thanksContainer">
            <h2>Reservation Confirmed!</h2>
            <p>Unit: {unit.unitName}</p>
            <p>Stay: {format(dates[0].startDate, "MMM dd")} - {format(dates[0].endDate, "MMM dd, yyyy")}</p>
            <p>Total: {nightCount} night(s)</p>
            <button className="closeThanksBtn" onClick={() => setOpenReserve(false)}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reserveOverlay">
      <div className="reserveBox">
        <button className="closeBtn" onClick={() => setOpenReserve(false)}>✕</button>
        <h2>Reserve: {unit.unitName}</h2>
        
        <div className="picker">
          <DateRange
            ranges={dates}
            onChange={(item) => setDates([item.selection])}
            minDate={new Date()}
            rangeColors={["#0071c2"]}
          />
          {/* Prikaz broja noćenja za bolji UX */}
          <div style={{ textAlign: "center", marginTop: "10px", fontWeight: "bold" }}>
             {nightCount > 0 
               ? `Selected: ${nightCount} night(s)` 
               : "Select departure date (min. 1 night)"}
          </div>
        </div>

        <div className="guests">
          <div className="guestItem">
            <span>Adults (Max: {maxAdults}):</span>
            <div className="counter">
              <button onClick={() => modifyGuests("adults", "dec")} disabled={guests.adults <= 1}>-</button>
              <span>{guests.adults}</span>
              <button onClick={() => modifyGuests("adults", "inc")} disabled={(guests.adults + guests.children) >= totalMaxCapacity || guests.adults >= maxAdults}>+</button>
            </div>
          </div>
          <div className="guestItem">
            <span>Children (Max: {maxChildren}):</span>
            <div className="counter">
              <button onClick={() => modifyGuests("children", "dec")} disabled={guests.children <= 0}>-</button>
              <span>{guests.children}</span>
              <button onClick={() => modifyGuests("children", "inc")} disabled={(guests.adults + guests.children) >= totalMaxCapacity || guests.children >= maxChildren}>+</button>
            </div>
          </div>
        </div>

        <div className="unitOptions">
          <h3>Available Amenities</h3>
          <div className="optionsContainer">
            {availableAmenities.map((amenity) => (
              <label className="optionCard" key={amenity.stateKey}>
                <input
                  type="checkbox"
                  checked={options[amenity.stateKey]}
                  onChange={() => setOptions({ ...options, [amenity.stateKey]: !options[amenity.stateKey] })}
                />
                <span>{amenity.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button 
          className="confirmBtn" 
          onClick={handleConfirm}
          style={{ opacity: nightCount <= 0 ? 0.6 : 1 }}
        >
          Confirm Reservation
        </button>
      </div>
    </div>
  );
};

export default ReserveModal;