import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./RentalUnits.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(() => {
    // Prilikom učitavanja, provjeri localStorage, ako nema ništa, stavi "units"
    return localStorage.getItem("activeAdminTab") || "units";
  });
  const [units, setUnits] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Lokacija State
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(true);

  const navigate = useNavigate();
  useEffect(() => {
    // Svaki put kad se activeTab promijeni, spremi ga u memoriju preglednika
    localStorage.setItem("activeAdminTab", activeTab);
  }, [activeTab]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem("access_token");
      
      // Priprema booleana na temelju odabrane uloge
      const roleData = {
        is_admin: newRole === "Admin",
        is_owner: newRole === "Owner",
        is_user: true 
      };

      const response = await fetch(`${process.env.REACT_APP_API_URL}/updateRole/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(roleData),
      });

      if (response.ok) {
        // Osvježi lokalni state korisnika da se odmah vidi promjena
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        const errorMsg = await response.text();
        alert("Failed to update role: " + errorMsg);
      }
    } catch (err) {
      console.error("Error updating role:", err);
    }
  };

  // 1. Inicijalno učitavanje korisnika, jedinica i LOKACIJE IZ BAZE
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
    fetchSavedLocation(); 
  }, [navigate]);

  const fetchSavedLocation = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/location`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.address) {
          setAddress(data.address);
        }
      }
    } catch (err) {
      console.error("Greška pri dohvaćanju lokacije iz baze:", err);
    }
  };

  const handleSaveLocation = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token"); 
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/location`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ address }),
      });

      if (response.ok) {
        alert("Address successfully updated in the database!");
      } else if (response.status === 401) {
        alert("Error 401: You are not authorized. Please log in again.");
      } else {
        alert("Failed to save the address.");
      }
    } catch (err) {
      console.error("Error saving location:", err);
      alert("Server error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/unit/all`);
      if (!response.ok) throw new Error("Failed to fetch units");
      const data = await response.json();

      const mainUnits = data.filter(u => u.parentUnit === null);

      setUnits(
        mainUnits.map((u) => ({
          id: u.idUnit,
          name: u.unitName,
          type: u.isApartment ? "Apartment" : `Room (${u.numSameRooms || 0} units)`,
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
            id: u.id,
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
  if (window.confirm("Are you sure you want to delete this unit and ALL its files from disk?")) {
    try {
      const token = localStorage.getItem("access_token");
      
      // PAŽNJA: Putanja je sada /unitImg/delete-full/ jer smo tako stavili u kontroler
      const response = await fetch(`${process.env.REACT_APP_API_URL}/unitImg/delete-full/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Makni unit iz lokalnog state-a da nestane s ekrana bez refresha
        setUnits((prev) => prev.filter((unit) => unit.id !== id));
        alert("Unit and all files deleted successfully.");
      } else {
        const errorMsg = await response.text();
        alert("Failed to delete unit: " + errorMsg);
      }
    } catch (err) {
      console.error("Error deleting unit:", err);
      alert("An error occurred while deleting.");
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
        const token = localStorage.getItem("access_token");
        const response = await fetch(`${process.env.REACT_APP_API_URL}/deletePerson/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
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

      <main className="dashboard-content">
        {activeTab === "units" && (
          <section className="section-block">
            {/* GOOGLE MAPS SECTION - TVOJ ORIGINALNI STIL */}
            <div className="location-config-container" style={{
              marginBottom: '30px', 
              padding: '20px', 
              backgroundColor: '#f9f9f9', 
              borderRadius: '8px',
              border: '1px solid #ddd'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>📍 Global Property Location</h3>
                <button 
                   onClick={() => setShowMap(!showMap)}
                   style={{ background: '#eee', border: '1px solid #ccc', cursor: 'pointer', padding: '5px 10px', borderRadius: '4px' }}
                >
                  {showMap ? "Hide Map" : "Show Map"}
                </button>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <input
                  type="text"
                  placeholder="Enter address (e.g., Ilica 1, Zagreb)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                  }}
                />
                <button 
                  onClick={handleSaveLocation} 
                  disabled={isLoading}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {isLoading ? "Saving..." : "Update Address"}
                </button>
              </div>

              {showMap && address && (
                <div style={{ marginTop: '15px' }}>
                  <iframe
                    width="100%"
                    height="200"
                    style={{ border: 0, borderRadius: '4px' }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  ></iframe>
                </div>
              )}
            </div>

            <hr style={{ marginBottom: '30px' }} />
            
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
                    <td>
                      {/* MODIFIKACIJA: Ovdje je sada select da bi handleRoleChange radio */}
                      <select 
                        style={{ padding: '5px', borderRadius: '4px' }}
                        value={user.role} 
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={user.email === currentUser?.email}
                      >
                        <option value="User">User</option>
                        <option value="Owner">Owner</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
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