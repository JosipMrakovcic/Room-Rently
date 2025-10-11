import "./home.css";
import Navbar from "../../components/navbar/navbar";
import Header from "../../components/header/Header";
import Featured from "../../components/featured/featured";
import Propertylist from "../../components/propertylist/propertylist";
import Featuredproperties from "../../components/featuredproperties/featuredproperties";
const Home= ()=>{
    return(
        <div>

        <Navbar></Navbar>
        <Header></Header>
        <div className="homecontainer">
            <Featured></Featured>
            <h1 className="hometitle">Browse by property type</h1>
            <Propertylist></Propertylist>
            <h1 className="hometitle">Homes guests love</h1>
            <Featuredproperties></Featuredproperties>
        </div>
        </div>
    )
}
export default Home