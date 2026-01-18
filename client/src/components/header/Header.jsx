import "./header.css";
import { useState } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file
import { format, differenceInCalendarDays } from "date-fns"; 
import { useNavigate } from "react-router-dom";

const Header = ({ type }) => {
  // State za kontrolu vidljivosti kalendara i unos destinacije
  const [opendate, setOpendate] = useState(false);
  const [destination, setdestination] = useState("");
  
  // Dohvaćanje korisnika iz localStorage ako zatreba
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("googleUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  // State za raspon datuma: inicijalno postavljeno na današnji dan
  const [date, setDate] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  // State za broj osoba i soba
  const [openOptions, setopenOptions] = useState(false);
  const [options, setoptions] = useState({
    adult: 1,
    children: 0,
    room: 1,
  });

  const navigate = useNavigate();
// Glavna funkcija za pretragu i validaciju
  const handleSearch = () => {
    // Izračun broja noćenja pomoću date-fns biblioteke
    const nightCount = differenceInCalendarDays(date[0].endDate, date[0].startDate);
    // Validacija: korisnik mora odabrati barem jedno noćenje
    if (nightCount <= 0) {
      alert("Please select at least one night. Your departure date must be at least one day after arrival.");
      return;
    }

    // Pohrana podataka u sessionStorage kako bi se pretraga "zapamtila" tijekom sesije
    const searchData = { destination, options, dates: date };
    sessionStorage.setItem("lastSearch", JSON.stringify(searchData));
    // Navigacija na stranicu s rezultatima uz prosljeđivanje parametara kroz state
    navigate("/hotels", { state: { destination, options, date } });
  };
  // Pomoćna funkcija za inkrement/dekrement broja gostiju i soba
  const handleoption = (name, operation) => {
    setoptions((prev) => {
      return {
        ...prev,
        [name]: operation === "i" ? options[name] + 1 : options[name] - 1,
      };
    });
  };

  return (
    <div className="header">
      {/* Uvjetno dodavanje klase ovisno o tome je li header na početnoj ili listi hotela */}
      <div
        className={
          type === "list" ? "headerContainer listmode" : "headerContainer"
        }
      >
        {type !== "list" && (
          <>
            <h1 className="headerTitle">
              Room-Rently | Find Your Perfect Apartment or Holiday Stay
            </h1>
            <p className="headerDesc">
              Discover comfortable apartments and rooms for rent across stunning
              locations. Easy booking and the best prices, only with
              Room-Rently.
            </p>

            <div className="headerSearch">
              {/* Pretraga po nazivu */}
              <div className="headerSearchItem">
                <input
                  type="text"
                  placeholder="Search by apartment name"
                  className="headerSearchInput"
                  onChange={(e) => setdestination(e.target.value)}
                />
              </div>

             {/* Sekcija za odabir datuma s prikazom odabranog raspona */}
              <div className="headerSearchItem">
                <span
                  onClick={() => setOpendate(!opendate)}
                  className="headerSearchText"
                >
                  {`${format(date[0].startDate, "dd/MM/yyyy")} to ${format(
                    date[0].endDate,
                    "dd/MM/yyyy"
                  )}`}
                </span>
                {opendate && (
                  <DateRange
                    editableDateInputs={true}
                    onChange={(item) => setDate([item.selection])}
                    moveRangeOnFirstSelection={false}
                    ranges={date}
                    className="date"
                    minDate={new Date()}
                  />
                )}
              </div>

              {/* Opcije (Gosti/Sobe) */}
              <div className="headerSearchItem">
                <span
                  onClick={() => setopenOptions(!openOptions)}
                  className="headerSearchText"
                >{`${options.adult} adult - ${options.children} children - ${options.room} room`}</span>
                {openOptions && (
                  <div className="options">
                    {/* Odrasli */}
                    <div className="optionitem">
                      <span className="optiontext">Adult</span>
                      <div className="optioncounter">
                        <button
                          disabled={options.adult <= 1}
                          className="optioncounterbutton"
                          onClick={() => handleoption("adult", "d")}
                        >
                          -
                        </button>
                        <span className="optioncounternumber">
                          {options.adult}
                        </span>
                        <button
                          className="optioncounterbutton"
                          onClick={() => handleoption("adult", "i")}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Djeca */}
                    <div className="optionitem">
                      <span className="optiontext">Children</span>
                      <div className="optioncounter">
                        <button
                          disabled={options.children <= 0}
                          className="optioncounterbutton"
                          onClick={() => handleoption("children", "d")}
                        >
                          -
                        </button>
                        <span className="optioncounternumber">
                          {options.children}
                        </span>
                        <button
                          className="optioncounterbutton"
                          onClick={() => handleoption("children", "i")}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Sobe */}
                    <div className="optionitem">
                      <span className="optiontext">Room</span>
                      <div className="optioncounter">
                        <button
                          disabled={options.room <= 1}
                          className="optioncounterbutton"
                          onClick={() => handleoption("room", "d")}
                        >
                          -
                        </button>
                        <span className="optioncounternumber">
                          {options.room}
                        </span>
                        <button
                          className="optioncounterbutton"
                          onClick={() => handleoption("room", "i")}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Search Gumb */}
              <div className="headerSearchItem">
                <button className="headerBTN" onClick={handleSearch}>
                  Search
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;