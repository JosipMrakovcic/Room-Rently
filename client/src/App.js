import logo from './logo.svg';
import './App.css';
import LandingScreen from './screens/Landingscreen';

import{
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import Home from './pages/home/Home';
import List from './pages/list/List';
import Hotel from './pages/hotel/Hotel';
function App(){
  return(

    <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingScreen></LandingScreen>}></Route>
      <Route path="/main" element={<Home></Home>}></Route>
      <Route path="/hotels" element={<List/>}></Route>
      <Route path="/hotels/:id" element={<Hotel/>}></Route>
    </Routes>
    </BrowserRouter>
  )
}

export default App;
