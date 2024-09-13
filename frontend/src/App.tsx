import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { HostPage } from "./pages/HostPage";
import { GuestPage } from "./pages/GuestPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage/>}/>
        <Route path="/host" element={<HostPage/>}/>
        <Route path="/guest" element={<GuestPage/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
