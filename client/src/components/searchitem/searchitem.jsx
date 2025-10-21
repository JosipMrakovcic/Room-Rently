import "./searchitem.css";

import axios from "axios";
import React, { useEffect, useState } from "react";
const api="http://localhost:8080/api"

const Searchitem=  ()=>{

    const [todos, setTodos] = useState([]);

     useEffect(() => {
        fetchTodos();
    }, []);

    const fetchTodos = async () => {
        try {
            const response = await axios.get('${api}/todos');
            setTodos(response.data);
        } catch (error) {
            console.error('Error fetching todos:', error);
        }
    };

    return(
        <div className="searchitem">
            <img src="20210710_084619.jpg" alt="" className="siimg" />
            <div className="sidesc">
                <h1 className="siTitle">Tower Street Apartments</h1>
                <span className="siDistance">500m from center</span>
                <span className="siTaxiOp">Free airport taxi</span>
                <span className="siSubtitle">
                    Studio Apartment with Air conditioning
                </span>
                <span className="siFeatures">
                Entire studio . 1 bathroom . 21m2 1 full bed
                </span>
                <span className="siCancelOp">Free cancellation </span>
                <span className="siCancelOpSubtitle">
                You can cancel later, so lock in this great price today!
                </span>
            </div>
            <div className="sidetails">
                <div className="sirating">
                    <span>Excellent</span>
                    <button>8.9</button>
                </div>
                <div className="sidetailtexts">
                    <span className="siprice">67$</span>
                    <span className="sitaxop">Includes taxes and fees</span>
                    <button className="sicheckbutton">See avalability</button>
                </div>
            </div>
        </div>
    )
}
export default Searchitem