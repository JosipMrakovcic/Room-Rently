import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./RentalUnits.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("units");
  const [units, setUnits] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("googleUser");
    const user = savedUser ? JSON.parse(savedUser) : null;

    if (!user || !user.is_admin) {
      navigate("/main");
      return;
    }

    setCurrentUser(user);

    fetchUnits();
    fetchUsers();
  }, [navigate]);

  const fetchUnits = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/unit/all`);
      if (!response.ok) throw new Error("Failed to fetch units");
      const data = await response.json();

      setUnits(
        data.map((u) => ({
          id: u.idUnit,
          name: u.unitName,
          type: u.isApartment ? "Apartment" : "Room",
        }))
      );
    } catch (err) {
      console.error("Error fetching units:", err);
    }
  };

  
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/allPersons`);
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();

      setUsers(
        data.map((u) => {
          let role = "User";
          if (u.is_admin) role = "Admin";
          else if (u.is_owner) role = "Owner";
          return {
            id: u.id, // ✅ ovo je ispravno
            name: u.name,
            email: u.email,
            role,
          };
        })
      );
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };



  const handleEdit = (id) => navigate(`/form/${id}`);

  const handleDeleteUnit = async (id) => {
    if (window.confirm("Are you sure you want to delete this unit?")) {
      try {
        const token = localStorage.getItem("access_token"); // ako ga spremaš
        const response = await fetch(`${process.env.REACT_APP_API_URL}/deletePerson/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  const handleDeleteUser = async (id, email) => {
    if (email === currentUser?.email) {
      alert("You cannot delete yourself!");
      return;
    }

    if (window.confirm(`Are you sure you want to delete user ${email}?`)) {
      try {
        const token = localStorage.getItem("access_token"); // ✅ uzmi token

        const response = await fetch(`${process.env.REACT_APP_API_URL}/deletePerson/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`, // ✅ pošalji ga backendu
          },
        });

        if (response.ok) {
          setUsers((prev) => prev.filter((user) => user.id !== id));
        } else if (response.status === 403) {
          alert("You are not allowed to delete this user!");
        } else {
          alert("Failed to delete user.");
        }
      } catch (err) {
        console.error("Error deleting user:", err);
      }
    }
  };


  const handleCreate = () => navigate("/form");
  const handleBackToMain = () => navigate("/main");

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Admin Panel</h2>
        <button
          className={`tab-btn ${activeTab === "units" ? "active" : ""}`}
          onClick={() => setActiveTab("units")}
        >
          🏠 Units
        </button>
        <button
          className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          👤 Users
        </button>
        <hr />
        <button className="back-main-btn" onClick={handleBackToMain}>
          ⬅ Back to Main
        </button>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content">
        {activeTab === "units" && (
          <section className="section-block">
            <h1>Rental Units</h1>
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
                    <button className="delete-button" onClick={() => handleDeleteUnit(unit.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <button className="create-button" onClick={handleCreate}>
              + Create New Unit
            </button>
          </section>
        )}

        {activeTab === "users" && (
          <section className="section-block">
            <h1>Registered Users</h1>
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td className={`role-${user.role.toLowerCase()}`}>{user.role}</td>
                    <td>
                      <button
                        className={`delete-button ${
                          user.email === currentUser?.email ? "disabled-btn" : ""
                        }`}
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        disabled={user.email === currentUser?.email}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
