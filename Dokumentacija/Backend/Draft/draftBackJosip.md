# Dodavanje CRUD operacija za smještajne jedinice
## Povezivanje submita i backenda/baze
Većina operacija za dodavanje u bazu je već implementirana i opisana. Trebalo je samo u formi (form.jsx u frontendu) za submit ispravno slati backendu podatke. Payload napravljen na temelju baze podataka i tablice unit. <br>
("id_unit"<br>
"cap_adults"<br>
"cap_children"<br>
"has_air_conditioning"<br>
"has_breakfast"<br>
"has_hair_dryer"<br>
"has_heater"<br>
"has_parking"<br>
"has_shampoo"<br>
"has_towels"<br>
"has_wifi"<br>
"is_apartment"<br>
"location"<br>
"main_desc_content"<br>
"main_desc_name"<br>
"num_beds"<br>
"num_rooms"<br>
"price"<br>
"rating"<br>
"sec_desc_content"<br>
"sec_desc_name"<br>
"unit_name") <br>
Nakon šaljemo post upit na već postavljen /unit/add s podacima iz forme. Alertom testiramo je li uspješno ili nije.<br>
Na kraju refreshamo formu da se može upisati nova smještajna jedinica.
```
const handleSubmit = async (e) => {
    e.preventDefault();

    const unitPayload = {
      unitName: formData.unitName,
      mainDescName: formData.mainDescriptionTitle,
      mainDescContent: formData.mainDescription,
      secDescName: formData.secondaryDescriptionTitle,
      secDescContent: formData.secondaryDescription,
      price: parseInt(formData.price),
      numRooms: 1,
      capAdults: 2,
      capChildren: 0,
      numBeds: 1,
      hasParking: formData.amenities.parking,
      hasWifi: formData.amenities.wifi,
      hasBreakfast: formData.amenities.breakfast,
      hasTowels: formData.amenities.towels,
      hasShampoo: formData.amenities.shampoo,
      hasHairDryer: formData.amenities.hairDryer,
      hasHeater: formData.amenities.heater,
      hasAirConditioning: formData.amenities.airConditioning,
      isApartment: true,
      location: "Zagreb, Croatia", // fixat da povlači lokaciju od lokacije hotela da nije hard kodirano
      rating: 0 // fixat kasnije da bude rating sobe na temelju recenzija
    };

    try {
      const response = await fetch("http://localhost:8080/unit/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(unitPayload),
      });

      if (response.ok) {
        alert("Unit added successfully!");
        setFormData({
          unitName: "",
          mainDescriptionTitle: "",
          mainDescription: "",
          secondaryDescriptionTitle: "",
          secondaryDescription: "",
          price: "",
          amenities: {
            parking: false,
            wifi: false,
            breakfast: false,
            towels: false,
            shampoo: false,
            hairDryer: false,
            heater: false,
            airConditioning: false,
          },
        });
      } else {
        const errorText = await response.text();
        alert("Error: " + errorText);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Something went wrong!");
    }
  };
```


## Povezivanje frontend prikaza smještajnih jedinica s bazom
### form.jsx
Form nam nije imao opciju za označavanje jel jedinica apartman ili nije pa sam dodao checkbox da se označi Apartment ili Room. Bilo je problema i sa slanjem true false za isApartment to je isto popravljeno. Sad nas submitanjem forme vraća na listu svih jedinica gdje se prikaže naša nova jedinica.

```
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ApartmentForm.css";

const ApartmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    unitName: "",
    mainDescriptionTitle: "",
    mainDescription: "",
    secondaryDescriptionTitle: "",
    secondaryDescription: "",
    price: "",
    isApartment: true, // 🔹 NEW — default vrijednost
    amenities: {
      parking: false,
      wifi: false,
      breakfast: false,
      towels: false,
      shampoo: false,
      hairDryer: false,
      heater: false,
      airConditioning: false,
    },
  });

  const [images, setImages] = useState([]);

  // ✅ Kad postoji ID u URL-u, dohvatiti podatke iz backenda
  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8080/unit/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            unitName: data.unitName || "",
            mainDescriptionTitle: data.mainDescName || "",
            mainDescription: data.mainDescContent || "",
            secondaryDescriptionTitle: data.secDescName || "",
            secondaryDescription: data.secDescContent || "",
            price: data.price || "",
            isApartment: data.isApartment ?? true,
            amenities: {
              parking: data.hasParking || false,
              wifi: data.hasWifi || false,
              breakfast: data.hasBreakfast || false,
              towels: data.hasTowels || false,
              shampoo: data.hasShampoo || false,
              hairDryer: data.hasHairDryer || false,
              heater: data.hasHeater || false,
              airConditioning: data.hasAirConditioning || false,
            },
          });
        })
        .catch((err) => console.error("Error fetching unit:", err));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name in formData.amenities) {
      setFormData({
        ...formData,
        amenities: { ...formData.amenities, [name]: checked },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const unitPayload = {
      unitName: formData.unitName,
      mainDescName: formData.mainDescriptionTitle,
      mainDescContent: formData.mainDescription,
      secDescName: formData.secondaryDescriptionTitle,
      secDescContent: formData.secondaryDescription,
      price: parseInt(formData.price),
      numRooms: 1,
      capAdults: 2,
      capChildren: 0,
      numBeds: 1,
      hasParking: formData.amenities.parking,
      hasWifi: formData.amenities.wifi,
      hasBreakfast: formData.amenities.breakfast,
      hasTowels: formData.amenities.towels,
      hasShampoo: formData.amenities.shampoo,
      hasHairDryer: formData.amenities.hairDryer,
      hasHeater: formData.amenities.heater,
      hasAirConditioning: formData.amenities.airConditioning,
      isApartment: formData.isApartment, 
      location: "Zagreb, Croatia",
      rating: 0,
    };

    try {
      const response = await fetch("http://localhost:8080/unit/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(unitPayload),
      });

      if (response.ok) {
        alert("Unit added successfully!");
        navigate("/admin");
      } else {
        const errorText = await response.text();
        alert("Error: " + errorText);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="form-container">
      <h2>{id ? `Edit Unit #${id}` : "Create New Unit"}</h2>
      <form onSubmit={handleSubmit} className="apartment-form">
        <label>Unit Name</label>
        <input
          type="text"
          name="unitName"
          value={formData.unitName}
          onChange={handleChange}
          required
        />

        {/* 🔹 NEW — izbor između Apartment i Room */}
        <label>Unit Type</label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="isApartment"
              checked={formData.isApartment === true}
              onChange={() => setFormData({ ...formData, isApartment: true })}
            />
            Apartment
          </label>
          <label>
            <input
              type="radio"
              name="isApartment"
              checked={formData.isApartment === false}
              onChange={() => setFormData({ ...formData, isApartment: false })}
            />
            Room
          </label>
        </div>


        <label>Main Description Title</label>
        <input
          type="text"
          name="mainDescriptionTitle"
          value={formData.mainDescriptionTitle}
          onChange={handleChange}
        />

        <label>Main Description</label>
        <textarea
          name="mainDescription"
          rows="3"
          value={formData.mainDescription}
          onChange={handleChange}
        />

        <label>Secondary Description Title</label>
        <input
          type="text"
          name="secondaryDescriptionTitle"
          value={formData.secondaryDescriptionTitle}
          onChange={handleChange}
        />

        <label>Secondary Description</label>
        <textarea
          name="secondaryDescription"
          rows="3"
          value={formData.secondaryDescription}
          onChange={handleChange}
        />

        <label>Price (€)</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
        />

        <div className="image-upload">
          <label>Images</label>
          <input type="file" multiple accept="image/*" onChange={handleImageUpload} />
          <div className="image-preview">
            {images.map((img, index) => (
              <div key={index} className="preview-item">
                <img src={img.url} alt={`Image ${index + 1}`} />
                <button type="button" onClick={() => removeImage(index)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="checkbox-section">
          <h4>Amenities</h4>
          {Object.keys(formData.amenities).map((option) => (
            <label key={option} className="checkbox-label">
              <input
                type="checkbox"
                name={option}
                checked={formData.amenities[option]}
                onChange={handleChange}
              />
              {option.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
            </label>
          ))}
        </div>

        <button type="submit" className="submit-btn">
          {id ? "Update" : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default ApartmentForm;

```
### RentalUnits.jsx
Trebalo je promjeniti RentalUnits.jsx kako bi mogao koristiti podatke iz već postojeće funkcije iz baze/backenda. (/unit/all koji vraća json svih podataka iz baze) <br>
Dodana je parcijalna funkcionalnost za delete button ali nije još u funkcionalnosti. Treba izmjeniti malo backend funkciju

```
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./RentalUnits.css";

const RentalUnits = () => {
  const [units, setUnits] = useState([]);
  const navigate = useNavigate();

  
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await fetch("http://localhost:8080/unit/all");
        if (!response.ok) throw new Error("Failed to fetch units");
        const data = await response.json();

        
        const formatted = data.map((u) => ({
          id: u.id,
          name: u.unitName,
          type: u.isApartment ? "Apartment" : "Room", 
        }));

        setUnits(formatted);
      } catch (err) {
        console.error("Error fetching units:", err);
      }
    };

    fetchUnits();
  }, []);

  const handleEdit = (id) => {
    navigate(`/form/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this unit?")) {
      try {
        const response = await fetch(`http://localhost:8080/unit/delete/${id}`, {
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

  return (
    <div className="rental-units-container">
      <h1 className="title">Rental Units</h1>
      <ul className="units-list">
        {units.map((unit) => (
          <li key={unit.id} className="unit-item">
            <div className="unit-info">
              <span className="unit-name">{unit.name}</span>
              <span className="unit-type">({unit.type})</span> {}
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

```

Na kraju je trebalo još dodati css za novi način prikazivanja.

```
.radio-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  cursor: pointer;
}
```
### Unit.java
Ovdje je trebalo dodati import...
```
import com.fasterxml.jackson.annotation.JsonProperty;
```
...i mijenjati ove linije...
```
    @Column(nullable = false)
    private boolean isApartment; //ako je true onda je jedinica apratman, u suprotnom je soba
```
...u ovo. (Možda ovo nije bilo niti potrebno, ali sad funkcionira pa neka ostane.)
```
    @Column(name = "is_apartment", nullable = false)
    @JsonProperty("isApartment")
    private boolean apartment;
```

## Delete funkcionalnost na listi jedinica

Trebalo je samo u RentalUnits.jsx promjeniti...
```
id: u.id,
```
Ovo u...
```
id: u.idUnit,
```
Sad radi delete button i briše se iz baze.