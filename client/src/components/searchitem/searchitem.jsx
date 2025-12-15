// Searchitem.jsx

import "./searchitem.css";

const Searchitem = ({ unit }) => {
  return (
    <div className="searchitem">
      <div className="sidesc">
        <h1 className="siTitle">{unit.unitName}</h1>
        <span>{unit.location}</span>
        <span>
          {unit.capAdults} adults · {unit.capChildren} children
        </span>
        {/* --- DODANO: PRIKAZ BROJA SOBA --- */}
        <span>
          {unit.numRooms} rooms
        </span>
        {/* ---------------------------------- */}
      </div>

      <div className="sidetails">
        <span className="siprice">{unit.price} €</span>
      </div>
    </div>
  );
};
export default Searchitem;