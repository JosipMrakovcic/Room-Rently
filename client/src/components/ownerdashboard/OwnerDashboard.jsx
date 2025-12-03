import React, { useRef, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import "./OwnerDashboard.css";
import { useNavigate } from "react-router-dom";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const goBack = () => navigate("/main");

  const occupancyRef = useRef(null);
  const countryRef = useRef(null);
  const servicesRef = useRef(null);

  const [reservations, setReservations] = useState([
    { idUnitReservation: 1, startDate: "2025-12-01", endDate: "2025-12-05", status: "Confirmed", person: { id: 1, name: "Ivan Horvat" }, unit: { unitName: "Room 101" } },
    { idUnitReservation: 2, startDate: "2025-12-03", endDate: "2025-12-07", status: "Pending", person: { id: 2, name: "Anna Müller" }, unit: { unitName: "Room 102" } },
    { idUnitReservation: 3, startDate: "2025-12-02", endDate: "2025-12-06", status: "Confirmed", person: { id: 3, name: "John Smith" }, unit: { unitName: "Suite 201" } },
  ]);

  const [popup, setPopup] = useState({ visible: false, action: "", reservationId: null });

  // Charts
  const occupancyData = { labels: ["Room 101", "Room 102", "Suite 201"], datasets: [{ label: "Occupancy (%)", data: [70, 85, 60], backgroundColor: "rgba(75, 192, 192, 0.6)" }] };
  const guestsByCountryData = { labels: ["Croatia", "Germany", "USA", "Italy"], datasets: [{ label: "Guests by Country", data: [40, 30, 20, 10], backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"] }] };
  const popularServicesData = { labels: ["Breakfast", "WiFi", "Parking"], datasets: [{ label: "Popular Services", data: [50, 80, 30], backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"] }] };

  const addChartToPDF = (doc, chartRef, x, y, width = 140, height = 90) => {
    const chart = chartRef.current;
    if (!chart) return;
    const image = chart.toBase64Image();
    doc.addImage(image, "PNG", x, y, width, height);
  };

  const exportStatsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Hotel Statistics", 20, 20);
    doc.setFontSize(12);
    doc.text("Occupancy", 20, 32);
    addChartToPDF(doc, occupancyRef, 20, 35);
    doc.text("Guests by Country", 20, 135);
    addChartToPDF(doc, countryRef, 20, 140);
    doc.addPage();
    doc.text("Popular Services", 20, 20);
    addChartToPDF(doc, servicesRef, 20, 30);
    doc.save("hotel_statistics.pdf");
  };

  const exportStatsXLSX = () => {
    const ws = XLSX.utils.json_to_sheet([
      { Occupancy: occupancyData.datasets[0].data.join(", ") },
      { GuestsByCountry: guestsByCountryData.datasets[0].data.join(", ") },
      { PopularServices: popularServicesData.datasets[0].data.join(", ") }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stats");
    XLSX.writeFile(wb, "hotel_statistics.xlsx");
  };

  const exportReservationsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Current Reservations", 20, 20);
    doc.setFontSize(12);
    reservations.forEach((r, i) => {
      doc.text(`${r.person.name} | ${r.unit.unitName} | ${r.startDate} - ${r.endDate} | Status: ${r.status}`, 20, 35 + i * 10);
    });
    doc.save("reservations.pdf");
  };

  const exportReservationsXLSX = () => {
    const ws = XLSX.utils.json_to_sheet(
      reservations.map((r) => ({ Guest: r.person.name, Unit: r.unit.unitName, StartDate: r.startDate, EndDate: r.endDate, Status: r.status }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reservations");
    XLSX.writeFile(wb, "reservations.xlsx");
  };

  const handleActionClick = (action, reservationId) => {
    setPopup({ visible: true, action, reservationId });
  };

  const confirmAction = () => {
    setReservations((prev) =>
      prev.map((r) =>
        r.idUnitReservation === popup.reservationId
          ? { ...r, status: popup.action === "Confirm" ? "Confirmed" : "Rejected" }
          : r
      )
    );
    setPopup({ visible: false, action: "", reservationId: null });
  };

  const cancelAction = () => {
    setPopup({ visible: false, action: "", reservationId: null });
  };

  return (
    <div className="owner-dashboard">
      <button className="return-btn" onClick={goBack}>⬅ Return</button>
      <h1>Owner Dashboard</h1>

      <section className="statistics">
        <h2>Statistics</h2>
        <div className="charts">
          <div className="chart-container"><Bar ref={occupancyRef} data={occupancyData} /></div>
          <div className="chart-container"><Pie ref={countryRef} data={guestsByCountryData} /></div>
          <div className="chart-container"><Pie ref={servicesRef} data={popularServicesData} /></div>
        </div>
        <div className="export-buttons">
          <button onClick={exportStatsPDF}>Export Stats PDF</button>
          <button onClick={exportStatsXLSX}>Export Stats XLSX</button>
        </div>
      </section>

      <section className="reservations">
        <h2>Current Reservations</h2>
        <div className="reservation-container">
          <table className="reservation-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Unit</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.idUnitReservation}>
                  <td>{r.person.name}</td>
                  <td>{r.unit.unitName}</td>
                  <td>{r.startDate}</td>
                  <td>{r.endDate}</td>
                  <td>{r.status}</td>
                  <td>
                    {r.status === "Pending" && (
                      <>
                        <button className="confirm-btn" onClick={() => handleActionClick("Confirm", r.idUnitReservation)}>Confirm</button>
                        <button className="reject-btn" onClick={() => handleActionClick("Reject", r.idUnitReservation)}>Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="reservation-cards">
            {reservations.map((r) => (
              <div key={r.idUnitReservation} className="reservation-card">
                <p><strong>Guest:</strong> {r.person.name}</p>
                <p><strong>Unit:</strong> {r.unit.unitName}</p>
                <p><strong>Start:</strong> {r.startDate}</p>
                <p><strong>End:</strong> {r.endDate}</p>
                <p><strong>Status:</strong> {r.status}</p>
                {r.status === "Pending" && (
                  <div className="card-buttons">
                    <button className="confirm-btn" onClick={() => handleActionClick("Confirm", r.idUnitReservation)}>Confirm</button>
                    <button className="reject-btn" onClick={() => handleActionClick("Reject", r.idUnitReservation)}>Reject</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="export-buttons">
          <button onClick={exportReservationsPDF}>Export Reservations PDF</button>
          <button onClick={exportReservationsXLSX}>Export Reservations XLSX</button>
        </div>
      </section>

      {popup.visible && (
        <div className="popup-overlay">
          <div className="popup">
            <p>Are you sure you want to {popup.action} this reservation?</p>
            <div className="popup-buttons">
              <button onClick={confirmAction} className="confirm-btn">{popup.action}</button>
              <button onClick={cancelAction} className="reject-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
