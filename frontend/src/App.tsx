import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { HostPage } from "./pages/HostPage";
import { GuestPage } from "./pages/GuestPage";
import { NavBar } from "./components/NavBar";
import { WebSocketProvider } from "./providers/webSocketProvider";
import { UserContextProvider } from "./providers/userProvider";


function App() {
  console.log("homepage")
  return (
    <div className="bg-black px-[20vh]">
      
      <NavBar />
      <WebSocketProvider>
        <UserContextProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/host" element={<HostPage />} />
              <Route path="/guest" element={<GuestPage />} />
            </Routes>
          </BrowserRouter>
        </UserContextProvider>
      </WebSocketProvider>
    </div>
  )
}

export default App
