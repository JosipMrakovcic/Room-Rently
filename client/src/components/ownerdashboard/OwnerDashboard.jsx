import React, { useRef, useState, useEffect, useMemo } from "react";
import { Bar, Pie } from "react-chartjs-2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("activeDashboardTab") || "stats";
  });
  const [reservations, setReservations] = useState([]);
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState("all"); 
  const [popup, setPopup] = useState({ visible: false, action: "", reservationId: null });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedYear, selectedMonth]);

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/unitReservation/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReservations(response.data);
      
      const yearsInCloud = response.data.map(r => new Date(r.startDate).getFullYear()).filter(y => !isNaN(y));
      if (yearsInCloud.length > 0 && !yearsInCloud.includes(new Date().getFullYear())) {
        setSelectedYear(Math.max(...yearsInCloud));
      }
    } catch (err) {
      console.error("Greška pri dohvaćanju rezervacija:", err);
    }
  };

  const filteredReservations = useMemo(() => {
    const filtered = reservations.filter(res => {
        const date = new Date(res.startDate);
        const yearMatch = date.getFullYear() === selectedYear;
        const monthMatch = selectedMonth === "all" || date.getMonth() === Number(selectedMonth);
        return yearMatch && monthMatch;
    });
    return filtered.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  }, [reservations, selectedYear, selectedMonth]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReservations = filteredReservations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);

  const availableYears = useMemo(() => {
    const years = new Set();
    if (reservations.length === 0) { years.add(new Date().getFullYear()); }
    reservations.forEach(res => {
      if (res.startDate) {
        const y = new Date(res.startDate).getFullYear();
        if (!isNaN(y)) years.add(y);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [reservations]);

  const hasPreviousYear = useMemo(() => availableYears.some(y => y < selectedYear), [availableYears, selectedYear]);
  const hasNextYear = useMemo(() => availableYears.some(y => y > selectedYear), [availableYears, selectedYear]);

  const goToPreviousAvailableYear = () => {
    const prevYears = availableYears.filter(y => y < selectedYear);
    if (prevYears.length > 0) setSelectedYear(Math.max(...prevYears));
  };

  const goToNextAvailableYear = () => {
    const nextYears = availableYears.filter(y => y > selectedYear);
    if (nextYears.length > 0) setSelectedYear(Math.min(...nextYears));
  };

  const getReportTitle = () => {
    const monthName = selectedMonth === "all" ? "" : MONTHS[selectedMonth];
    return `${monthName} ${selectedYear}`.trim();
  };

  const topRatedStats = useMemo(() => {
    const unitRatings = {};
    filteredReservations.forEach(res => {
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
  }, [filteredReservations]);

  const monthlyStats = useMemo(() => {
    const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const guestCounts = new Array(12).fill(0);
    reservations.forEach(res => {
      const date = new Date(res.startDate);
      if (date.getFullYear() === selectedYear && VALID_STATS_STATUSES.includes(res.status)) {
        guestCounts[date.getMonth()] += (res.adults + (res.children || 0));
      }
    });
    return { labels: monthsShort, data: guestCounts };
  }, [reservations, selectedYear]);

  const amenitiesStats = useMemo(() => {
    const counts = {};
    filteredReservations.forEach(res => {
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
  }, [filteredReservations]);

  const unitStats = useMemo(() => {
    const counts = {};
    filteredReservations.forEach(res => {
      if (VALID_STATS_STATUSES.includes(res.status)) {
        const name = res.unit?.unitName || "Unknown";
        counts[name] = (counts[name] || 0) + 1;
      }
    });
    return { labels: Object.keys(counts), data: Object.values(counts) };
  }, [filteredReservations]);

  const countryStats = useMemo(() => {
    const counts = {};
    filteredReservations.forEach(res => {
      if (VALID_STATS_STATUSES.includes(res.status)) {
        const c = res.person?.country || "Other";
        counts[c] = (counts[c] || 0) + 1;
      }
    });
    return { labels: Object.keys(counts), data: Object.values(counts) };
  }, [filteredReservations]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.5,
    plugins: { legend: { position: 'bottom' } }
  };

  const topRatedData = { labels: topRatedStats.labels, datasets: [{ label: "Avg Rating", data: topRatedStats.data, backgroundColor: "#f1c40f" }] };
  const monthlyGuestsData = { labels: monthlyStats.labels, datasets: [{ label: "Total Guests", data: monthlyStats.data, backgroundColor: "#004080" }] };
  const amenitiesData = { labels: amenitiesStats.labels, datasets: [{ label: "Requests", data: amenitiesStats.data, backgroundColor: "rgba(75, 192, 192, 0.6)" }] };
  const guestsByCountryData = { labels: countryStats.labels, datasets: [{ label: "Guests", data: countryStats.data, backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"] }] };
  const popularServicesData = { labels: unitStats.labels, datasets: [{ label: "Reservations", data: unitStats.data, backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"] }] };

  // NADOPUNJENO: Error handling sa alertom koji pokazuje poruku s backenda
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/unitReservation/update-status/${id}`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      if (response.status === 200) {
        setReservations(prev => prev.map(r => r.idUnitReservation === id ? { ...r, status: newStatus, endDate: newStatus === "Completed" ? new Date().toISOString().split('T')[0] : r.endDate } : r));
      }
    } catch (err) { 
        console.error(err); 
        const msg = err.response?.data || "Greška pri ažuriranju statusa.";
        alert(`Action failed: ${msg}`); 
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

  const addChartToPDF = (doc, chartRef, x, y, width = 170, height = 90) => {
    const chart = chartRef.current;
    if (!chart) return y;
    const image = chart.toBase64Image();
    doc.addImage(image, "PNG", x, y, width, height);
    return y + height + 20;
  };

  const exportStatsPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = 20;

    doc.setFontSize(20);
    doc.setTextColor(0, 64, 128);
    doc.text(`Hotel Full Analytics Report`, pageWidth / 2, currentY, { align: "center" });
    
    doc.setFontSize(14);
    currentY += 10;
    doc.text(`Period: ${getReportTitle()}`, pageWidth / 2, currentY, { align: "center" });

    currentY = 45;

    doc.setFontSize(12);
    doc.text("1. Yearly Guest Traffic", 20, currentY - 5);
    currentY = addChartToPDF(doc, occupancyRef, 20, currentY);

    doc.text("2. Top Units by Rating", 20, currentY - 5);
    currentY = addChartToPDF(doc, topRatedRef, 20, currentY);

    doc.addPage();
    currentY = 20;

    doc.text("3. Most Requested Amenities", 20, currentY - 5);
    currentY = addChartToPDF(doc, amenitiesRef, 20, currentY);

    doc.text("4. Unit Popularity (Share)", 20, currentY - 5);
    currentY = addChartToPDF(doc, servicesRef, 20, currentY);

    if (countryStats.data.length > 0) {
        if (currentY > 200) { doc.addPage(); currentY = 20; }
        doc.text("5. Guests by Country", 20, currentY - 5);
        addChartToPDF(doc, countryRef, 20, currentY);
    }

    doc.save(`full_analytics_${getReportTitle().replace(" ", "_")}.pdf`);
  };

  const exportReservationsPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(18);
    doc.setTextColor(0, 64, 128);
    doc.text(`Reservations List - ${getReportTitle()}`, pageWidth / 2, 15, { align: "center" });

    const tableColumn = ["Guest", "Country", "Unit", "From", "To", "Status", "Rating"];
    const tableRows = filteredReservations.map(r => [
      r.person?.name,
      r.person?.country || "N/A",
      r.unit?.unitName,
      r.startDate,
      r.endDate,
      r.status,
      r.rating ? `${r.rating}*` : "-"
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 64, 128] }
    });

    doc.save(`reservations_${getReportTitle().replace(" ", "_")}.pdf`);
  };

  const downloadXML = (data, fileName) => {
    let xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';
    data.forEach(item => {
        xmlString += '  <item>\n';
        Object.entries(item).forEach(([key, value]) => {
            const cleanKey = key.replace(/\s+/g, '');
            xmlString += `    <${cleanKey}>${value}</${cleanKey}>\n`;
        });
        xmlString += '  </item>\n';
    });
    xmlString += '</root>';
    const blob = new Blob([xmlString], { type: 'application/xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };

  const exportReservationsXLSX = () => {
  const ws = XLSX.utils.json_to_sheet(
    filteredReservations.map((r) => ({
      ReservationID: r.idUnitReservation,
      GuestName: r.person?.name || "",
      GuestCountry: r.person?.country || "",
      UnitName: r.unit?.unitName || "",
      StartDate: r.startDate,
      EndDate: r.endDate,
      Status: r.status,
      Rating: r.rating || "",
      Adults: r.adults || 0,
      Children: r.children || 0,
      TotalGuests: (r.adults || 0) + (r.children || 0),
      Amenities: Array.isArray(r.selectedAmenities || r.amenities)
        ? (r.selectedAmenities || r.amenities).join(", ")
        : (r.selectedAmenities || r.amenities || "")
    }))
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reservations");
  XLSX.writeFile(wb, `reservations_${getReportTitle().replace(" ", "_")}.xlsx`);
};


  const exportReservationsXML = () => {
  const data = filteredReservations.map((r) => ({
    ReservationID: r.idUnitReservation,
    GuestName: r.person?.name || "",
    GuestCountry: r.person?.country || "",
    UnitName: r.unit?.unitName || "",
    StartDate: r.startDate,
    EndDate: r.endDate,
    Status: r.status,
    Rating: r.rating || "",
    Adults: r.adults || 0,
    Children: r.children || 0,
    TotalGuests: (r.adults || 0) + (r.children || 0),
    Amenities: Array.isArray(r.selectedAmenities || r.amenities)
      ? (r.selectedAmenities || r.amenities).join(", ")
      : (r.selectedAmenities || r.amenities || "")
  }));

  downloadXML(data, `reservations_${getReportTitle().replace(" ", "_")}.xml`);
};

  const exportStatsXLSX = () => {
  const wb = XLSX.utils.book_new();

  // ===== MONTHLY STATS =====
  const monthlyRows = MONTHS.map((monthName, i) => {
    const monthReservations = reservations.filter(r => {
      const d = new Date(r.startDate);
      return (
        d.getFullYear() === selectedYear &&
        d.getMonth() === i &&
        VALID_STATS_STATUSES.includes(r.status)
      );
    });

    const totalGuests = monthReservations.reduce(
      (sum, r) => sum + (r.adults || 0) + (r.children || 0),
      0
    );

    return {
      Year: selectedYear,
      Month: monthName,
      MonthIndex: i + 1,
      TotalGuests: totalGuests,
      TotalReservations: monthReservations.length,
      CompletedReservations: monthReservations.filter(r => r.status === "Completed").length,
      ConfirmedReservations: monthReservations.filter(r => r.status === "Confirmed").length,
      PendingReservations: monthReservations.filter(r => r.status === "Pending").length,
      AvgGuestsPerReservation:
        monthReservations.length > 0
          ? (totalGuests / monthReservations.length).toFixed(2)
          : 0
    };
  });

  const monthlyWS = XLSX.utils.json_to_sheet(monthlyRows);
  XLSX.utils.book_append_sheet(wb, monthlyWS, `MonthlyStatistics_${selectedYear}`);

  // ===== COUNTRY STATS =====
  const countryMap = {};

  reservations.forEach(r => {
    if (!VALID_STATS_STATUSES.includes(r.status)) return;

    const country = r.person?.country || "Unknown";
    const guests = (r.adults || 0) + (r.children || 0);

    if (!countryMap[country]) {
      countryMap[country] = {
        Country: country,
        TotalGuests: 0,
        TotalReservations: 0,
        CompletedReservations: 0,
        ConfirmedReservations: 0,
        PendingReservations: 0
      };
    }

    countryMap[country].TotalGuests += guests;
    countryMap[country].TotalReservations += 1;
    if (r.status === "Completed") countryMap[country].CompletedReservations += 1;
    if (r.status === "Confirmed") countryMap[country].ConfirmedReservations += 1;
    if (r.status === "Pending") countryMap[country].PendingReservations += 1;
  });

  const countryRows = Object.values(countryMap).map(c => ({
    ...c,
    AvgGuestsPerReservation:
      c.TotalReservations > 0
        ? (c.TotalGuests / c.TotalReservations).toFixed(2)
        : 0
  }));

  const countryWS = XLSX.utils.json_to_sheet(countryRows);
  XLSX.utils.book_append_sheet(wb, countryWS, `CountryStatistics_${selectedYear}`);

  XLSX.writeFile(wb, `analytics_${selectedYear}.xlsx`);
};



  const exportStatsXML = () => {
  // ===== MONTHLY STATS =====
  const monthlyStats = MONTHS.map((monthName, i) => {
    const monthReservations = reservations.filter(r => {
      const d = new Date(r.startDate);
      return (
        d.getFullYear() === selectedYear &&
        d.getMonth() === i &&
        VALID_STATS_STATUSES.includes(r.status)
      );
    });

    const totalGuests = monthReservations.reduce(
      (sum, r) => sum + (r.adults || 0) + (r.children || 0),
      0
    );

    return {
      Year: selectedYear,
      Month: monthName,
      MonthIndex: i + 1,
      TotalGuests: totalGuests,
      TotalReservations: monthReservations.length,
      CompletedReservations: monthReservations.filter(r => r.status === "Completed").length,
      ConfirmedReservations: monthReservations.filter(r => r.status === "Confirmed").length,
      PendingReservations: monthReservations.filter(r => r.status === "Pending").length,
      AvgGuestsPerReservation:
        monthReservations.length > 0
          ? (totalGuests / monthReservations.length).toFixed(2)
          : 0
    };
  });

  // ===== COUNTRY STATS =====
  const countryMap = {};

  reservations.forEach(r => {
    if (!VALID_STATS_STATUSES.includes(r.status)) return;

    const country = r.person?.country || "Unknown";
    const guests = (r.adults || 0) + (r.children || 0);

    if (!countryMap[country]) {
      countryMap[country] = {
        Country: country,
        TotalGuests: 0,
        TotalReservations: 0,
        CompletedReservations: 0,
        ConfirmedReservations: 0,
        PendingReservations: 0
      };
    }

    countryMap[country].TotalGuests += guests;
    countryMap[country].TotalReservations += 1;
    if (r.status === "Completed") countryMap[country].CompletedReservations += 1;
    if (r.status === "Confirmed") countryMap[country].ConfirmedReservations += 1;
    if (r.status === "Pending") countryMap[country].PendingReservations += 1;
  });

  const countryStats = Object.values(countryMap).map(c => ({
    ...c,
    AvgGuestsPerReservation:
      c.TotalReservations > 0
        ? (c.TotalGuests / c.TotalReservations).toFixed(2)
        : 0
  }));

  // ===== COMBINED XML =====
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n`;

  xml += `  <monthlyStats>\n`;
  monthlyStats.forEach(item => {
    xml += `    <item>\n`;
    Object.entries(item).forEach(([k, v]) => {
      xml += `      <${k}>${v}</${k}>\n`;
    });
    xml += `    </item>\n`;
  });
  xml += `  </monthlyStats>\n`;

  xml += `  <countryStats>\n`;
  countryStats.forEach(item => {
    xml += `    <item>\n`;
    Object.entries(item).forEach(([k, v]) => {
      xml += `      <${k}>${v}</${k}>\n`;
    });
    xml += `    </item>\n`;
  });
  xml += `  </countryStats>\n`;

  xml += `</root>`;

  const blob = new Blob([xml], { type: "application/xml" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `analytics_${selectedYear}.xml`;
  link.click();
};



  // NADOPUNJENO: Gumb Complete je disabled i prozirniji ako gost nije prenoćio
  const renderActionButtons = (r) => {
    if (r.status === "Pending") {
      return (
        <div className="action-buttons-flex">
          <button className="confirm-btn" onClick={() => setPopup({ visible: true, action: "Confirm", reservationId: r.idUnitReservation })}>Confirm</button>
          <button className="reject-btn" onClick={() => setPopup({ visible: true, action: "Reject", reservationId: r.idUnitReservation })}>Reject</button>
        </div>
      );
    }
    if (r.status === "Confirmed") {
      const startDate = new Date(r.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const canComplete = today > startDate;

      return (
        <div className="action-buttons-flex">
          <button 
            className="complete-btn" 
            onClick={() => setPopup({ visible: true, action: "Complete", reservationId: r.idUnitReservation })}
            disabled={!canComplete}
            style={{ opacity: canComplete ? 1 : 0.5, cursor: canComplete ? "pointer" : "not-allowed" }}
            title={!canComplete ? "At least one night must pass" : ""}
          >
            Complete
          </button>
          <button className="cancel-btn" onClick={() => setPopup({ visible: true, action: "Cancel", reservationId: r.idUnitReservation })}>Cancel</button>
        </div>
      );
    }
    if (r.status === "Completed") return <span className="no-actions-text">Completed ✔️</span>;
    return <span className="no-actions-text">{r.status}</span>;
  };

  return (
    <div className="owner-dashboard">
      <div className="dashboard-header">
        <button className="return-btn" onClick={() => navigate("/main")}>⬅ Return</button>
        <div className="tab-navigation">
          <button className={`tab-btn ${activeTab === "stats" ? "active" : ""}`} onClick={() => setActiveTab("stats")}>📊 Statistics</button>
          <button className={`tab-btn ${activeTab === "reservations" ? "active" : ""}`} onClick={() => setActiveTab("reservations")}>📅 Reservations</button>
        </div>
      </div>

      <div className="title-row-global">
        <h1>Owner Dashboard</h1>
        <div className="filters-container-global">
          <div className="year-selector">
              <button className="year-nav-btn" onClick={goToPreviousAvailableYear} disabled={!hasPreviousYear}>◀</button>
              <div className="year-display">
                  <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="year-select-dropdown">
                      {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
              </div>
              <button className="year-nav-btn" onClick={goToNextAvailableYear} disabled={!hasNextYear}>▶</button>
          </div>

          <div className="month-selector">
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)} 
              className="year-select-dropdown month-dropdown"
            >
              <option value="all">All Months</option>
              {MONTHS.map((m, idx) => (
                <option key={m} value={idx}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {activeTab === "stats" && (
        <section className="statistics">
          <h2>Business Overview ({getReportTitle()})</h2>
          <div className="charts-grid">
            <div className="chart-container">
                <h3>Top Units by Rating ({selectedMonth === "all" ? "Yearly" : MONTHS[selectedMonth]})</h3>
                <Bar ref={topRatedRef} data={topRatedData} options={{ ...chartOptions, scales: { y: { beginAtZero: true, max: 10 } } }} />
            </div>
            <div className="chart-container">
                <h3>Yearly Traffic ({selectedYear})</h3>
                <Bar ref={occupancyRef} data={monthlyGuestsData} options={chartOptions} />
            </div>
            <div className="chart-container">
                <h3>Amenities ({getReportTitle()})</h3>
                <Bar ref={amenitiesRef} data={amenitiesData} options={{ ...chartOptions, indexAxis: 'y' }} />
            </div>
            <div className="chart-container">
                <h3>Popularity ({getReportTitle()})</h3>
                <Pie ref={servicesRef} data={popularServicesData} options={chartOptions} />
            </div>
            <div className="chart-container">
                <h3>Guests by Country ({getReportTitle()})</h3>
                <Pie ref={countryRef} data={countryStats.data.length > 0 ? guestsByCountryData : {labels:[], datasets:[]}} options={chartOptions} />
            </div>
          </div>
          <div className="export-buttons-group">
            <button className="export-pdf-btn" onClick={exportStatsPDF}>Export PDF Report</button>
            <button className="export-xlsx-btn" onClick={exportStatsXLSX}>Export Excel</button>
            <button className="export-xml-btn" onClick={exportStatsXML}>Export XML</button>
          </div>
        </section>
      )}

      {activeTab === "reservations" && (
        <section className="reservations">
          <div className="reservations-header-row">
            <h2>Manage Reservations ({getReportTitle()})</h2>
            <div className="export-buttons-group">
                <button className="export-pdf-btn" onClick={exportReservationsPDF}>Export PDF</button>
                <button className="export-xlsx-btn" onClick={exportReservationsXLSX}>Export Excel</button>
                <button className="export-xml-btn" onClick={exportReservationsXML}>Export XML</button>
            </div>
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
              {currentReservations.length > 0 ? (
                currentReservations.map((r) => (
                  <tr key={r.idUnitReservation}>
                    <td>
                        <div className="guest-name-cell">{r.person?.name}</div>
                        <div className="guest-country-cell">📍 {r.person?.country || "N/A"}</div>
                    </td>
                    <td>{r.unit?.unitName}</td>
                    <td>{r.startDate} to {r.endDate}</td>
                    <td>
                      <div className="amenitiesTags">
                        {(r.selectedAmenities || r.amenities) ? (
                          (r.selectedAmenities || (Array.isArray(r.amenities) ? r.amenities.join(", ") : r.amenities))
                            .split(", ")
                            .map((am, i) => <span key={i} className="amenityTag">{am}</span>)
                        ) : "None"}
                      </div>
                    </td>
                    <td><span className={`status-badge ${r.status.toLowerCase()}`}>{r.status}</span></td>
                    <td className="rating-cell">{r.rating ? `${r.rating} ⭐` : "-"}</td>
                    <td>{renderActionButtons(r)}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="no-data-cell">No reservations found for {getReportTitle()}.</td></tr>
              )}
            </tbody>
          </table>

          <div className="reservation-cards">
            {currentReservations.length > 0 ? (
              currentReservations.map((r) => (
                <div key={r.idUnitReservation} className="reservation-card">
                  <div className="card-header">
                    <strong>{r.person?.name}</strong>
                    <span className={`status-badge ${r.status.toLowerCase()}`}>{r.status}</span>
                  </div>
                  <div className="card-body">
                    <p>🏠 <strong>Unit:</strong> {r.unit?.unitName}</p>
                    <p>📅 <strong>Dates:</strong> {r.startDate} - {r.endDate}</p>
                    <p>📍 <strong>Country:</strong> {r.person?.country || "N/A"}</p>
                    <div className="amenitiesTags">
                       {(r.selectedAmenities || r.amenities) ? (
                          (r.selectedAmenities || (Array.isArray(r.amenities) ? r.amenities.join(", ") : r.amenities))
                            .split(", ")
                            .map((am, i) => <span key={i} className="amenityTag">{am}</span>)
                        ) : "None"}
                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="card-rating">{r.rating ? `${r.rating} ⭐` : "No rating"}</div>
                    <div className="card-buttons">
                      {renderActionButtons(r)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data-cell">No reservations found.</p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination-container">
              <button 
                className="pagination-btn" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              <span className="pagination-info">
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
              </span>

              <button 
                className="pagination-btn" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </section>
      )}

      {popup.visible && (
        <div className="popup-overlay">
          <div className="popup">
            <p>Are you sure you want to <strong>{popup.action.toLowerCase()}</strong> this reservation?</p>
            <div className="popup-buttons">
              <button 
                onClick={confirmAction} 
                className={(popup.action === "Reject" || popup.action === "Cancel") ? "reject-btn" : "confirm-btn"}
              >
                {popup.action}
              </button>
              <button onClick={() => setPopup({ visible: false, action: "", reservationId: null })} className="return-btn" style={{marginBottom: 0}}>Back</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}