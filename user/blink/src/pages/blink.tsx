import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "../components/navbar";
import Home from "./home";
import Editor from "./editor";
import Simulate from "./simulate/simulate";
import Docs from "./docs";
import { Trade } from "./trade";
import { Profile } from "./profile";
import Social from "./social";

const Blink = () => {
    const [activePage, setActivePage] = useState("home");
    return(
        <div className="min-h-screen bg-[#181818]">
            <div className="text-white/50 sticky top-0 bg-[#181818] z-50">
                <Navbar setActivePage={setActivePage} activePage={activePage}/>
            </div>
            <div>
  <Routes>
        <Route path="/" element={<Home setActivePage={setActivePage}/>} />
        <Route path="/trade" element={<Trade />} />
        <Route path="/research" element={<Editor />} />
        <Route path="/simulate" element={<Simulate />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/social" element={<Social />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
</div>
        </div>
    )
}
export default Blink;



