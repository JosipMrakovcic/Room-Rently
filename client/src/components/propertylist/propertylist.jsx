import "./propertylist.css";

const Propertylist= ()=>{
    return(
        <div className="pList">
            <div className="plistItem">
                <img src="20210710_085121.jpg" alt="" className="plistimg" />
                <div className="plisttitle">
                    <h1>Hotels</h1>
                    <h2>69 hotels</h2>
                </div>
            </div>

            <div className="plistItem">
                <img src="20210710_085154.jpg" alt="" className="plistimg" />
                <div className="plisttitle">
                    <h1>Apartments</h1>
                    <h2>21 Apartments</h2>
                </div>
            </div>

            <div className="plistItem">
                <img src="20210710_085438.jpg" alt="" className="plistimg" />
                <div className="plisttitle">
                    <h1>Motels</h1>
                    <h2>67 Motels</h2>
                </div>
            </div>

            <div className="plistItem">
                <img src="20210710_085443.jpg" alt="" className="plistimg" />
                <div className="plisttitle">
                    <h1>Villas</h1>
                    <h2>420 Villas</h2>
                </div>
            </div>

            <div className="plistItem">
                <img src="20210710_084619.jpg" alt="" className="plistimg" />
                <div className="plisttitle">
                    <h1>Rooms</h1>
                    <h2>41 Rooms</h2>
                </div>
            </div>
        </div>
    )
}
export default Propertylist