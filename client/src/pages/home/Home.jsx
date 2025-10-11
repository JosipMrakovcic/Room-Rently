import "./home.css";
import Navbar from "../../components/navbar/navbar";
import Footer from "../../components/footer/footer";
import Header from "../../components/header/Header";
import Featured from "../../components/featured/featured";
import Propertylist from "../../components/propertylist/propertylist";
import Featuredproperties from "../../components/featuredproperties/featuredproperties";
import Maillist from "../../components/maillist/maillist";
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
            <Maillist></Maillist>
            <Footer></Footer>
        </div>
        </div>
    )
}
export default Home