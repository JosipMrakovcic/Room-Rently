import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./ApartmentForm.css";

const ApartmentForm = () => {
  const { id } = useParams();

  const [formData, setFormData] = useState({
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

  const [images, setImages] = useState([]);

  // ✅ Simulirani "database" podaci za demonstraciju
  const mockUnits = [
    {
      id: 1,
      unitName: "Apartment Sun",
      mainDescriptionTitle: "Bright & Cozy Apartment",
      mainDescription: "Spacious apartment with sunlight and balcony view.",
      secondaryDescriptionTitle: "Perfect for couples",
      secondaryDescription: "Located in the heart of Krakow.",
      price: "120",
      amenities: {
        parking: true,
        wifi: true,
        breakfast: false,
        towels: true,
        shampoo: true,
        hairDryer: true,
        heater: false,
        airConditioning: true,
      },
      images: [], // ovdje bi išle slike ako postoje
    },
    {
      id: 2,
      unitName: "Room Blue",
      mainDescriptionTitle: "Comfortable private room",
      mainDescription: "Ideal for solo travelers.",
      secondaryDescriptionTitle: "Budget-friendly stay",
      secondaryDescription: "Near public transport and shops.",
      price: "80",
      amenities: {
        parking: false,
        wifi: true,
        breakfast: true,
        towels: true,
        shampoo: false,
        hairDryer: false,
        heater: true,
        airConditioning: false,
      },
      images: [],
    },
  ];

  // ✅ Kad postoji ID u URL-u, pronađi postojeće podatke
  useEffect(() => {
    if (id) {
      const unitToEdit = mockUnits.find((unit) => unit.id === parseInt(id));
      if (unitToEdit) {
        setFormData({
          unitName: unitToEdit.unitName,
          mainDescriptionTitle: unitToEdit.mainDescriptionTitle,
          mainDescription: unitToEdit.mainDescription,
          secondaryDescriptionTitle: unitToEdit.secondaryDescriptionTitle,
          secondaryDescription: unitToEdit.secondaryDescription,
          price: unitToEdit.price,
          amenities: unitToEdit.amenities,
        });
        setImages(unitToEdit.images || []);
      }
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

  return (
    <div className="form-container">
      <h2>{id ? `Edit Apartment #${id}` : "Create New Apartment"}</h2>
      <form onSubmit={handleSubmit} className="apartment-form">
        <label>Unit Name</label>
        <input
          type="text"
          name="unitName"
          value={formData.unitName}
          onChange={handleChange}
          required
        />

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
