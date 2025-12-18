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
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("activeDashboardTab") || "stats";
  });
  const [reservations, setReservations] = useState([]);
  
  const [popup, setPopup] = useState({ visible: false, action: "", reservationId: null });

  const occupancyRef = useRef(null);
  const countryRef = useRef(null);
  const servicesRef = useRef(null);
  const amenitiesRef = useRef(null);
  const topRatedRef = useRef(null);

  const VALID_STATS_STATUSES = ["Confirmed", "Completed", "Pending"];

  useEffect(() => {
    const savedUser = localStorage.getItem("googleUser");
    const user = savedUser ? JSON.parse(savedUser) : null;

    if (!user || !user.is_owner) {
      navigate("/main");
      return;
    }
    fetchReservations();
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem("activeDashboardTab", activeTab);
  }, [activeTab]);

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

  const topRatedStats = useMemo(() => {
    const unitRatings = {};
    reservations.forEach(res => {
      if (res.status === "Completed" && res.rating && res.unit?.unitName) {
        const name = res.unit.unitName;
        if (!unitRatings[name]) unitRatings[name] = { sum: 0, count: 0 };
        unitRatings[name].sum += res.rating;
        unitRatings[name].count += 1;
      }
    });
    const averages = Object.keys(unitRatings).map(name => ({
      name,
      avg: unitRatings[name].sum / unitRatings[name].count
    }));
    const sorted = averages.sort((a, b) => b.avg - a.avg).slice(0, 10);
    return { labels: sorted.map(i => i.name), data: sorted.map(i => i.avg.toFixed(1)) };
  }, [reservations]);

  const monthlyStats = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const guestCounts = new Array(12).fill(0);
    reservations.forEach(res => {
      const date = new Date(res.startDate);
      if (date.getFullYear() === 2025 && VALID_STATS_STATUSES.includes(res.status)) {
        guestCounts[date.getMonth()] += (res.adults + (res.children || 0));
      }
    });
    return { labels: months, data: guestCounts };
  }, [reservations]);

  const amenitiesStats = useMemo(() => {
    const counts = {};
    reservations.forEach(res => {
      if (!VALID_STATS_STATUSES.includes(res.status)) return;
      let amenityList = [];
      const rawAmenities = res.selectedAmenities || res.amenities;
      if (Array.isArray(rawAmenities)) amenityList = rawAmenities;
      else if (typeof rawAmenities === "string" && rawAmenities.trim() !== "") {
        amenityList = rawAmenities.split(",").map(item => item.trim());
      }
      amenityList.forEach(amenity => {
        const formattedName = amenity.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
        if (formattedName) counts[formattedName] = (counts[formattedName] || 0) + 1;
      });
    });
    const sortedLabels = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    return { labels: sortedLabels, data: sortedLabels.map(l => counts[l]) };
  }, [reservations]);

  const unitStats = useMemo(() => {
    const counts = {};
    reservations.forEach(res => {
      if (VALID_STATS_STATUSES.includes(res.status)) {
        const name = res.unit?.unitName || "Unknown";
        counts[name] = (counts[name] || 0) + 1;
      }
    });
    return { labels: Object.keys(counts), data: Object.values(counts) };
  }, [reservations]);

  // ISPRAVLJENO: Dohvaćanje države preko person objekta
  const countryStats = useMemo(() => {
    const counts = {};
    reservations.forEach(res => {
      if (VALID_STATS_STATUSES.includes(res.status)) {
        // Pristupamo country polju unutar person objekta
        const c = res.person?.country || "Other";
        counts[c] = (counts[c] || 0) + 1;
      }
    });
    return { labels: Object.keys(counts), data: Object.values(counts) };
  }, [reservations]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.5,
    plugins: { legend: { position: 'bottom' } }
  };

  const topRatedData = {
    labels: topRatedStats.labels,
    datasets: [{ label: "Avg Rating", data: topRatedStats.data, backgroundColor: "#f1c40f" }]
  };

  const monthlyGuestsData = {
    labels: monthlyStats.labels,
    datasets: [{ label: "Total Guests", data: monthlyStats.data, backgroundColor: "#004080" }]
  };

  const amenitiesData = { 
    labels: amenitiesStats.labels, 
    datasets: [{ label: "Requests", data: amenitiesStats.data, backgroundColor: "rgba(75, 192, 192, 0.6)" }] 
  };

  const guestsByCountryData = { 
    labels: countryStats.labels, 
    datasets: [{ 
        label: "Guests", 
        data: countryStats.data, 
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"] 
    }] 
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
          prev.map((r) => {
            if (r.idUnitReservation === id) {
              // Ako je novo stanje Completed, ažuriramo i status i endDate u UI-ju
              return { 
                ...r, 
                status: newStatus,
                endDate: newStatus === "Completed" ? new Date().toISOString().split('T')[0] : r.endDate 
              };
            }
            return r;
          })
        );
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Greška pri ažuriranju statusa.");
    }
  };

  const confirmAction = () => {
    let finalStatus = "";
    switch (popup.action) {
      case "Confirm": finalStatus = "Confirmed"; break;
      case "Reject": finalStatus = "Rejected"; break;
      case "Complete": finalStatus = "Completed"; break;
      case "Cancel": finalStatus = "Cancelled"; break;
      default: return;
    }

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
    doc.setTextColor(0, 64, 128);
    doc.text("Hotel Statistics Report - 2025", pageWidth / 2, 20, { align: "center" });
    addChartToPDF(doc, occupancyRef, 20, 40, 170, 80);
    doc.text("Top Units by Rating", 20, 135);
    addChartToPDF(doc, topRatedRef, 20, 140, 170, 80);
    doc.save("hotel_detailed_statistics.pdf");
  };

  const exportReservationsXLSX = () => {
    const ws = XLSX.utils.json_to_sheet(
      reservations.map((r) => ({
        Guest: r.person?.name,
        Country: r.person?.country || "N/A", // Dodano u Excel
        Unit: r.unit?.unitName,
        From: r.startDate,
        To: r.endDate,
        Status: r.status,
        Rating: r.rating || "N/A"
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reservations");
    XLSX.writeFile(wb, "hotel_reservations.xlsx");
  };

  const exportStatsXLSX = () => {
    const wb = XLSX.utils.book_new();
    const monthlyWS = XLSX.utils.json_to_sheet(monthlyStats.labels.map((l, i) => ({ Month: l, Guests: monthlyStats.data[i] })));
    XLSX.utils.book_append_sheet(wb, monthlyWS, "Monthly Stats");
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
          <div className="charts" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <div className="chart-container">
                <h3>Top 10 Units (Guest Rating)</h3>
                <Bar ref={topRatedRef} data={topRatedData} options={{ ...chartOptions, scales: { y: { beginAtZero: true, max: 10 } } }} />
            </div>
            <div className="chart-container">
                <h3>Guests per Month (2025)</h3>
                <Bar ref={occupancyRef} data={monthlyGuestsData} options={chartOptions} />
            </div>
            <div className="chart-container">
                <h3>Most Requested Amenities</h3>
                <Bar ref={amenitiesRef} data={amenitiesData} options={{ ...chartOptions, indexAxis: 'y' }} />
            </div>
            <div className="chart-container">
                <h3>Unit Popularity (Bookings)</h3>
                <Pie ref={servicesRef} data={popularServicesData} options={chartOptions} />
            </div>
            <div className="chart-container">
                <h3>Guests by Country</h3>
                <Pie ref={countryRef} data={countryStats.data.length > 0 ? guestsByCountryData : {labels:[], datasets:[]}} options={chartOptions} />
            </div>
          </div>
          <div className="export-buttons" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button onClick={exportStatsPDF} style={{ background: '#dc3545', color: 'white', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}>Export Stats PDF</button>
            <button onClick={exportStatsXLSX} style={{ background: '#28a745', color: 'white', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}>Export Stats Excel</button>
          </div>
        </section>
      )}

      {activeTab === "reservations" && (
        <section className="reservations">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Manage Reservations</h2>
            <button className="export-btn" onClick={exportReservationsXLSX} style={{ background: '#28a745', color: 'white' }}>Export to Excel (XLSX)</button>
          </div>
          
          <table className="reservation-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Unit</th>
                <th>Dates</th>
                <th>Amenities</th>
                <th>Status</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.length > 0 ? (
                reservations.map((r) => (
                  <tr key={r.idUnitReservation}>
                    {/* MODIFICIRANO: Dodana država uz ime gosta u tablicu */}
                    <td>
                        <div style={{ fontWeight: 'bold' }}>{r.person?.name}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>📍 {r.person?.country || "N/A"}</div>
                    </td>
                    <td>{r.unit?.unitName}</td>
                    <td>{r.startDate} to {r.endDate}</td>
                    <td>
                      <div className="amenitiesTags">
                        {(r.selectedAmenities || r.amenities) ? (
                          (r.selectedAmenities || (Array.isArray(r.amenities) ? r.amenities.join(", ") : r.amenities))
                            .split(", ")
                            .map((am, i) => (
                              <span key={i} className="amenityTag">{am}</span>
                            ))
                        ) : "None"}
                      </div>
                    </td>
                    <td><span className={`status-badge ${r.status.toLowerCase()}`}>{r.status}</span></td>
                    <td style={{ fontWeight: 'bold', color: '#f1c40f' }}>{r.rating ? `${r.rating} ⭐` : "-"}</td>
                    <td>
                      {r.status === "Pending" && (
                        <>
                          <button className="confirm-btn" onClick={() => setPopup({ visible: true, action: "Confirm", reservationId: r.idUnitReservation })}>Confirm</button>
                          <button className="reject-btn" onClick={() => setPopup({ visible: true, action: "Reject", reservationId: r.idUnitReservation })}>Reject</button>
                        </>
                      )}
                      {r.status === "Confirmed" && (
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button 
                            className="confirm-btn" 
                            style={{ background: '#28a745' }} 
                            onClick={() => setPopup({ visible: true, action: "Complete", reservationId: r.idUnitReservation })}
                          >
                            Complete
                          </button>
                          <button 
                            className="reject-btn" 
                            onClick={() => setPopup({ visible: true, action: "Cancel", reservationId: r.idUnitReservation })}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      {r.status === "Completed" && <span style={{ color: '#6c757d', fontSize: '12px' }}>No actions</span>}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" style={{ textAlign: 'center' }}>No reservations found.</td></tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      {popup.visible && (
        <div className="popup-overlay">
          <div className="popup">
            <p>Are you sure you want to <strong>{popup.action.toLowerCase()}</strong> this reservation?</p>
            <div className="popup-buttons">
              <button onClick={confirmAction} className="confirm-btn">{popup.action}</button>
              <button onClick={() => setPopup({ visible: false, action: "", reservationId: null })} className="reject-btn">Back</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}