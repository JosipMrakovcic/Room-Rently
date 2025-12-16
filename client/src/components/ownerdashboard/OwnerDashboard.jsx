import React, { useRef, useState, useEffect, useMemo } from "react";
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

  const occupancyRef = useRef(null);
  const countryRef = useRef(null);
  const servicesRef = useRef(null);
  const amenitiesRef = useRef(null);

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
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/unitReservation/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReservations(response.data);
    } catch (err) {
      console.error("Greška pri dohvaćanju rezervacija:", err);
    }
  };

  // --- 2. DINAMIČKA OBRADA PODATAKA ZA GRAFIKONE ---

  const monthlyStats = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const guestCounts = new Array(12).fill(0);
    reservations.forEach(res => {
      const date = new Date(res.startDate);
      if (date.getFullYear() === 2025 && res.status !== "Rejected") {
        guestCounts[date.getMonth()] += (res.adults + (res.children || 0));
      }
    });
    return { labels: months, data: guestCounts };
  }, [reservations]);

  const amenitiesStats = useMemo(() => {
    const counts = {};
    reservations.forEach(res => {
      let amenityList = [];
      // Koristimo selectedAmenities jer si to koristio u UserReservations
      const rawAmenities = res.selectedAmenities || res.amenities;
      
      if (Array.isArray(rawAmenities)) {
        amenityList = rawAmenities;
      } else if (typeof rawAmenities === "string" && rawAmenities.trim() !== "") {
        amenityList = rawAmenities.split(",").map(item => item.trim());
      }

      amenityList.forEach(amenity => {
        const formattedName = amenity.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
        if (formattedName) {
          counts[formattedName] = (counts[formattedName] || 0) + 1;
        }
      });
    });
    const sortedLabels = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    return { labels: sortedLabels, data: sortedLabels.map(l => counts[l]) };
  }, [reservations]);

  const unitStats = useMemo(() => {
    const counts = {};
    reservations.forEach(res => {
      const name = res.unit?.unitName || "Unknown";
      counts[name] = (counts[name] || 0) + 1;
    });
    return { labels: Object.keys(counts), data: Object.values(counts) };
  }, [reservations]);

  const countryStats = useMemo(() => {
    const counts = {};
    reservations.forEach(res => {
      const c = res.country || "Other";
      counts[c] = (counts[c] || 0) + 1;
    });
    return { labels: Object.keys(counts), data: Object.values(counts) };
  }, [reservations]);

  const monthlyGuestsData = {
    labels: monthlyStats.labels,
    datasets: [{ label: "Total Guests", data: monthlyStats.data, backgroundColor: "#004080" }]
  };

  const amenitiesData = { 
    labels: amenitiesStats.labels, 
    datasets: [{ label: "Number of Requests", data: amenitiesStats.data, backgroundColor: "rgba(75, 192, 192, 0.6)" }] 
  };

  const guestsByCountryData = { 
    labels: countryStats.labels, 
    datasets: [{ label: "Guests", data: countryStats.data, backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"] }] 
  };

  const popularServicesData = { 
    labels: unitStats.labels, 
    datasets: [{ label: "Reservations", data: unitStats.data, backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"] }] 
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("access_token");
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

  const addChartToPDF = (doc, chartRef, x, y, width = 140, height = 90) => {
    const chart = chartRef.current;
    if (!chart) return;
    const image = chart.toBase64Image();
    doc.addImage(image, "PNG", x, y, width, height);
  };

  const exportStatsPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(20);
    doc.setTextColor(0, 64, 128); // Tamno plava boja kao u dashboardu
    doc.text("Hotel Statistics Report - 2025", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    // --- STRANICA 1 ---
    // 1. Grafikon: Mjesečni gosti
    doc.text("1. Monthly Guest Count:", 20, 35);
    addChartToPDF(doc, occupancyRef, 20, 40, 170, 80);

    // 2. Grafikon: Pogodnosti (Amenities)
    doc.text("2. Most Requested Amenities:", 20, 135);
    addChartToPDF(doc, amenitiesRef, 20, 140, 170, 80);

    // --- STRANICA 2 ---
    doc.addPage();
    doc.setFontSize(20);
    doc.setTextColor(0, 64, 128);
    doc.text("Geographic & Unit Analytics", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    // 3. Grafikon: Gosti po državama
    doc.text("3. Guests by Country:", 20, 35);
    addChartToPDF(doc, countryRef, 40, 40, 120, 90); // Pie chart je bolji u manjem kvadratnom formatu

    // 4. Grafikon: Popularnost jedinica
    doc.text("4. Unit Popularity:", 20, 145);
    addChartToPDF(doc, servicesRef, 40, 150, 120, 90);

    doc.save("hotel_detailed_statistics.pdf");
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
        Children: r.children,
        Amenities: r.selectedAmenities || (Array.isArray(r.amenities) ? r.amenities.join(", ") : r.amenities)
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reservations");
    XLSX.writeFile(wb, "hotel_reservations.xlsx");
  };

  const exportStatsXLSX = () => {
    const wb = XLSX.utils.book_new();

    // 1. Podaci za Mjesečnu statistiku
    const monthlyWS = XLSX.utils.json_to_sheet(
      monthlyStats.labels.map((label, index) => ({
        Month: label,
        Total_Guests: monthlyStats.data[index]
      }))
    );
    XLSX.utils.book_append_sheet(wb, monthlyWS, "Monthly Stats");

    // 2. Podaci za Amenities (Pogodnosti)
    const amenitiesWS = XLSX.utils.json_to_sheet(
      amenitiesStats.labels.map((label, index) => ({
        Amenity: label,
        Requests: amenitiesStats.data[index]
      }))
    );
    XLSX.utils.book_append_sheet(wb, amenitiesWS, "Amenities Stats");

    // 3. Podaci za Države
    const countryWS = XLSX.utils.json_to_sheet(
      countryStats.labels.map((label, index) => ({
        Country: label,
        Count: countryStats.data[index]
      }))
    );
    XLSX.utils.book_append_sheet(wb, countryWS, "Country Stats");

    // 4. Podaci za Popularnost Jedinica
    const unitWS = XLSX.utils.json_to_sheet(
      unitStats.labels.map((label, index) => ({
        Unit_Name: label,
        Reservations: unitStats.data[index]
      }))
    );
    XLSX.utils.book_append_sheet(wb, unitWS, "Unit Stats");

    // Spremamo datoteku
    XLSX.writeFile(wb, "hotel_business_analytics.xlsx");
  };
  return (
    <div className="owner-dashboard">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button className="return-btn" onClick={() => navigate("/main")}>⬅ Return</button>
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === "stats" ? "active" : ""}`}
            onClick={() => setActiveTab("stats")}
            style={{ marginRight: '10px', padding: '10px 20px', cursor: 'pointer', borderRadius: '5px', border: 'none', background: activeTab === 'stats' ? '#004080' : '#4a6fa5', color: 'white' }}
          >
            📊 Statistics
          </button>
          <button 
            className={`tab-btn ${activeTab === "reservations" ? "active" : ""}`}
            onClick={() => setActiveTab("reservations")}
            style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '5px', border: 'none', background: activeTab === 'reservations' ? '#004080' : '#4a6fa5', color: 'white' }}
          >
            📅 Reservations
          </button>
        </div>
      </div>

      <h1>Owner Dashboard</h1>

      {activeTab === "stats" && (
        <section className="statistics">
          <h2>Business Overview</h2>
          <div className="charts">
            <div className="chart-container">
                <h3>Guests per Month (2025)</h3>
                <Bar ref={occupancyRef} data={monthlyGuestsData} />
            </div>
            <div className="chart-container">
                <h3>Most Requested Amenities</h3>
                <Bar 
                    ref={amenitiesRef} 
                    data={amenitiesData} 
                    options={{ 
                        indexAxis: 'y', 
                        plugins: { legend: { display: false } },
                        scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } }
                    }} 
                />
            </div>
            <div className="chart-container">
                <h3>Guests by Country</h3>
                <Pie ref={countryRef} data={guestsByCountryData} />
            </div>
            <div className="chart-container">
                <h3>Unit Popularity</h3>
                <Pie ref={servicesRef} data={popularServicesData} />
            </div>
          </div>
          <div className="export-buttons" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button 
              onClick={exportStatsPDF} 
              style={{ background: '#dc3545', color: 'white', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}
            >
              Export Stats PDF
            </button>
            <button 
              onClick={exportStatsXLSX} 
              style={{ background: '#28a745', color: 'white', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}
            >
              Export Stats Excel
            </button>
          </div>
        </section>
      )}

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
                <th>Amenities</th>
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
                    <td style={{ maxWidth: '250px' }}>
                      <div className="amenitiesTags">
                        {(r.selectedAmenities || r.amenities) ? (
                          (r.selectedAmenities || (Array.isArray(r.amenities) ? r.amenities.join(", ") : r.amenities))
                            .split(", ")
                            .map((am, i) => (
                              <span key={i} className="amenityTag">{am}</span>
                            ))
                        ) : <span className="detailValue">None</span>}
                      </div>
                    </td>
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
                <tr><td colSpan="6" style={{ textAlign: 'center' }}>No reservations found.</td></tr>
              )}
            </tbody>
          </table>

          <div className="reservation-cards">
            {reservations.map((r) => (
              <div key={r.idUnitReservation} className="reservation-card">
                <p><strong>Guest:</strong> {r.person?.name}</p>
                <p><strong>Unit:</strong> {r.unit?.unitName}</p>
                <p><strong>Dates:</strong> {r.startDate} - {r.endDate}</p>
                <div className="detailItem">
                  <strong>Amenities:</strong>
                  <div className="amenitiesTags">
                    {(r.selectedAmenities || r.amenities) ? (
                      (r.selectedAmenities || (Array.isArray(r.amenities) ? r.amenities.join(", ") : r.amenities))
                        .split(", ")
                        .map((am, i) => (
                          <span key={i} className="amenityTag">{am}</span>
                        ))
                    ) : <span className="detailValue">None</span>}
                  </div>
                </div>
                <p style={{ marginTop: '10px' }}><strong>Status:</strong> {r.status}</p>
                <div className="card-buttons">
                  {r.status === "Pending" && (
                    <>
                      <button className="confirm-btn" onClick={() => setPopup({ visible: true, action: "Confirm", reservationId: r.idUnitReservation })}>Confirm</button>
                      <button className="reject-btn" onClick={() => setPopup({ visible: true, action: "Reject", reservationId: r.idUnitReservation })}>Reject</button>
                    </>
                  )}
                  {r.status === "Confirmed" && (
                    <button className="reject-btn" onClick={() => handleUpdateStatus(r.idUnitReservation, "Cancelled")}>Cancel</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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