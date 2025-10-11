import "./featuredproperties.css";
import { useNavigate } from "react-router-dom";
const Featuredproperties= ()=>{
     const navigate = useNavigate()
    const handleapartman=()=>{
        navigate("/hotels/1")
        window.scrollTo(0, 0);
    }
    return(
        <div className="fp">
            <div className="fpitem" onClick={handleapartman}>
            <img src="logo192.png" alt="" className="fpimg" />
            <span className="fpname" >Apartments Ani</span>
            <span className="fpcity">Dramalj</span>
            <span className="fpprice">Starting from 120$</span>
            <div className="fprating">
                <button>9.9</button>
                <span>Excellent</span>
            </div>
            </div>

            <div className="fpitem">
            <img src="logo192.png" alt="" className="fpimg" />
            <span className="fpname">Apartments Miku</span>
            <span className="fpcity">Rijeka</span>
            <span className="fpprice">Starting from 1$</span>
            <div className="fprating">
                <button>9.1</button>
                <span>Excellent</span>
            </div>
            </div>

            <div className="fpitem">
            <img src="logo192.png" alt="" className="fpimg" />
            <span className="fpname">Apartments Krapić</span>
            <span className="fpcity">Opatija</span>
            <span className="fpprice">Starting from 12000$</span>
            <div className="fprating">
                <button>10.0</button>
                <span>Excellent</span>
            </div>
            </div>

            <div className="fpitem">
            <img src="logo192.png" alt="" className="fpimg" />
            <span className="fpname">Hotel trivago</span>
            <span className="fpcity">Pitomača</span>
            <span className="fpprice">Starting from 150$</span>
            <div className="fprating">
                <button>9.5</button>
                <span>Excellent</span>
            </div>
            </div>

            
        </div>
    )
}
export default Featuredproperties