import { useState } from "react";
import Navbar from "../components/navbar";
import Home from "./home";
import Editor from "./editor";
import Simulate from "./simulate/simulate";
import Docs from "./docs";
import { Trade } from "./trade";
import { Profile } from "./profile";

const Blink = () => {
    const [activePage, setActivePage] = useState("home");
    return(
        <div className="min-h-screen bg-[#181818]">
            <div className="text-white/50 p-4  sticky top-0 bg-transparent z-50">
                <Navbar setActivePage={setActivePage} activePage={activePage}/>
            </div>
            <div>
                {activePage === "home" && <Home setActivePage={setActivePage} />}
                {activePage === "docs" && <Docs/>}
                {activePage === "trade" && <Trade />}
                {activePage === "research" && <Editor />}
                {activePage === "simulate" && <Simulate />}
                {activePage === "profile" && <Profile />}
            </div>
        </div>
    )
}
export default Blink;