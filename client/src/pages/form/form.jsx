import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ApartmentForm.css";

const ApartmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [images, setImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [hasExistingImages, setHasExistingImages] = useState(false);
  
  // 🟢 Pratimo index slike koja je cover
  const [coverIndex, setCoverIndex] = useState(0);

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
    numSameRooms: 1,
    numBeds: 1,
    isApartment: true, 
    view: {
      sea: false,
      lake: false,
      village: false,
    },
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
            numSameRooms: data.numSameRooms || 1,
            numBeds: data.numBeds || 1,
            isApartment: data.isApartment ?? true,
            view: {
              sea: data.seaView || false,
              lake: data.lakeView || false,
              village: data.villageView || false,
            },
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

          setHasExistingImages((data.images?.length || 0) > 0);

          if (data.images && data.images.length > 0) {
            const existingImages = data.images.map((img, idx) => {
              // Ako URL sadrži /cover/, taj index postavljamo kao aktivni coverIndex
              if (img.url.includes("/cover/")) {
                setCoverIndex(idx);
              }
              return {
                file: null,
                url: `${process.env.REACT_APP_API_URL}${img.url}`,
                id: img.id
              };
            });
            setImages(existingImages);
          }
        })
        .catch((err) => console.error("Error fetching unit:", err));
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    if (["price", "capAdults", "numRooms", "numSameRooms", "numBeds"].includes(name)) {
      if (value !== "" && parseInt(value) < 1) return;
    }
    if (name === "capChildren" && value !== "" && parseInt(value) < 0) return;

    if (name in formData.amenities) {
      setFormData((prev) => ({
        ...prev,
        amenities: { ...prev.amenities, [name]: checked },
      }));
    } else if (name in formData.view) {
      setFormData((prev) => {
        const resetViews = Object.keys(prev.view).reduce((acc, key) => {
          acc[key] = false;
          return acc;
        }, {});
        return {
          ...prev,
          view: { ...resetViews, [name]: checked },
        };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      id: null,
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleSetCover = (index) => {
    setCoverIndex(index);
  };

  const handleReplaceImage = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const imageToReplace = images[index];
    if (imageToReplace.id) {
      setImagesToDelete((prev) => [...prev, imageToReplace.id]);
    } else if (imageToReplace.url.startsWith("blob:")) {
      URL.revokeObjectURL(imageToReplace.url);
    }
    const newImage = { file, url: URL.createObjectURL(file), id: null };
    setImages((prev) => {
      const updated = [...prev];
      updated[index] = newImage;
      return updated;
    });
  };

  const removeImage = (index) => {
    const imageToHandle = images[index];
    if (imageToHandle.id) {
      setImagesToDelete((prev) => [...prev, imageToHandle.id]);
    } else if (imageToHandle.url.startsWith("blob:")) {
      URL.revokeObjectURL(imageToHandle.url);
    }
    
    if (index === coverIndex) {
        setCoverIndex(0);
    } else if (index < coverIndex) {
        setCoverIndex(prev => prev - 1);
    }

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
      numSameRooms: !formData.isApartment ? parseInt(formData.numSameRooms) : 1,
      numBeds: parseInt(formData.numBeds),
      seaView: formData.view.sea,
      lakeView: formData.view.lake,
      villageView: formData.view.village,
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

    const url = id ? `${process.env.REACT_APP_API_URL}/unit/update/${id}` : `${process.env.REACT_APP_API_URL}/unit/add`;
    const method = id ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(unitPayload),
      });

      if (response.ok) {
        const savedUnit = await response.json();
        const unitId = id || savedUnit.idUnit;

        if (imagesToDelete.length > 0) {
          for (const imgId of imagesToDelete) {
            await fetch(`${process.env.REACT_APP_API_URL}/unitImg/delete/${imgId}`, { method: "DELETE" });
          }
        }

        for (let i = 0; i < images.length; i++) {
          const imageObj = images[i];
          const isCover = (i === coverIndex); 

          if (imageObj.file) {
            const imageFormData = new FormData();
            imageFormData.append("file", imageObj.file);
            imageFormData.append("isCover", isCover);
            await fetch(`${process.env.REACT_APP_API_URL}/unitImg/upload/${unitId}`, { method: "POST", body: imageFormData });
          } else if (imageObj.id) {
            await fetch(`${process.env.REACT_APP_API_URL}/unitImg/update-status/${imageObj.id}?isCover=${isCover}`, { method: "PUT" });
          }
        }

        alert("Unit and images updated successfully!");
        navigate("/admin");
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
        <input type="text" name="unitName" value={formData.unitName} onChange={handleChange} required />

        <label>Unit Type</label>
        <div className="radio-group with-rooms">
          <div className="radio-options">
            <label>
              <input type="radio" name="isApartment" checked={formData.isApartment === true} onChange={() => setFormData({ ...formData, isApartment: true })} />
              Apartment
            </label>
            <label>
              <input type="radio" name="isApartment" checked={formData.isApartment === false} onChange={() => setFormData({ ...formData, isApartment: false })} />
              Room
            </label>
          </div>
          {formData.isApartment ? (
            <div className="num-rooms-inline">
              <label>Rooms:</label>
              <input type="number" name="numRooms" value={formData.numRooms} onChange={handleChange} min="1" />
            </div>
          ) : (
            <div className="num-rooms-inline">
              <label>Number of rooms:</label>
              <input type="number" name="numSameRooms" value={formData.numSameRooms} onChange={handleChange} min="1" />
            </div>
          )}
        </div>

        <div className="checkbox-section-view">
          <h4>Views</h4>
          {Object.keys(formData.view).map((option) => (
            <label key={option} className="checkbox-label">
              <input type="checkbox" name={option} checked={formData.view[option] === true} onChange={handleChange} />
              {option.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
            </label>
          ))}
        </div>

        <label>Capacity (Adults)</label>
        <input type="number" name="capAdults" value={formData.capAdults} onChange={handleChange} min="1" />

        <label>Capacity (Children)</label>
        <input type="number" name="capChildren" value={formData.capChildren} onChange={handleChange} min="0" />

        <label>Number of Beds</label>
        <input type="number" name="numBeds" value={formData.numBeds} onChange={handleChange} min="1" />

        <label>Main Description Title</label>
        <input type="text" name="mainDescriptionTitle" value={formData.mainDescriptionTitle} onChange={handleChange} />

        <label>Main Description</label>
        <textarea name="mainDescription" rows="3" value={formData.mainDescription} onChange={handleChange} />

        <label>Secondary Description Title</label>
        <input type="text" name="secondaryDescriptionTitle" value={formData.secondaryDescriptionTitle} onChange={handleChange} />

        <label>Secondary Description</label>
        <textarea name="secondaryDescription" rows="3" value={formData.secondaryDescription} onChange={handleChange} />

        <label>Price (€)</label>
        <input type="number" name="price" value={formData.price} onChange={handleChange} min="1" required />

        <div className="image-upload">
          <label>Images</label>
          <input type="file" multiple accept="image/*" onChange={handleImageUpload} />

          <div className="image-preview">
            {images.map((img, index) => (
              <div key={index} className="preview-item">
                {index === coverIndex && <span className="cover-badge">COVER</span>}
                
                <img 
                  src={img.url} 
                  alt={`Image ${index}`} 
                  onClick={() => handleSetCover(index)} // Samo postavlja index kao cover
                  style={{ 
                    cursor: "pointer", 
                    border: index === coverIndex ? "3px solid #007bff" : "1px solid #ddd" 
                  }} 
                  title="Click to set as Cover"
                />
                
                <div className="image-action-buttons">
                  <button type="button" className="update-img-btn" onClick={() => document.getElementById(`replace-input-${index}`).click()}>Update</button>
                  <input id={`replace-input-${index}`} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleReplaceImage(index, e)} />
                  <button type="button" className="remove-img-btn" onClick={() => removeImage(index)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="checkbox-section">
          <h4>Amenities</h4>
          {Object.keys(formData.amenities).map((option) => (
            <label key={option} className="checkbox-label">
              <input type="checkbox" name={option} checked={formData.amenities[option]} onChange={handleChange} />
              {option.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
            </label>
          ))}
        </div>

        <div className="button-row">
          <button type="submit" className="submit-btn">{id ? "Update" : "Submit"}</button>
          <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default ApartmentForm;