import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RentalUnits.css";

const RentalUnits = () => {
  const [units, setUnits] = useState([
    { id: 1, name: "Apartman Sunce", type: "Apartman" },
    { id: 2, name: "Room Blue", type: "Room" },
    { id: 3, name: "Apartman More", type: "Apartman" },
  ]);

  const navigate = useNavigate();

  const handleEdit = (id) => {
    console.log("Edit unit with ID:", id);
    // kasnije možeš navigirati na formu s ID-om
  };

  const handleDelete = (id) => {
    if (window.confirm("Jesi li siguran da želiš obrisati ovu jedinicu?")) {
      setUnits(units.filter((unit) => unit.id !== id));
    }
  };

  const handleCreate = () => {
    navigate("/form");
  };

  return (
    <div className="rental-units-container">
      <h1 className="title">Iznajmljivačke jedinice</h1>
      <ul className="units-list">
        {units.map((unit) => (
          <li key={unit.id} className="unit-item">
            <div className="unit-info">
              <span className="unit-name">{unit.name}</span>
              <span className="unit-type">({unit.type})</span>
            </div>
            <div className="unit-actions">
              <button className="edit-button" onClick={() => handleEdit(unit.id)}>
                Edit
              </button>
              <button className="delete-button" onClick={() => handleDelete(unit.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <button className="create-button" onClick={handleCreate}>
        + Create New Unit
      </button>
    </div>
  );
};

export default RentalUnits;
