import React, { useRef, useState, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import "./OwnerDashboard.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("stats"); 
  const [reservations, setReservations] = useState([]);
  const [popup, setPopup] = useState({ visible: false, action: "", reservationId: null });

  // Refs za grafikone
  const occupancyRef = useRef(null);
  const countryRef = useRef(null);
  const servicesRef = useRef(null);

  // --- 1. SIGURNOSNA PROVJERA I DOHVAĆANJE PODATAKA ---
  useEffect(() => {
    const savedUser = localStorage.getItem("googleUser");
    const user = savedUser ? JSON.parse(savedUser) : null;

    if (!user || !user.is_owner) {
      navigate("/main");
      return;
    }

    fetchReservations();
  }, [navigate]);

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem("access_token");
      // Putanja iz tvog Spring Boot controllera: @RequestMapping("/unitReservation") + @GetMapping("/all")
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/unitReservation/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReservations(response.data);
    } catch (err) {
      console.error("Greška pri dohvaćanju rezervacija:", err);
    }
  };

  // --- 2. LOGIKA ZA PROMJENU STATUSA ---
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("access_token");
      
      // Koristimo axios za PUT zahtjev prema novom endpointu koji trebate dodati u backend
      // Ako tvoj backend koristi @PutMapping("/update-status/{id}")
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/unitReservation/update-status/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setReservations((prev) =>
          prev.map((r) => (r.idUnitReservation === id ? { ...r, status: newStatus } : r))
        );
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Greška pri ažuriranju statusa na serveru.");
    }
  };

  const confirmAction = () => {
    const finalStatus = popup.action === "Confirm" ? "Confirmed" : "Rejected";
    handleUpdateStatus(popup.reservationId, finalStatus);
    setPopup({ visible: false, action: "", reservationId: null });
  };

  // --- 3. PODACI ZA GRAFIKONE ---
  const occupancyData = { 
    labels: ["Room 101", "Room 102", "Suite 201"], 
    datasets: [{ label: "Occupancy (%)", data: [70, 85, 60], backgroundColor: "rgba(75, 192, 192, 0.6)" }] 
  };
  const guestsByCountryData = { 
    labels: ["Croatia", "Germany", "USA", "Italy"], 
    datasets: [{ label: "Guests", data: [40, 30, 20, 10], backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"] }] 
  };
  const popularServicesData = { 
    labels: ["Breakfast", "WiFi", "Parking"], 
    datasets: [{ label: "Usage", data: [50, 80, 30], backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"] }] 
  };

  // --- 4. EXPORT FUNKCIJE ---
  const addChartToPDF = (doc, chartRef, x, y, width = 140, height = 90) => {
    const chart = chartRef.current;
    if (!chart) return;
    const image = chart.toBase64Image();
    doc.addImage(image, "PNG", x, y, width, height);
  };

  const exportStatsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Hotel Statistics Report", 20, 20);
    doc.setFontSize(12);
    doc.text("Occupancy Rates:", 20, 32);
    addChartToPDF(doc, occupancyRef, 20, 35);
    doc.addPage();
    doc.text("Guests by Country:", 20, 20);
    addChartToPDF(doc, countryRef, 20, 25);
    doc.save("owner_statistics.pdf");
  };

  const exportReservationsXLSX = () => {
    const ws = XLSX.utils.json_to_sheet(
      reservations.map((r) => ({
        Guest: r.person?.name,
        Unit: r.unit?.unitName,
        From: r.startDate,
        To: r.endDate,
        Status: r.status,
        Adults: r.adults,
        Children: r.children
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reservations");
    XLSX.writeFile(wb, "hotel_reservations.xlsx");
  };

  return (
    <div className="owner-dashboard">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button className="return-btn" onClick={() => navigate("/main")}>⬅ Return</button>
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === "stats" ? "active" : ""}`}
            onClick={() => setActiveTab("stats")}
            style={{ 
              marginRight: '10px', 
              padding: '10px 20px',
              cursor: 'pointer',
              borderRadius: '5px',
              border: 'none',
              background: activeTab === 'stats' ? '#004080' : '#4a6fa5', 
              color: 'white' 
            }}
          >
            📊 Statistics
          </button>
          <button 
            className={`tab-btn ${activeTab === "reservations" ? "active" : ""}`}
            onClick={() => setActiveTab("reservations")}
            style={{ 
              padding: '10px 20px',
              cursor: 'pointer',
              borderRadius: '5px',
              border: 'none',
              background: activeTab === 'reservations' ? '#004080' : '#4a6fa5', 
              color: 'white' 
            }}
          >
            📅 Reservations
          </button>
        </div>
      </div>

      <h1>Owner Dashboard</h1>

      {/* --- TAB 1: STATISTIKA --- */}
      {activeTab === "stats" && (
        <section className="statistics">
          <h2>Business Overview</h2>
          <div className="charts">
            <div className="chart-container"><Bar ref={occupancyRef} data={occupancyData} /></div>
            <div className="chart-container"><Pie ref={countryRef} data={guestsByCountryData} /></div>
            <div className="chart-container"><Pie ref={servicesRef} data={popularServicesData} /></div>
          </div>
          <div className="export-buttons">
            <button onClick={exportStatsPDF}>Export Stats PDF</button>
          </div>
        </section>
      )}

      {/* --- TAB 2: REZERVACIJE --- */}
      {activeTab === "reservations" && (
        <section className="reservations">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Manage Reservations</h2>
            <button className="export-btn" onClick={exportReservationsXLSX} style={{ background: '#28a745', color: 'white' }}>
              Export to Excel (XLSX)
            </button>
          </div>
          
          <table className="reservation-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Unit</th>
                <th>Dates</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.length > 0 ? (
                reservations.map((r) => (
                  <tr key={r.idUnitReservation}>
                    <td>{r.person?.name}</td>
                    <td>{r.unit?.unitName}</td>
                    <td>{r.startDate} to {r.endDate}</td>
                    <td><span className={`status-badge ${r.status.toLowerCase()}`}>{r.status}</span></td>
                    <td>
                      {r.status === "Pending" && (
                        <>
                          <button className="confirm-btn" onClick={() => setPopup({ visible: true, action: "Confirm", reservationId: r.idUnitReservation })}>Confirm</button>
                          <button className="reject-btn" onClick={() => setPopup({ visible: true, action: "Reject", reservationId: r.idUnitReservation })}>Reject</button>
                        </>
                      )}
                      {r.status === "Confirmed" && (
                        <button className="reject-btn" onClick={() => handleUpdateStatus(r.idUnitReservation, "Cancelled")}>Cancel</button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" style={{ textAlign: 'center' }}>No reservations found.</td></tr>
              )}
            </tbody>
          </table>

          <div className="reservation-cards">
            {reservations.map((r) => (
              <div key={r.idUnitReservation} className="reservation-card">
                <p><strong>Guest:</strong> {r.person?.name}</p>
                <p><strong>Unit:</strong> {r.unit?.unitName}</p>
                <p><strong>Dates:</strong> {r.startDate} - {r.endDate}</p>
                <p><strong>Status:</strong> {r.status}</p>
                <div className="card-buttons">
                  {r.status === "Pending" && (
                    <>
                      <button className="confirm-btn" onClick={() => setPopup({ visible: true, action: "Confirm", reservationId: r.idUnitReservation })}>Confirm</button>
                      <button className="reject-btn" onClick={() => setPopup({ visible: true, action: "Reject", reservationId: r.idUnitReservation })}>Reject</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* --- POPUP OVERLAY --- */}
      {popup.visible && (
        <div className="popup-overlay">
          <div className="popup">
            <p>Are you sure you want to <strong>{popup.action}</strong> this reservation?</p>
            <div className="popup-buttons">
              <button onClick={confirmAction} className="confirm-btn">{popup.action}</button>
              <button onClick={() => setPopup({ visible: false, action: "", reservationId: null })} className="reject-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}