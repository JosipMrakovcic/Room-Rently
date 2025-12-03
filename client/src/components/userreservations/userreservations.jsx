import "./userReservations.css";
import { useState } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const UserReservations = () => {
  const navigate = useNavigate();

  const [reservations, setReservations] = useState([
    {
      id: 101,
      startDate: new Date("2025-12-10"),
      endDate: new Date("2025-12-15"),
      adults: 2,
      children: 1,
      options: { wifi: true, breakfast: false, parking: true },
      status: "Confirmed",
    },
    {
      id: 102,
      startDate: new Date("2025-12-20"),
      endDate: new Date("2025-12-25"),
      adults: 1,
      children: 0,
      options: { wifi: true, breakfast: true, parking: false },
      status: "Pending",
    },
  ]);

  const [cancelModal, setCancelModal] = useState(null);
  const [confirmedCancel, setConfirmedCancel] = useState(null);

  const handleCancelClick = (resId) => {
    setCancelModal(resId);
  };

  const confirmCancel = () => {
    setReservations((prev) =>
      prev.map((r) =>
        r.id === cancelModal ? { ...r, status: "Cancelled" } : r
      )
    );
    setConfirmedCancel(cancelModal);
    setCancelModal(null);
  };

  return (
    <div className="userReservationsPage">
      <div className="backButtonContainer">
        <button className="backButton" onClick={() => navigate("/main")}>
          ← Back to Main Page
        </button>
      </div>

      <div className="reservationsHeader">
        <h2>Your Current Reservations</h2>
        <p className="reservationsCount">{reservations.length} reservation(s)</p>
      </div>

      {reservations.length === 0 && (
        <div className="emptyState">
          <p>No reservations found.</p>
          <button className="primaryButton" onClick={() => navigate("/main")}>
            Book Now
          </button>
        </div>
      )}

      <div className="reservationsList">
        {reservations.map((res) => (
          <div key={res.id} className="reservationCard">
            <div className="reservationHeader">
              <span className="reservationId">Reservation #{res.id}</span>
              <span className={`reservationStatus ${res.status.toLowerCase()}`}>
                {res.status}
              </span>
            </div>

            <div className="reservationDetails">
              <div className="detailItem">
                <span className="detailLabel">Dates:</span>
                <span className="detailValue">
                  {format(res.startDate, "MMM dd, yyyy")} - {format(res.endDate, "MMM dd, yyyy")}
                </span>
              </div>

              <div className="detailItem">
                <span className="detailLabel">Guests:</span>
                <span className="detailValue">
                  {res.adults} Adult{res.adults !== 1 ? "s" : ""}
                  {res.children > 0 && `, ${res.children} Child${res.children !== 1 ? "ren" : ""}`}
                </span>
              </div>

              <div className="detailItem">
                <span className="detailLabel">Amenities:</span>
                <span className="detailValue">
                  {res.options.wifi && "Wi-Fi "}
                  {res.options.breakfast && "Breakfast "}
                  {res.options.parking && "Parking"}
                  {!res.options.wifi && !res.options.breakfast && !res.options.parking && "None selected"}
                </span>
              </div>
            </div>

            <div className="reservationActions">
              {res.status !== "Cancelled" && (
                <button className="cancelButton" onClick={() => handleCancelClick(res.id)}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {cancelModal && (
        <div className="reserveOverlay">
          <div className="reserveBox">
            <h2>Are you sure you want to cancel this reservation?</h2>
            <div className="confirmationActions">
              <button className="primaryButton" onClick={confirmCancel}>
                Yes, Cancel
              </button>
              <button className="secondaryButton" onClick={() => setCancelModal(null)}>
                No, Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmedCancel && (
        <div className="reserveOverlay">
          <div className="reserveBox">
            <div className="successIcon">✓</div>
            <h2>Reservation #{confirmedCancel} Cancelled!</h2>
            <p>The reservation has been successfully cancelled.</p>
            <button className="primaryButton" onClick={() => setConfirmedCancel(null)}>
              Back to Reservations
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserReservations;
