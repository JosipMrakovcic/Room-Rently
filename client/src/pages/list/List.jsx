import React, { useState, useEffect } from "react";
import "./list.css";
import Navbar from "../../components/navbar/navbar";
import Header from "../../components/header/Header";
import { useLocation, useNavigate } from "react-router-dom";
import Searchitem from "../../components/searchitem/searchitem";
import axios from "axios";
import { format, differenceInCalendarDays, addDays } from "date-fns";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const List = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const location = useLocation();
  const navigate = useNavigate();

  // 1. DOHVAĆANJE SPREMLJENIH PODATAKA
  const savedSearch = JSON.parse(sessionStorage.getItem("lastSearch"));

  // 2. INICIJALIZACIJA STANJA
  const [destination, setDestination] = useState(
    savedSearch?.destination ?? location.state?.destination ?? ""
  );
  const [adults, setAdults] = useState(
    savedSearch?.options?.adult ?? location.state?.options?.adult ?? 1
  );
  const [children, setChildren] = useState(
    savedSearch?.options?.children ?? location.state?.options?.children ?? 0
  );
  const [room, setRoom] = useState(
    savedSearch?.options?.room ?? location.state?.options?.room ?? 1
  );

  const [beds, setBeds] = useState(
    savedSearch?.options?.beds ?? location.state?.beds ?? 1
  );

  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDate, setOpenDate] = useState(false);

  // Dodatni filteri
  const [isApartment, setIsApartment] = useState(savedSearch?.isApartment ?? null);
  const [seaView, setSeaView] = useState(savedSearch?.seaView ?? location.state?.seaView ?? false);
  const [lakeView, setLakeView] = useState(savedSearch?.lakeView ?? location.state?.lakeView ?? false);
  const [villageView, setVillageView] = useState(savedSearch?.villageView ?? location.state?.villageView ?? false);
  const [hasParking, setHasParking] = useState(savedSearch?.hasParking ?? false);
  const [hasWifi, setHasWifi] = useState(savedSearch?.hasWifi ?? false);
  const [hasBreakfast, setHasBreakfast] = useState(savedSearch?.hasBreakfast ?? false);
  const [hasAirConditioning, setHasAirConditioning] = useState(savedSearch?.hasAirConditioning ?? false);
  const [hasTowels, setHasTowels] = useState(savedSearch?.hasTowels ?? false);
  const [hasShampoo, setHasShampoo] = useState(savedSearch?.hasShampoo ?? false);
  const [hasHairDryer, setHasHairDryer] = useState(savedSearch?.hasHairDryer ?? false);
  const [hasHeater, setHasHeater] = useState(savedSearch?.hasHeater ?? false);

  const [openAmenities, setOpenAmenities] = useState(false);
  const [openViews, setOpenViews] = useState(false);
  const [minPrice, setMinPrice] = useState(savedSearch?.minPrice ?? null);
  const [maxPrice, setMaxPrice] = useState(savedSearch?.maxPrice ?? null);

  const [dates, setDates] = useState(() => {
    if (location.state?.date) return location.state.date;

    if (location.state?.seaView || location.state?.lakeView || location.state?.villageView) {
      return [{ startDate: null, endDate: null, key: "selection" }];
    }

    if (savedSearch?.dates) {
      // Re-konverzija string datuma iz session storage-a natrag u Date objekte
      return savedSearch.dates.map(d => ({
        startDate: d.startDate ? new Date(d.startDate) : null,
        endDate: d.endDate ? new Date(d.endDate) : null,
        key: d.key
      }));
    }

    return [
      {
        startDate: new Date(),
        endDate: addDays(new Date(), 1),
        key: "selection",
      },
    ];
  });

  const nightCount = (dates[0].startDate && dates[0].endDate)
    ? differenceInCalendarDays(dates[0].endDate, dates[0].startDate)
    : 0;

  // 3. SPREMANJE U SESSION STORAGE
  useEffect(() => {
    const searchData = {
      destination,
      options: { adult: adults, children, room, beds },
      isApartment,
      seaView,
      lakeView,
      villageView,
      hasParking,
      hasWifi,
      hasBreakfast,
      hasAirConditioning,
      hasTowels,
      hasShampoo,
      hasHairDryer,
      hasHeater,
      minPrice,
      maxPrice,
      dates
    };
    sessionStorage.setItem("lastSearch", JSON.stringify(searchData));
  }, [destination, adults, children, room, beds, isApartment, seaView, lakeView, villageView, hasParking, hasWifi, hasBreakfast, hasAirConditioning, hasTowels, hasShampoo, hasHairDryer, hasHeater, minPrice, maxPrice, dates]);

  const handleBack = () => {
    navigate("/main");
  };

  const handleAccommodationChange = (value) => {
    const isRoom = value === 'false';
    const newIsApartment = value === 'null' ? null : !isRoom;
    setIsApartment(newIsApartment);
    if (isRoom) {
      setRoom(1);
    }
  };

  const handleSearch = async () => {
    if (dates[0].startDate && dates[0].endDate && nightCount <= 0) {
      alert("Please select at least one night. Departure date must be after arrival date.");
      return;
    }

    setLoading(true);
    try {
      const startDateStr = dates[0].startDate ? format(dates[0].startDate, "yyyy-MM-dd") : null;
      const endDateStr = dates[0].endDate ? format(dates[0].endDate, "yyyy-MM-dd") : null;

      const parsedMinPrice = minPrice ? parseFloat(minPrice) : null;
      const parsedMaxPrice = maxPrice ? parseFloat(maxPrice) : null;

      // PROMJENA: Očišćen poziv, samo jedan axios.get
      const res = await axios.get(`${API_URL}/unit/filter`, {
        params: {
          name: destination.trim() === '' ? null : destination,
          adults,
          children,
          isApartment: isApartment,
          rooms: room,
          beds: beds,
          seaView: seaView || null,
          lakeView: lakeView || null,
          villageView: villageView || null,
          hasParking: hasParking || null,
          hasWifi: hasWifi || null,
          hasBreakfast: hasBreakfast || null,
          hasAirConditioning: hasAirConditioning || null,
          hasTowels: hasTowels || null,
          hasShampoo: hasShampoo || null,
          hasHairDryer: hasHairDryer || null,
          hasHeater: hasHeater || null,
          minPrice: parsedMinPrice,
          maxPrice: parsedMaxPrice,
          startDate: startDateStr,
          endDate: endDateStr,
        },
      });
      
      // PROMJENA: Direktno setiranje podataka bez dodatnog filtera u Reactu
      setUnits(res.data); 
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const handleViewChange = (viewName) => {
    if (viewName === 'sea') {
      const newState = !seaView;
      setSeaView(newState);
      if (newState) {
        setLakeView(false);
        setVillageView(false);
      }
    } else if (viewName === 'lake') {
      const newState = !lakeView;
      setLakeView(newState);
      if (newState) {
        setSeaView(false);
        setVillageView(false);
      }
    } else if (viewName === 'village') {
      const newState = !villageView;
      setVillageView(newState);
      if (newState) {
        setSeaView(false);
        setLakeView(false);
      }
    }
  };

  return (
    <div>
      <Navbar />
      <Header type="list" />

      <div className="listcontainer">
        <div className="listwrapper">
          <div className="listsearch">
            <button
              onClick={handleBack}
              style={{
                width: "100%", padding: "10px", marginBottom: "20px", backgroundColor: "#fff",
                color: "#0071c2", border: "1px solid #0071c2", borderRadius: "5px",
                cursor: "pointer", fontWeight: "bold", display: "flex",
                alignItems: "center", justifyContent: "center", gap: "10px"
              }}
            >
              ⬅ Back to Home
            </button>

            <h1 className="lstitle">Search</h1>

            <div className="lsitem">
              <label>Apartment name</label>
              <input
                type="text"
                placeholder="Apartment name"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>

            <div className="lsitem">
              <label>Check-in Date</label>
              <span onClick={() => setOpenDate(!openDate)} className="lsDateDisplay" style={{ backgroundColor: "white", padding: "8px", cursor: "pointer", borderRadius: "3px" }}>
                {dates[0].startDate && dates[0].endDate
                  ? `${format(dates[0].startDate, "dd/MM/yyyy")} to ${format(dates[0].endDate, "dd/MM/yyyy")}`
                  : "Select Dates (Optional)"}
              </span>

              <div style={{ textAlign: "center", fontSize: "12px", marginTop: "5px", color: (dates[0].startDate && nightCount <= 0) ? "red" : "#0071c2", fontWeight: "bold" }}>
                {dates[0].startDate
                  ? (nightCount > 0 ? `Selected: ${nightCount} night(s)` : "Departure must be at least 1 day after arrival")
                  : "Explore all units"}
              </div>

              {openDate && (
                <DateRange
                  onChange={(item) => setDates([item.selection])}
                  minDate={new Date()}
                  ranges={dates[0].startDate ? dates : [{ startDate: new Date(), endDate: addDays(new Date(), 1), key: "selection" }]}
                />
              )}
            </div>

            <div className="lsitem">
              <label>Adults</label>
              <input
                type="number"
                min={1}
                value={adults}
                onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="lsitem">
              <label>Children</label>
              <input
                type="number"
                min={0}
                value={children}
                onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="lsitem">
              <label>Accommodation Type</label>
              <select
                style={{ height: '38px', padding: '0 10px', backgroundColor: '#fff', border: 'none', borderRadius: '6px' }}
                onChange={(e) => handleAccommodationChange(e.target.value)}
                value={isApartment === null ? 'null' : (isApartment ? 'true' : 'false')}
              >
                <option value="null">Any</option>
                <option value="true">Apartment</option>
                <option value="false">Room</option>
              </select>
            </div>

            {isApartment !== false && (
              <div className="lsitem">
                <label>Rooms</label>
                <input
                  type="number"
                  min={1}
                  value={room}
                  onChange={(e) => setRoom(parseInt(e.target.value) || 1)}
                />
              </div>
            )}

            <div className="lsitem">
              <label>Beds</label>
              <input
                type="number"
                min={1}
                value={beds}
                onChange={(e) => setBeds(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="lsitem">
              <label>Price Range (€)</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice || ""}
                  min={0}
                  style={{ width: '50%', height: '38px', padding: '8px 10px' }}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice || ""}
                  min={0}
                  style={{ width: '50%', height: '38px', padding: '8px 10px' }}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="lsitem">
              <label
                onClick={() => setOpenViews(prev => !prev)}
                className={`amenitiesToggle ${openViews ? "active" : ""}`}
              >
                Views
                <span className="arrowIcon">{openViews ? "▲" : "▼"}</span>
              </label>

              {openViews && (
                <div className="amenitiesDropdown">
                  <div className="amenityItem">
                    <input type="checkbox" id="seaView" checked={seaView} onChange={() => handleViewChange('sea')} />
                    <label htmlFor="seaView">Sea View</label>
                  </div>
                  <div className="amenityItem">
                    <input type="checkbox" id="lakeView" checked={lakeView} onChange={() => handleViewChange('lake')} />
                    <label htmlFor="lakeView">Lake View</label>
                  </div>
                  <div className="amenityItem">
                    <input type="checkbox" id="villageView" checked={villageView} onChange={() => handleViewChange('village')} />
                    <label htmlFor="villageView">Village View</label>
                  </div>
                </div>
              )}
            </div>

            <div className="lsitem">
              <label
                onClick={() => setOpenAmenities(prev => !prev)}
                className={`amenitiesToggle ${openAmenities ? "active" : ""}`}
              >
                Amenities
                <span className="arrowIcon">{openAmenities ? "▲" : "▼"}</span>
              </label>

              {openAmenities && (
                <div className="amenitiesDropdown">
                  <div className="amenityItem">
                    <input type="checkbox" id="parking" checked={hasParking} onChange={() => setHasParking(prev => !prev)} />
                    <label htmlFor="parking">Parking</label>
                  </div>
                  <div className="amenityItem">
                    <input type="checkbox" id="wifi" checked={hasWifi} onChange={() => setHasWifi(prev => !prev)} />
                    <label htmlFor="wifi">WiFi</label>
                  </div>
                  <div className="amenityItem">
                    <input type="checkbox" id="breakfast" checked={hasBreakfast} onChange={() => setHasBreakfast(prev => !prev)} />
                    <label htmlFor="breakfast">Breakfast</label>
                  </div>
                  <div className="amenityItem">
                    <input type="checkbox" id="ac" checked={hasAirConditioning} onChange={() => setHasAirConditioning(prev => !prev)} />
                    <label htmlFor="ac">A/C Unit</label>
                  </div>
                  <div className="amenityItem">
                    <input type="checkbox" id="heater" checked={hasHeater} onChange={() => setHasHeater(prev => !prev)} />
                    <label htmlFor="heater">Heater</label>
                  </div>
                  <div className="amenityItem">
                    <input type="checkbox" id="towels" checked={hasTowels} onChange={() => setHasTowels(prev => !prev)} />
                    <label htmlFor="towels">Towels</label>
                  </div>
                  <div className="amenityItem">
                    <input type="checkbox" id="shampoo" checked={hasShampoo} onChange={() => setHasShampoo(prev => !prev)} />
                    <label htmlFor="shampoo">Shampoo</label>
                  </div>
                  <div className="amenityItem">
                    <input type="checkbox" id="hairdryer" checked={hasHairDryer} onChange={() => setHasHairDryer(prev => !prev)} />
                    <label htmlFor="hairdryer">Hair Dryer</label>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleSearch}
              disabled={loading}
            >
              Search
            </button>
          </div>

          <div className="listresult">
            {loading && <p>Loading...</p>}
            {!loading && units.length === 0 && <p>No results found</p>}
            {!loading &&
              units.map((unit) => <Searchitem key={unit.idUnit} unit={unit} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default List;