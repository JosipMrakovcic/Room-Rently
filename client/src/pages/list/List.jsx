import React, { useState, useEffect } from "react";
import "./list.css";
import Navbar from "../../components/navbar/navbar";
import Header from "../../components/header/Header";
import { useLocation } from "react-router-dom";
import Searchitem from "../../components/searchitem/searchitem";
import axios from "axios";

const List = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const location = useLocation();

  const [destination, setDestination] = useState(location.state?.destination || "");
  const [adults, setAdults] = useState(location.state?.options?.adult || 1);
  const [children, setChildren] = useState(location.state?.options?.children || 0);
  const [room, setRoom] = useState(location.state?.options?.room || 1);

  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isApartment, setIsApartment] = useState(null);
  const [hasParking, setHasParking] = useState(false);
  const [hasWifi, setHasWifi] = useState(false);
  const [hasBreakfast, setHasBreakfast] = useState(false);
  const [hasAirConditioning, setHasAirConditioning] = useState(false);
  const [hasTowels, setHasTowels] = useState(false); 
  const [hasShampoo, setHasShampoo] = useState(false); 
  const [hasHairDryer, setHasHairDryer] = useState(false); 
  const [hasHeater, setHasHeater] = useState(false); 

  const [openAmenities, setOpenAmenities] = useState(false);

  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);

  const handleAccommodationChange = (value) => {
    const isRoom = value === 'false';
    
    // Postavlja state na true (Apartman), false (Soba) ili null (Any)
    const newIsApartment = value === 'null' ? null : !isRoom;

    setIsApartment(newIsApartment);
    
    // KLJUČNA LOGIKA: Ako je odabrana 'Room', forsiraj broj soba na 1.
    if (isRoom) {
      setRoom(1);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const parsedMinPrice = minPrice ? parseFloat(minPrice) : null;
      const parsedMaxPrice = maxPrice ? parseFloat(maxPrice) : null;
      const res = await axios.get(`${API_URL}/unit/filter`, {
        params: {
          name: destination.trim() === '' ? null : destination,
          adults,
          children,
          rooms: isApartment === false ? 1 : room, 
          isApartment: isApartment, 
          hasParking: hasParking || null, 
          hasWifi: hasWifi || null,
          hasBreakfast: hasBreakfast || null,
          hasAirConditioning: hasAirConditioning || null,
          hasTowels: hasTowels || null, 
          hasShampoo: hasShampoo || null, 
          hasHairDryer: hasHairDryer || null, 
          hasHeater: hasHeater || null, 
          minPrice: parsedMinPrice, // Korištenje parsirane vrijednosti
          maxPrice: parsedMaxPrice,
        },
      });
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

  return (
    <div>
      <Navbar />
      <Header type="list" />

      <div className="listcontainer">
        <div className="listwrapper">
          <div className="listsearch">
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
                
                // KLJUČNO: Pozivanje nove funkcije
                onChange={(e) => handleAccommodationChange(e.target.value)}
                // KLJUČNO: Vezivanje selecta za state
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
                  // disabled i style su uklonjeni jer se cijeli element skriva/prikazuje
                />
              </div>
            )}
            
            {/* --- PRICE RANGE FILTER (Ažurirani onChange) --- */}
            <div className="lsitem">
              <label>Price Range (€)</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="number"
                  placeholder="Min"
                  min={0}
                  style={{ width: '50%', height: '38px', padding: '8px 10px' }}
                  // Koristimo setMinPrice, bez parseInt ovdje, parsing ide u handleSearch
                  onChange={(e) => setMinPrice(e.target.value)} 
                />
                <input
                  type="number"
                  placeholder="Max"
                  min={0}
                  style={{ width: '50%', height: '38px', padding: '8px 10px' }}
                  // Koristimo setMaxPrice
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            
            <div className="lsitem">
                <label 
                    onClick={() => setOpenAmenities(prev => !prev)}
                    className="amenitiesToggle" 
                >
                    Amenities 
                    <span className={`arrow ${openAmenities ? 'open' : ''}`}></span>
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
                            <label htmlFor="ac">A/C Unit</label> {/* SKRAĆENO */}
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
                        
                        
                        <div className="amenityItem"></div> 

                    </div>
                )}
            </div>

            <button onClick={handleSearch}>Search</button>
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
