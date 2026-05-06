import { useState } from "react";
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
            <div className="text-white/50 p-2 sticky top-0 bg-[#181818] z-50">
                <Navbar setActivePage={setActivePage} activePage={activePage}/>
            </div>
            <div>
  <div className={activePage === "home" ? "" : "hidden"}>
    <Home setActivePage={setActivePage} />
  </div>
  <div className={activePage === "docs" ? "" : "hidden"}>
    <Docs />
  </div>
  <div className={activePage === "trade" ? "" : "hidden"}>
    <Trade />
  </div>
  <div className={activePage === "research" ? "" : "hidden"}>
    <Editor />
  </div>
  <div className={activePage === "simulate" ? "" : "hidden"}>
    <Simulate />
  </div>
  <div className={activePage === "social" ? "" : "hidden"}>
    <Social />
  </div>
  <div className={activePage === "profile" ? "" : "hidden"}>
    <Profile />
  </div>
</div>
        </div>
    )
}
export default Blink;