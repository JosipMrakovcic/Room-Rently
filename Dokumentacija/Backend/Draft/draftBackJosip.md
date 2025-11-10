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

useEffect metodu u form.jsx koristimo kasnije za popunjavanje forme s podacima iz baze tokom editanja postoje'ih jedinica. Poziva funkciju s backenda za izvlačenje podataka iz baze i zapisuje ih u formu.
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

        {}
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

useEffect metoda povlači kao i u form.jsx s backenda sve podatke iz baze te prikazuje one potrebne na stranici kako bi se vidjela situacija spremljenih jedinica i kako bi ih se moglo brisati i editati.
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

## Update funkcionalnost za jedinice

### UnitController.java
Trebalo je napraviti novu funkciju za update već postojećih jedinica u tablici. Nadodajemo na kraj ovo.

```
@PutMapping("/update/{id}")
    public ResponseEntity<?> updateUnit(@PathVariable Long id, @RequestBody Unit updatedUnit) {
        return repo.findById(id).map(existingUnit -> {
            updatedUnit.setIdUnit(id);
            repo.save(updatedUnit);
            return ResponseEntity.ok("Unit updated successfully");
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
```

### Form.jsx
Mijenjamo način na koji frontend submita formu

Dodajemo ovo prije try operacije u handleSubmit funkciji. Ovime ovisno imamo li id ili ne šaljemo submit na funkciju dodavanja ili updateanja koju smo malo prije nadodali.
```
 const url = id
      ? `http://localhost:8080/unit/update/${id}`
      : "http://localhost:8080/unit/add";
    const method = id ? "PUT" : "POST";
```

U try bloku imamo...
```
    const response = await fetch("http://localhost:8080/unit/add", {
        method: "POST",
```
...što mijenjamo s ovime. Sada će fetchat metodu i url koji smo prije odredili ovisno o tome imamo li ili ne ID jedinice.
```
    const response = await fetch(url, {
        method,
```
Također mijenjamo alert da znamo da smo updateali, a ne dodali jedinicu. <br>
Ovo..
```
    alert("Unit added successfully!");
```
...u ovo.
```
    alert(id ? "Unit updated successfully!" : "Unit added successfully!");
```
**Datum završetka: 5.11.2025. Utrošeno vrijeme: ~8 sati**
# Fixovi
## Admin profil

Imali smo problem da svi ulogirani i registrirani profili automatski dobivaju admin privilegije. <br> 
Nije bilo buttona za redirect na /admin page.

### PersonController.java
Promjenjen je kod kako bi se točnije spremale varijable kod dodavanja novog usera. <br>
Zamijenili smo ovu liniju...
```
        Person person = new Person(email, true, false, false, name);
```
...ovim linijama.
```

        Person person = new Person();
        person.setEmail(email);
        person.setName(name);


        boolean isFirstUser = repo.count() == 0;

        person.setAdmin(isFirstUser);
        person.setOwner(false);
        person.setUser(true);
```
Na kraju funkcije sam promjenio response da vidim ako mi se admin uspješno stvorio.
```
        return ResponseEntity.ok("User added successfully" + (isFirstUser ? " (as admin)" : ""));
```
Nadodana je funkcija koja vraća trenutno ulogiranog korisnika /me. Potrebno za validaciju tokena i pristup funkcijama vezanih uz admina.
```
 @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        if (email == null) {
            return ResponseEntity.badRequest().body("Invalid token");
        }

        Optional<Person> person = repo.findByEmail(email);
        if (person.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }

        return ResponseEntity.ok(person.get());
  }
```
### Person.java
Nadodane linije kako bi se osiguralo da kod povratka JSON-a iz baze sigurno dobijemo uloge profila.

```
    import com.fasterxml.jackson.annotation.JsonProperty; // kod importova nadodano

    @JsonProperty("is_admin") // NADODANO
    @Column(nullable = false)
    private boolean isAdmin;

    @JsonProperty("is_user") // NADODANO
    @Column(nullable = false)
    private boolean isUser;

    @JsonProperty("is_owner") // NADODANO
    @Column(nullable = false)
    private boolean isOwner;
```
### App.js
Client ID za OAuth2 je promjenjen na novi.

### navbar.jsx
U logoutu sa stranice je dodan refresh za stranicu kako bi se maknuo button za admine koji se odlogiraju.
```
    localStorage.removeItem("googleUser"); 
    window.location.reload(); // NADODANO
```
Nadodana kopija dohvata podatka jer je postojao bug gdje postojeći user u bazi bi davao error i ne bi se dohvaćali njegovi podaci nit se ulogirao.

```
const { data: userFromDB } = await axios.get(
                      `${process.env.REACT_APP_API_URL}/me`,
                      { headers: { Authorization: `Bearer ${idToken}` } }
                    );
```
Spremamo u browser kombinaciju tokena i podataka iz baze za kasniju obradu. Također refreshamo page ako je admin user da mu se pokaže admin button. <br>
Zamijenjene ove linije koda...
```
  console.log("Decoded user:", decoded);
  setUser(decoded);
  localStorage.setItem("googleUser", JSON.stringify(decoded));
```
...s ovima.
```
const finalUser = { ...decoded, ...userFromDB };

setUser(finalUser);
localStorage.setItem("googleUser", JSON.stringify(finalUser));

// Refresh da se prikaže admin gumb
window.location.reload();
```

### Header.jsx
Nadodane linije nakon importova kako bi se povukli trenutni podaci usera koji je ulogiran.
```
  const [user, setUser] = useState(() => {
  const savedUser = localStorage.getItem("googleUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });
```
Promjenjen je button Sign in/Register...
```
<button className="headerBTN">Sign in/Register</button>
```
...u button za redirect na admin stranicu.
```
  {user?.is_admin && (
    <button
      className="headerBTN"
      onClick={() => navigate("/admin")}
    >
      Admin Page
    </button>
  )}
```
## Uređivanje /admin pagea (sitni fixovi)
Admin page nam nije imao button za povratak na main page.<br>
Form page nam nije imao cancel button ako se predomisli kod unosa novih ili uređivanja postojećih jedinica.<br>
Form nam nije imao neke atribute koji su u bazi podataka poput numRooms, capChild, capAdult.<br>
Zabraniti gostima da uđu na admin i form page.
### RentalUnits.jsx
Provjeravamo ako je user admin tako što dodajemo ove linije u useEffect metodu.
```
const savedUser = localStorage.getItem("googleUser");
const user = savedUser ? JSON.parse(savedUser) : null;

// Ako nije admin redirectaj ga na main page
if (!user || !user.is_admin) {
  navigate("/main");
  return;
}
```
Dodan handler za povratak na main page.
```
const handleBackToMain = () => {
    navigate("/main");
  };
```
Zamijenjena ova linija...
```
<h1 className="title">Rental Units</h1>
```
...s ovima kako bismo dodali button.
```
<div className="header-row">
  <h1 className="title">Rental Units</h1>
  <button className="back-button" onClick={handleBackToMain}>
    ⬅ Back to Main Page
  </button>
</div>
```
### RentalUnits.css
Dodajemo dizajn dodanom buttonu.

```
.back-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: 0.2s ease-in-out;
  margin-left: 10px;
}

.back-button:hover {
  background-color: #0056b3;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```
### form.jsx
Treba nadodati Cancel button i opcije za unos kreveta, prostorija itd.<br>
U formi za input podataka dodajemo.
```
capAdults: 2,
capChildren: 0,
numRooms: 1,
numBeds: 1,
```
U useEffect dodajemo zabranu pristupa neadminima. Isto ko na /admin pageu.
```
    const savedUser = localStorage.getItem("googleUser");
    const user = savedUser ? JSON.parse(savedUser) : null;

    if (!user || !user.is_admin) {
      navigate("/main");
      return;
    }
```
U fetchu podataka iz baze kojom se popunjavaju podaci kod edita jedinice dodajemo.
```
capAdults: data.capAdults || 2,
capChildren: data.capChildren || 0,
numRooms: data.numRooms || 1,
numBeds: data.numBeds || 1,
```

U unitPayloadu mjenjamo...
```
      numRooms: 1,
      capAdults: 2,
      capChildren: 0,
      numBeds: 1,
```
...s ovime. Također stavljamo zabranu slanja više od 1 sobe ako je type jedinice room.
```
      capAdults: parseInt(formData.capAdults),
      capChildren: parseInt(formData.capChildren),
      numRooms: formData.isApartment ? parseInt(formData.numRooms) : 1,
      numBeds: parseInt(formData.numBeds),
```
Dodajemo handler za cancel u formi.
```
  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel? Changes will not be saved.")) {
      navigate("/admin");
    }
  };
```

Mjenjana je struktura stranice. Nadodajemo da se numRooms input prikaže ako je apartment type izabran, stavljamo ga desno od odabira tipa jedinice kako se ne bi "shiftali" ostali inputi.
```
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
```
Na kraj prije kraja, prije </form> nadodajemo linije za cancel button.
```
  <div className="button-row">
    <button type="submit" className="submit-btn">
      {id ? "Update" : "Submit"}
    </button>
    <button
      type="button"
      className="cancel-btn"
      onClick={handleCancel}
    >
      Cancel
    </button>
  </div>
```

### ApartmentForm.css
Mjenjamo dizajn form stranice kako bi imali usklađen dizajn novih buttona, inputa sa starima.<br>
Mjenjamo neke stare dizajne i dodajemo nove.
```
.button-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 25px;
}

.submit-btn,
.cancel-btn {
  flex: 1;
  padding: 12px 0;
  height: 46px; /* ✅ fiksna visina da budu identični */
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1; /* ✅ sprječava različitu vertikalnu visinu */
}

.submit-btn {
  background-color: #4aa3ff;
  color: white;
}

.submit-btn:hover {
  background-color: #3a91e0;
  transform: translateY(-1px);
}

.cancel-btn {
  background-color: #ff7f7f;
  color: white;
}

.cancel-btn:hover {
  background-color: #e86a6a;
  transform: translateY(-1px);
}
```
**Datum završetka: 8.11.2025. Utrošeno vrijeme: ~6 sati**

# User lista na admin pageu
## Podijeliti admin page na unit i users tabove
### RentalUnits.jsx
Mjenjanje početka glavne metode RentalUnits u...
```
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("units");
  const [units, setUnits] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
```
Na kraj useEffect metode dodajemo. Ovime postavljamo trenutnog usera kako bismo kasnije mogli brisati druge korisnike i zabraniti useru da briše sam sebe. <br>
Također povlačimo sve jedinice i usere.
```
    setCurrentUser(user);

    fetchUnits();
    fetchUsers();
  }, [navigate]);
```
Dodana metoda fetchanja usera iz baze podataka kako bi se podaci prikazali u listi.
```
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
```
Dodana provjera i slanje tokena kod brisanja unita.
```
const token = localStorage.getItem("access_token"); 
const response = await fetch(`${process.env.REACT_APP_API_URL}/deletePerson/${id}`, {
  method: "DELETE",
  headers: {
    Authorization: `Bearer ${token}`,
  },
```
Dodajemo metodu brisanja korisnika. Pazimo da korisnik ne može obrisati sam sebe te šaljemo token usera da provjerimo je li admin kad pokuša obrisati neki profil.
```
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
```
Na kraju mjenjamo return za admin dashboard jer smo morali mjenjati struktura zbog user taba. U kratko odvajamo user tab i unit tab, slažemo prijašnje buttone i na kraju mjenjamo export name jer više nisu samo rentalunits na tom pageu.
```
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
```
### RentalUnits.css
Opet smo morali mjenjati stil stranice kako bi se posložilo sve ispravno.
```
/* ========== NOVO: LAYOUT ZA ADMIN DASHBOARD ========== */
.admin-dashboard {
  display: flex;
  gap: 20px;
  margin: 40px auto;
  max-width: 1200px;
  padding: 20px;
}

/* Sidebar lijevo */
.sidebar {
  width: 220px;
  background: #e8f4fd;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 100, 200, 0.1);
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.sidebar h2 {
  color: #025c9a;
  text-align: center;
  margin-bottom: 20px;
}

.tab-btn {
  padding: 10px 12px;
  margin-bottom: 10px;
  border: none;
  border-radius: 8px;
  background: #cfe7fc;
  color: #03426a;
  cursor: pointer;
  transition: background 0.3s ease;
  font-size: 15px;
  font-weight: 500;
}

.tab-btn.active {
  background-color: #4aa3ff;
  color: white;
}

.tab-btn:hover {
  background-color: #b5d5f5;
}

.back-main-btn {
  margin-top: auto;
  padding: 10px 15px;
  background-color: #007bff;
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease-in-out;
}

.back-main-btn:hover {
  background-color: #0056b3;
}

/* Glavni sadržaj desno */
.dashboard-content {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 100, 200, 0.1);
  padding: 25px;
}

/* Sekcije unutar dashboarda */
.section-block {
  background: #f9fcff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 100, 200, 0.05);
  margin-bottom: 20px;
}

.section-block h1 {
  color: #025c9a;
  margin-bottom: 15px;
  text-align: left;
}

/* ========== TABLICA KORISNIKA ========== */
.users-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 15px;
}

.users-table th,
.users-table td {
  padding: 10px;
  border-bottom: 1px solid #cde4fa;
  text-align: left;
}

.users-table th {
  background-color: #e8f4fd;
  font-weight: 600;
  color: #025c9a;
}

.users-table tr:hover {
  background-color: #f0faff;
}

/* Roli */
.role-admin {
  color: #e74c3c;
  font-weight: bold;
}

.role-owner {
  color: #f39c12;
  font-weight: 600;
}

.role-user {
  color: #2e8b57;
}

/* Gumbi unutar tablice korisnika */
.user-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.delete-user-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s ease-in-out;
}

.delete-user-btn:hover {
  background-color: #b02a37;
}
/* ========== POPRAVLJEN STIL ZA RENTAL UNITS BLOK ========== */
.rental-units-container {
  background: #f9fcff;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 100, 200, 0.05);
}

.rental-units-container .title {
  color: #03426a;
  text-align: left;
  margin-bottom: 20px;
  font-size: 22px;
}

.rental-units-container .units-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.unit-item {
  flex: 1 1 calc(50% - 12px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background-color: #fff;
  border: 1px solid #d5e6f8;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 100, 200, 0.05);
  transition: transform 0.1s ease-in-out, box-shadow 0.2s ease-in-out;
}

.unit-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(0, 100, 200, 0.1);
}

.unit-info {
  display: flex;
  flex-direction: column;
}

.unit-name {
  font-weight: 600;
  color: #03426a;
}

.unit-type {
  color: #666;
  font-size: 0.9em;
}

.unit-actions button {
  margin-left: 8px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.edit-button {
  background-color: #4aa3ff;
  color: white;
}

.edit-button:hover {
  background-color: #3a91e0;
}

.delete-button {
  background-color: #dc3545;
  color: white;
}

.delete-button:hover {
  background-color: #b02a37;
}

.create-button {
  margin-top: 20px;
  width: 100%;
  padding: 10px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.create-button:hover {
  background-color: #218838;
}

/* Header row with back button */
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.back-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s ease-in-out;
}

.back-button:hover {
  background-color: #0056b3;
}
/* ✅ Centriranje rental units unutar kontejnera */
.rental-units-container .units-list {
  justify-content: center; /* centrira sve jedinice */
}

.unit-item {
  flex: 0 1 280px; /* fiksna širina — izgled ujednačen */
  margin: 6px;
}

/* Lagano poravnanje gumba ispod liste */
.create-button {
  display: block;
  margin: 25px auto 0 auto; /* centriran gumb */
  width: 280px; /* isto kao jedinice */
}

/* Disable style for delete button */
.disabled-btn {
  background-color: #ccc !important;
  color: #666 !important;
  cursor: not-allowed !important;
  border: none !important;
  opacity: 0.5;
}

.users-table .delete-button {
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  background-color: #dc3545;
  color: white;
  cursor: pointer;
  transition: 0.2s;
}

.users-table .delete-button:hover:not(:disabled) {
  background-color: #b92b38;
}
```
## Funkcionalnost brisanja korisnika
### navbar.jsx
Moramo spremiti token kako bismo mogli identificirati admina i potvrditi da je to on. U logout treba dodati...
```
localStorage.removeItem("access_token"); 
```
...dok u signin treba dodati.
```
localStorage.setItem("access_token", idToken);
```
### PersonController.java
Moramo promjeniti deletePerson funkciju kako bi pravilno provjeravala je li osoba admin ili nije u bazi.
```
public ResponseEntity<?> deletePerson(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        Optional<Person> current = repo.findByEmail(email);

        if (current.isEmpty()) return ResponseEntity.status(403).body("Unauthorized");

        Person currentUser = current.get();
        if (currentUser.getId().equals(id)) {
            return ResponseEntity.status(403).body("You cannot delete yourself!");
        }

        repo.deleteById(id);
        return ResponseEntity.ok("User deleted");
    }
```
**Datum završetka: 8.11.2025. Utrošeno vrijeme: ~1 sat**