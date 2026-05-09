import { Link, useLocation } from "react-router-dom";
import { Zap } from "lucide-react";

const Navbar = () => {
  const location = useLocation();

  const navLinks = [
    { name: "Home",     path: "/" },
    { name: "Docs",     path: "/docs" },
    { name: "Trade",    path: "/trade" },
    { name: "Research", path: "/research" },
    { name: "Simulate", path: "/simulate" },
    { name: "Social",   path: "/social" },
    { name: "Param",    path: "/profile" },
  ];

  return (
    <div className=" border border-white/30 flex items-center justify-between p-4">
      <Link to="/" className="flex items-center gap-2 cursor-pointer group">
        <div className="relative">
          <Zap className="text-[#FF6D1F] fill-[#FF6D1F] animate-pulse" size={20} />
        </div>
        <h2 className="text-white text-xl font-black tracking-tighter group-hover:text-[#FF6D1F] transition-colors">
          BLINK
        </h2>
      </Link>

      <div className="flex items-center gap-2">
        <div className="relative mr-4">
          <input
            className="border border-white/10 rounded-full px-4 py-1.5 bg-white/5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF6D1F]/50 transition-all w-48"
            type="text"
            placeholder="Search assets..."
          />
        </div>

        <div className="flex items-center">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-1 text-sm font-bold cursor-pointer transition-all relative group ${
                location.pathname === link.path
                  ? "text-white"
                  : "text-white/40 hover:text-white"
              }`}
            >
              {link.name}
              {location.pathname === link.path && (
                <div className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-[#FFFFFF] opacity-20"></div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Navbar;