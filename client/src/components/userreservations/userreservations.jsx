import "./userReservations.css";
import { useState, useEffect } from "react";
import { format, addDays, isAfter } from "date-fns"; // Dodani addDays i isAfter za logiku roka
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserReservations = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(null);
  const [confirmedCancel, setConfirmedCancel] = useState(null);
  
  // State za praćenje slanja ocjene
  const [ratingLoading, setRatingLoading] = useState(null);

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

        // SORTIRANJE:
        const sortedData = response.data.sort((a, b) => {
          // Prvo gledamo status - želimo da 'Cancelled' bude na samom dnu
          if (a.status === "Cancelled" && b.status !== "Cancelled") return 1;
          if (a.status !== "Cancelled" && b.status === "Cancelled") return -1;

          // Zatim unutar toga sortiramo po datumu (najbliži datumi prvi)
          return new Date(a.startDate) - new Date(b.startDate);
        });

        setReservations(sortedData);
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

      setReservations((prev) => {
        // 1. Prvo ažuriramo status
        const updated = prev.map((r) =>
          r.idUnitReservation === cancelModal ? { ...r, status: "Cancelled" } : r
        );

        // 2. Ponovno sortiramo da Cancelled ode na dno odmah!
        return [...updated].sort((a, b) => {
          if (a.status === "Cancelled" && b.status !== "Cancelled") return 1;
          if (a.status !== "Cancelled" && b.status === "Cancelled") return -1;
          return new Date(a.startDate) - new Date(b.startDate);
        });
      });

      setConfirmedCancel(cancelModal);
      setCancelModal(null);
    } catch (err) {
      alert("Error cancelling the reservation.");
    }
  };

  // FUNKCIJA ZA RATING
  const handleRate = async (reservationId, ratingValue) => {
    const token = localStorage.getItem("access_token");
    setRatingLoading(reservationId);
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/unitReservation/rate/${reservationId}`,
        { rating: ratingValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Ažuriramo lokalni state da se odmah vidi ocjena
      setReservations((prev) =>
        prev.map((r) =>
          r.idUnitReservation === reservationId ? { ...r, rating: ratingValue } : r
        )
      );
      alert("Thank you for your rating!");
    } catch (err) {
      alert(err.response?.data || "Error submitting rating.");
    } finally {
      setRatingLoading(null);
    }
  };

  // Pomalo komplicirana provjera: je li status Completed, nije ocijenjeno i je li unutar 3 dana od endDate
  const canUserRate = (res) => {
    if (res.status !== "Completed" || res.rating) return false;
    
    const endDate = new Date(res.endDate);
    const deadline = addDays(endDate, 3); // Datum završetka + 3 dana
    const now = new Date();
    
    return !isAfter(now, deadline); // Vraća true ako "sada" nije nakon "deadlinea"
  };

  if (loading) return <div className="loading">Loading...</div>;

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

              {/* ACTIONS SEKCIJA */}
              <div className="reservationActions">
                {/* CANCEL GUMB */}
                {(res.status === "Pending" || res.status === "Confirmed") && (
                  <button className="cancelButton" onClick={() => setCancelModal(res.idUnitReservation)}>
                    Cancel Reservation
                  </button>
                )}

                {/* PORUKA ZA COMPLETED */}
                {res.status === "Completed" && !res.rating && (
                   <span className="detailValue" style={{ fontSize: '13px', fontStyle: 'italic', color: '#6c757d', display: 'block', width: '100%', marginBottom: '10px' }}>
                    This stay has been completed.
                  </span>
                )}

                {/* PRIKAZ VEĆ DANE OCJENE */}
                {res.rating && (
                  <div className="ratingDisplay">
                    <span className="detailLabel">Your Rating:</span>
                    <span className="ratingValue">{res.rating}/10 ⭐</span>
                  </div>
                )}

                {/* RATING KOMPONENTA (prikazuje se samo unutar 3 dana) */}
                {canUserRate(res) && (
                  <div className="ratingSection">
                    <p style={{fontSize: '13px', fontWeight: '600', marginBottom: '8px'}}>How was your stay? Rate us (1-10):</p>
                    <div className="ratingButtons">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <button
                          key={num}
                          className="rateBtn"
                          disabled={ratingLoading === res.idUnitReservation}
                          onClick={() => handleRate(res.idUnitReservation, num)}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    {ratingLoading === res.idUnitReservation && <span style={{fontSize: '12px'}}>Sending...</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODALI (Postojeći) */}
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