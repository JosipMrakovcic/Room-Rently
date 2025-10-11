import Header from "../../components/header/Header";
import Maillist from "../../components/maillist/maillist";
import Footer from "../../components/footer/footer";
import Navbar from "../../components/navbar/navbar";
import { useState } from "react";
import "./hotel.css";

const Hotel=  ()=>{
    const [slidenumber,setslidenumber] = useState(0)
     const [open,setopen] = useState(false)
    const photos=[
        {
            src: "/20210710_084619.jpg"
        },
        {
            src: "/20210710_085443.jpg"
        },
        {
            src: "/20210710_085121.jpg"
        },
        {
            src: "/20210710_085154.jpg"
        },
        {
            src: "/20210710_085438.jpg"
        },
        {
            src: "/20210710_085443.jpg"
        },
    ];
    const handleopen=(i)=>{
        setslidenumber(i)
        setopen(true)
    }
    const handlemove=(direction)=>{
        let newslidenumber;
        if(direction==="l"){
            newslidenumber=slidenumber===0? 5: slidenumber-1
        }
        else{
             newslidenumber=slidenumber===5? 0: slidenumber+1
        }
        setslidenumber(newslidenumber)
    }
    return(
        <div>
            <Navbar></Navbar>
            <Header type="list"></Header>
            <div className="hotelcontainer">
                {open&&<div className="slider">
                    <span className="close" onClick={()=>setopen(false)}>❌</span>
                    <span className="arrow" onClick={()=>handlemove("l")}>⬅️</span>
                    <div className="sliderwrapper">
                        <img src={photos[slidenumber].src} alt="" className="sliderimg" />
                    </div>
                    <span className="arrow" onClick={()=>handlemove("r")}>➡️</span>
                </div>}
                <div className="hotelwrapper">
                     
                    
                    <button className="booknow">Reserve or book now</button>
                    <h1 className="hoteltitle">Apartments Ani</h1>
                    <div className="hoteladress">
                        {/* logo */}
                        <span>Odranska ulica 8 Zagreb</span>
                    </div>
                    <span className="hoteldistance">Excelent location -500m from center</span>
                    <span className="hotelpricehighlight">Book a stay over 67$ at this property and get a free airport taxi</span>
                    <div className="hotelimages">
                        {photos.map((photo, index) => (
                        <div className="hotelimgwrapper" key={index}>
                        <img onClick={()=>handleopen(index)}src={photo.src} alt="" className="hotelimg" />
                        </div>
                        ))}
                    </div>
                    <div className="hoteldetails">
                        <div className="hoteldetailstexts">
                            <h1 className="hoteltitle">Stay in the heart of Krakow</h1>
                            <p className="hoteldesc">
                                Located a 5-minute walk from St. Florian's Gate in Krakow, Tower
                                Street Apartments has accommodations with air conditioning and
                                free WiFi. The units come with hardwood floors and feature a
                                fully equipped kitchenette with a microwave, a flat-screen TV,
                                and a private bathroom with shower and a hairdryer. A fridge is
                                also offered, as well as an electric tea pot and a coffee
                                machine. Popular points of interest near the apartment include
                                Cloth Hall, Main Market Square and Town Hall Tower. The nearest
                                airport is John Paul II International Kraków Balice, 16.1 km
                                from Tower Street Apartments, and the property offers a paid
                                airport shuttle service.
                            </p>
                        </div>
                        <div className="hoteldetailsprice">
                            <div className="hotelDetailsPrice">
                                <h1>Perfect for a 9-night stay !</h1>
                                <span>
                                Located in the real heart of Krakow, this property has an
                                excellent location score of 9.8!
                                </span>
                                    <h2>
                                <b>$945</b>(9 nights)
                                </h2>
                                <button>Reserve or Book Now !</button>
                                </div>
                        </div>
                    </div>

                    </div>
                    <Maillist/>
                    <Footer></Footer>
            </div>
        </div>
    )
}
export default Hotel