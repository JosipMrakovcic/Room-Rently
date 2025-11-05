## Dodavanje CRUD operacija za smještajne jedinice

Većina operacija za dodavanje u bazu je već implementirana i opisana. Trebalo je samo u formi za submit ispravno slati backendu podatke. Payload napravljen na temelju baze podataka i tablice unit. <br>
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
