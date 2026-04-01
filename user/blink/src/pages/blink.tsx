import { useState } from "react";
import Navbar from "../components/navbar";
import Home from "./home";
import Editor from "./editor";
import Simulate from "./simulate/simulate";
import { Docs } from "./docs";
import { Trade } from "./trade";
import { Profile } from "./profile";

const Blink = () => {
    const [activePage, setActivePage] = useState("home");
    return(
        <>
        <div className="bg-[#181818] h-screen">
            <div className="text-white/50 p-2 border-b border-white/20">
                <Navbar setActivePage={setActivePage} activePage={activePage}/>
            </div>
            <div className="h-screen">
                {activePage === "home" && <Home />}
                {activePage === "docs" && <Docs/>}
                {activePage === "trade" && <Trade />}
                {activePage === "research" && <Editor />}
                {activePage === "simulate" && <Simulate />}
                {activePage === "profile" && <Profile />}
            </div>
        </div>
        </>
    )
}
export default Blink;