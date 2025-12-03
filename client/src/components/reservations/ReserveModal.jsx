import "./reserveModal.css";
import { useState } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format } from "date-fns";

const ReserveModal = ({ setOpenReserve, unitId }) => {
  // Fake ID iz URL ili za sada random
  const fakeId = unitId || Math.floor(Math.random() * 10000);

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

  const modifyGuests = (type, op) => {
    setGuests((prev) => {
      let newValue;
      if (op === "inc") {
        newValue = prev[type] + 1;
      } else {
        if (type === "adults") {
          newValue = Math.max(1, prev[type] - 1);
        } else {
          newValue = Math.max(0, prev[type] - 1);
        }
      }
      return { ...prev, [type]: newValue };
    });
  };

  const validate = () => {
    if (dates[0].startDate > dates[0].endDate) {
      alert("Start date cannot be after end date");
      return false;
    }
    if (guests.adults < 1) {
      alert("At least 1 adult required");
      return false;
    }
    return true;
  };

  const handleConfirm = () => {
    if (!validate()) return;

    const reservationData = {
      startDate: format(dates[0].startDate, "yyyy-MM-dd"),
      endDate: format(dates[0].endDate, "yyyy-MM-dd"),
      status: "Pending",
      unit: { idUnit: Number(unitId) },
      adults: guests.adults,
      children: guests.children,
      options: options,
      fakeId: fakeId,
    };

    console.log("DATA TO SEND TO BACKEND:", reservationData);

    // Prikaži Thank You ekran
    setShowThanks(true);
  };

  if (showThanks) {
    return (
      <div className="reserveOverlay">
        <div className="reserveBox">
          <button className="closeBtn" onClick={() => setOpenReserve(false)}>
            ✕
          </button>
          <div className="thanksContainer">
            <h2>Reservation Confirmed!</h2>
            <p>Reserve Apartment ID: {fakeId}</p>
            <p>We sent you a confirmation via email.</p>
            <div className="buttonGroup">
              <button className="confirmBtn" onClick={() => alert("Resent!")}>
                Resend Email
              </button>
              <button className="closeThanksBtn" onClick={() => setOpenReserve(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reserveOverlay">
      <div className="reserveBox">
        <button className="closeBtn" onClick={() => setOpenReserve(false)}>
          ✕
        </button>

        <h2>Reserve Apartment ID: {fakeId}</h2>

        <div className="picker">
          <DateRange
            ranges={dates}
            onChange={(item) => setDates([item.selection])}
            minDate={new Date()}
          />
        </div>

        <div className="guests">
          <div>
            Adults: {guests.adults}
            <button onClick={() => modifyGuests("adults", "inc")}>+</button>
            <button onClick={() => modifyGuests("adults", "dec")}>-</button>
          </div>

          <div>
            Children: {guests.children}
            <button onClick={() => modifyGuests("children", "inc")}>+</button>
            <button onClick={() => modifyGuests("children", "dec")}>-</button>
          </div>
        </div>

        <div className="unitOptions">
          <h3>Available Options</h3>
          <div className="optionsContainer">
            {Object.entries(options).map(([key, value]) => (
              <label className="optionCard" key={key}>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => setOptions({ ...options, [key]: !value })}
                />
                <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
              </label>
            ))}
          </div>
        </div>

        <button className="confirmBtn" onClick={handleConfirm}>
          Confirm Reservation
        </button>
      </div>
    </div>
  );
};

export default ReserveModal;