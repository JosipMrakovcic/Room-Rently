import "./userReservations.css";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserReservations = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(null);
  const [confirmedCancel, setConfirmedCancel] = useState(null);

  useEffect(() => {
    const fetchReservations = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/main");
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/unitReservation/my-reservations`, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReservations(response.data);
      } catch (err) {
        console.error("Greška pri dohvaćanju:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, [navigate]);

  const confirmCancel = async () => {
    const token = localStorage.getItem("access_token");
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/unitReservation/cancel/${cancelModal}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReservations((prev) =>
        prev.map((r) => 
          r.idUnitReservation === cancelModal ? { ...r, status: "Cancelled" } : r
        )
      );
      setConfirmedCancel(cancelModal);
      setCancelModal(null);
    } catch (err) {
      alert("Greška pri otkazivanju rezervacije.");
    }
  };

  if (loading) return <div className="loading">Učitavanje...</div>;

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

      {reservations.length === 0 ? (
        <div className="emptyState">
          <p>No reservations found.</p>
          <button className="primaryButton" onClick={() => navigate("/main")}>
            Book Now
          </button>
        </div>
      ) : (
        <div className="reservationsList">
          {reservations.map((res) => (
            <div key={res.idUnitReservation} className="reservationCard">
              <div className="reservationHeader">
                <div className="unitInfo">
                  {/* PRIKAZ NAZIVA SOBE/APARTMANA */}
                  <h3 className="unitNameTitle">{res.unit?.unitName || "Accommodation"}</h3>
                  <span className="reservationId">Reservation #{res.idUnitReservation}</span>
                </div>
                <span className={`reservationStatus ${res.status?.toLowerCase()}`}>
                  {res.status}
                </span>
              </div>

              <div className="reservationDetails">
                <div className="detailItem">
                  <span className="detailLabel">Dates:</span>
                  <span className="detailValue">
                    {format(new Date(res.startDate), "MMM dd, yyyy")} - {format(new Date(res.endDate), "MMM dd, yyyy")}
                  </span>
                </div>
                
                <div className="detailItem">
                  <span className="detailLabel">Guests:</span>
                  <span className="detailValue">
                    {res.adults} {res.adults === 1 ? "Adult" : "Adults"}
                    {res.children > 0 && (
                      <> & {res.children} {res.children === 1 ? "Child" : "Children"}</>
                    )}
                  </span>
                </div>

                <div className="detailItem">
                  <span className="detailLabel">Amenities:</span>
                  <div className="amenitiesTags">
                    {res.selectedAmenities ? (
                      res.selectedAmenities.split(", ").map((am, i) => (
                        <span key={i} className="amenityTag">{am}</span>
                      ))
                    ) : <span className="detailValue">None</span>}
                  </div>
                </div>
              </div>

              {res.status !== "Cancelled" && (
                <div className="reservationActions">
                  <button className="cancelButton" onClick={() => setCancelModal(res.idUnitReservation)}>
                    Cancel Reservation
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modali ostaju isti... */}
      {cancelModal && (
        <div className="reserveOverlay">
          <div className="reserveBox">
            <h2>Are you sure you want to cancel this reservation?</h2>
            <div className="confirmationActions">
              <button className="primaryButton" onClick={confirmCancel}>Yes, Cancel</button>
              <button className="secondaryButton" onClick={() => setCancelModal(null)}>No, Go Back</button>
            </div>
          </div>
        </div>
      )}

      {confirmedCancel && (
        <div className="reserveOverlay">
          <div className="reserveBox">
            <div className="successIcon">✓</div>
            <h2>Reservation #{confirmedCancel} Cancelled!</h2>
            <button className="primaryButton" onClick={() => setConfirmedCancel(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserReservations;