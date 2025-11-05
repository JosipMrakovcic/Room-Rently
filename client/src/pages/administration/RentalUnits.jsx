import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RentalUnits.css";

const RentalUnits = () => {
  const [units, setUnits] = useState([
    { id: 1, name: "Apartment Sun", type: "Apartment" },
    { id: 2, name: "Room Blue", type: "Room" },
    { id: 3, name: "Apartment Sea", type: "Apartment" },
  ]);

  const navigate = useNavigate();

  const handleEdit = (id) => {
  navigate(`/form/${id}`);
};

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this unit?")) {
      setUnits(units.filter((unit) => unit.id !== id));
    }
  };

  const handleCreate = () => {
    navigate("/form");
  };

  return (
    <div className="rental-units-container">
      <h1 className="title">Rental Units</h1>
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
