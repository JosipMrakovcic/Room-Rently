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
    capAdults: 2,
    capChildren: 0,
    numRooms: 1,
    numBeds: 1,
    isApartment: true,
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

  useEffect(() => {
    const savedUser = localStorage.getItem("googleUser");
    const user = savedUser ? JSON.parse(savedUser) : null;

    if (!user || !user.is_admin) {
      navigate("/main");
      return;
    }

    if (id) {
      fetch(`${process.env.REACT_APP_API_URL}/unit/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            unitName: data.unitName || "",
            mainDescriptionTitle: data.mainDescName || "",
            mainDescription: data.mainDescContent || "",
            secondaryDescriptionTitle: data.secDescName || "",
            secondaryDescription: data.secDescContent || "",
            price: data.price || "",
            capAdults: data.capAdults || 2,
            capChildren: data.capChildren || 0,
            numRooms: data.numRooms || 1,
            numBeds: data.numBeds || 1,
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
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    if (name in formData.amenities) {
      setFormData((prev) => ({
        ...prev,
        amenities: { ...prev.amenities, [name]: checked },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
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
      capAdults: parseInt(formData.capAdults),
      capChildren: parseInt(formData.capChildren),
      numRooms: formData.isApartment ? parseInt(formData.numRooms) : 1,
      numBeds: parseInt(formData.numBeds),
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

    const url = id
      ? `${process.env.REACT_APP_API_URL}/unit/update/${id}`
      : `${process.env.REACT_APP_API_URL}/unit/add`;
    const method = id ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(unitPayload),
      });

      if (response.ok) {
        alert(id ? "Unit updated successfully!" : "Unit added successfully!");
        navigate("/admin"); // ✅ bez reloada
      } else {
        const errorText = await response.text();
        alert("Error: " + errorText);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Something went wrong!");
    }
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel? Changes will not be saved.")) {
      navigate("/admin");
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

        <label>Unit Type</label>
        <div className="radio-group with-rooms">
          <div className="radio-options">
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

          {formData.isApartment && (
            <div className="num-rooms-inline">
              <label>Rooms:</label>
              <input
                type="number"
                name="numRooms"
                value={formData.numRooms}
                onChange={handleChange}
                min="1"
              />
            </div>
          )}
        </div>

        <label>Capacity (Adults)</label>
        <input
          type="number"
          name="capAdults"
          value={formData.capAdults}
          onChange={handleChange}
          min="1"
        />

        <label>Capacity (Children)</label>
        <input
          type="number"
          name="capChildren"
          value={formData.capChildren}
          onChange={handleChange}
          min="0"
        />

        <label>Number of Beds</label>
        <input
          type="number"
          name="numBeds"
          value={formData.numBeds}
          onChange={handleChange}
          min="1"
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
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
          />
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

        <div className="button-row">
          <button type="submit" className="submit-btn">
            {id ? "Update" : "Submit"}
          </button>
          <button type="button" className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApartmentForm;
