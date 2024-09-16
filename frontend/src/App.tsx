import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { HostPage } from "./pages/HostPage";
import { GuestPage } from "./pages/GuestPage";
import { NavBar } from "./components/navBar";


function App() {
  return (
  <div className="bg-black px-[20vh]">
    <NavBar/>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage/>}/>
        <Route path="/host" element={<HostPage/>}/>
        <Route path="/guest" element={<GuestPage/>}/>
      </Routes>
    </BrowserRouter>
    </div>
  )
}

export default App
