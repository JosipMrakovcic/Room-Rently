import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./RentalUnits.css";

const RentalUnits = () => {
  const [units, setUnits] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("googleUser");
    const user = savedUser ? JSON.parse(savedUser) : null;

    // Ako nije admin redirectaj ga na main page
    if (!user || !user.is_admin) {
      navigate("/main");
      return;
    }

    const fetchUnits = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/unit/all`);
        if (!response.ok) throw new Error("Failed to fetch units");
        const data = await response.json();

        const formatted = data.map((u) => ({
          id: u.idUnit,
          name: u.unitName,
          type: u.isApartment ? "Apartment" : "Room",
        }));

        setUnits(formatted);
      } catch (err) {
        console.error("Error fetching units:", err);
      }
    };

    fetchUnits();
  }, [navigate]);

  const handleEdit = (id) => {
    navigate(`/form/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this unit?")) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/unit/delete/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setUnits((prev) => prev.filter((unit) => unit.id !== id));
        } else {
          alert("Failed to delete unit.");
        }
      } catch (err) {
        console.error("Error deleting unit:", err);
      }
    }
  };

  const handleCreate = () => {
    navigate("/form");
  };

  // 🔙 novi handler za povratak
  const handleBackToMain = () => {
    navigate("/main");
  };

  return (
    <div className="rental-units-container">
      <div className="header-row">
        <h1 className="title">Rental Units</h1>
        <button className="back-button" onClick={handleBackToMain}>
          ⬅ Back to Main Page
        </button>
      </div>

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
