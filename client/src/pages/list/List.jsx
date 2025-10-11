import React from "react";
import "./list.css";
import Navbar from "../../components/navbar/navbar";
import Header from "../../components/header/Header";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { format } from "date-fns";
import { DateRange } from "react-date-range";
import Searchitem from "../../components/searchitem/searchitem";
const List=  ()=>{
    const location = useLocation()
    const [destination,setdestination] = useState(location.state.destination)
    const [date,setdate] = useState(location.state.date)
    const [opendate,setopendate] = useState(false)
    const [options,setoptions] = useState(location.state.options)
    return(
        <div><Navbar></Navbar><Header type ="list"></Header>
        <div className="listcontainer">
            <div className="listwrapper">
                <div className="listsearch">
                    <h1 className="lstitle">Search</h1>
                    <div className="lsitem">
                        <label >Destination</label>
                        <input placeholder={destination} type="text" />
                    </div>
                    <div className="lsitem">
                        <label >Check-in date</label>
                        <span onClick={()=>setopendate(!opendate)}>{`${format(date[0].startDate,"dd/MM/yyyy")} to ${format(date[0].endDate,"dd/MM/yyyy")}`}</span>
                       {opendate && <DateRange onChange={item=>setdate([item.selection])} minDate={new Date()} ranges={date} />}
                    </div>
                    <div className="lsitem">
                        <label >Options</label>
                        <div className="lsoptions">
                        <div className="lsoptionitem"> 
                            <span className="lsoptiontext">Min price <small>per night</small></span>
                            <input type="number" min={0}className="lsoptioninput" />
                        </div>
                        <div className="lsoptionitem"> 
                            <span className="lsoptiontext">Max price <small>per night</small></span>
                            <input type="number" min={0} className="lsoptioninput" />
                        </div>
                        <div className="lsoptionitem"> 
                            <span className="lsoptiontext" >Adult </span>
                            <input type="number" min={1} className="lsoptioninput" placeholder={options.adult} />
                        </div>
                        <div className="lsoptionitem"> 
                            <span className="lsoptiontext">Children </span>
                            <input type="number" className="lsoptioninput"  min={0}  placeholder={options.children}/>
                        </div>
                        <div className="lsoptionitem"> 
                            <span className="lsoptiontext">Room </span>
                            <input type="number" className="lsoptioninput"  min={1} placeholder={options.room}/>
                        </div>
                        </div>
                    </div>
                    <button>Search</button>
                </div>
                <div className="listresult">
                    <Searchitem/>
                    <Searchitem/>
                    <Searchitem/>
                    <Searchitem/>
                    <Searchitem/>
                    <Searchitem/>
                    <Searchitem/>
                    <Searchitem/>
                </div>
            </div>
        </div>
        
        
        </div>
    )
}
export default List