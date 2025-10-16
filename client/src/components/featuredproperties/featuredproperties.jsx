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
            <img src="/20210710_084500.jpg" alt="" className="fpimg" />
            <span className="fpname" >Apartments Ani</span>
            <span className="fpcity">Paviljon 3</span>
            <span className="fpprice">Starting from 120$</span>
            <div className="fprating">
                <button>9.9</button>
                <span>Excellent</span>
            </div>
            </div>

            <div className="fpitem">
            <img src="/20200705_090916.jpg" alt="" className="fpimg" />
            <span className="fpname">Apartments Miku</span>
            <span className="fpcity">Paviljon 2</span>
            <span className="fpprice">Starting from 41$</span>
            <div className="fprating">
                <button>9.1</button>
                <span>Excellent</span>
            </div>
            </div>

            <div className="fpitem">
            <img src="/20200705_091411.jpg" alt="" className="fpimg" />
            <span className="fpname">Apartments Krapić</span>
            <span className="fpcity">Paviljon 1</span>
            <span className="fpprice">Starting from 12000$</span>
            <div className="fprating">
                <button>10.0</button>
                <span>Excellent</span>
            </div>
            </div>

            <div className="fpitem">
            <img src="/20200705_091230.jpg" alt="" className="fpimg" />
            <span className="fpname">Apartmani Jakov</span>
            <span className="fpcity">Paviljon 4</span>
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