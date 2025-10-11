import "./header.css";
import { useState } from "react";
import {DateRange} from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import {format} from  'date-fns'; // string format
import { useNavigate } from "react-router-dom";
const Header= ({type})=>{
    const [opendate,setOpendate] = useState(false)
    const [destination,setdestination] = useState("")
    const [date, setDate] = useState([
  {
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection'
  }
]);
    const [openOptions, setopenOptions] = useState(false);
    const [options, setoptions] = useState({
        adult:1,
        children:0,
        room:1,
    })
    const navigate = useNavigate()
    const handleSearch=()=>{
        navigate("/hotels",{state:{destination,date,options}})
    }
    const handleoption =(name,operation)=>{
        setoptions(prev=>{
            return{
                ...prev,[name]: operation==="i" ? options[name]+1:options[name]-1,
            }
        })
    }
    return(
        <div className="header">
            <div className={type==="list"? "headerContainer listmode":"headerContainer"}>

            <div className="headerList">

            <div className="headerListItem active" >
                {/* ikona*/}
            <span>Hotels</span>
            </div>

            <div className="headerListItem">
                {/* ikona*/}
            <span>Apartments</span>
            </div>
            
            </div>

            {type !== "list" &&<><h1 className="headerTitle">Josipova stranica? Možda ali nema Miku : ( </h1>
            <p className="headerDesc">noob u fortu</p>
            <button className="headerBTN">Sign in/Register</button>

            <div className="headerSearch">
            <div className="headerSearchItem">
                {/* ikona*/}
                <input type="text" placeholder="Where are you going?" className="headerSearchInput" onChange={e=>setdestination(e.target.value)}></input>
            </div>
            <div className="headerSearchItem" >
                {/* ikona*/}
                <span onClick={()=>setOpendate(!opendate)} className="headerSearchText">{`${format(date[0].startDate,"dd/MM/yyyy")} to ${format(date[0].endDate,"dd/MM/yyyy")}`}</span>
                {opendate&&<DateRange
                editableDateInputs={true}
                onChange={item => setDate([item.selection])}
                moveRangeOnFirstSelection={false}
                ranges={date}
                className="date"
                minDate={new Date()}
                />}
                </div>
            <div className="headerSearchItem">
                {/* ikona*/}
                <span onClick={()=>setopenOptions(!openOptions)} className="headerSearchText">{`${options.adult} adult - ${options.children} children - ${options.room} room`}</span>
                {openOptions&&<div className="options">
                    <div className="optionitem">
                        <span className="optiontext">Adult</span>

                        <div className="optioncounter">
                        <button disabled={options.adult<=1} className="optioncounterbutton" onClick={()=>{
                            handleoption("adult","d")
                        }}>-</button>
                        <span className="optioncounternumber" >{options.adult}</span>
                        <button className="optioncounterbutton" onClick={()=>{
                            handleoption("adult","i")
                        }}>+</button>
                        </div>
                    </div>
                    <div className="optionitem">
                        <span className="optiontext">Children</span>
                         <div className="optioncounter">
                        <button disabled={options.children<=0} className="optioncounterbutton" onClick={()=>{
                            handleoption("children","d")
                        }}>-</button>
                        <span className="optioncounternumber">{options.children}</span>
                        <button className="optioncounterbutton"onClick={()=>{
                            handleoption("children","i")
                        }}>+</button>
                        </div>
                    </div>
                    <div className="optionitem">
                        <span className="optiontext">Room</span>
                        <div className="optioncounter" >
                        <button disabled={options.room<=1} className="optioncounterbutton" onClick={()=>{
                            handleoption("room","d")
                        }}>-</button>
                        <span className="optioncounternumber">{options.room}</span>
                        <button className="optioncounterbutton" onClick={()=>{
                            handleoption("room","i")
                        }}>+</button>
                        </div>
                    </div>
                </div>}
            </div>
            <div className="headerSearchItem">
                {/* ikona*/}
                <button className="headerBTN" onClick={handleSearch}>Search</button>
            </div>

            </div>

                            </>}
            </div></div>
    )
}
export default Header