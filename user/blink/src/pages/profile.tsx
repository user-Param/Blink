import { useState } from "react";
import {
  User,
  Settings,
  Wallet,
  TrendingUp,
  Shield,
  Bell,
  Zap,
  Activity,
  BarChart3,
  Clock,
  ChevronRight,
  Edit3,
} from "lucide-react";

export const Profile = () => {
  const [showOverlay, setShowOverlay] = useState(true);
  // Hardcoded profile data
  const profile = {
    username: "Alex Quant",
    email: "alex@blinktrading.io",
    memberSince: "Jan 2025",
    balance: 148_250.75,
    activeStrategies: 4,
    totalBacktests: 247,
    winRate: 68.5,
    avatarColor: "#FF6D1F",
  };

  // Quick settings list
  const settingsItems = [
    { icon: Shield, label: "API Keys", desc: "Manage exchange connections" },
    { icon: Bell, label: "Notifications", desc: "Email, push, alerts" },
    { icon: Settings, label: "Preferences", desc: "Theme, language, units" },
    { icon: Edit3, label: "Edit Profile", desc: "Name, avatar, bio" },
  ];

  return (
    <div className="relative h-full overflow-y-auto text-white p-8">
    <div className="h-full overflow-y-auto  text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ---------- Profile Header ---------- */}
        <div className="relative overflow-hidden rounded-sm bg-gradient-to-br from-[#1a1a1a] via-[#141414] to-[#0f0f0f] border border-white/10 p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6D1F] opacity-[0.03] blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-28 h-28 rounded-full  from-[#FF6D1F]/30 to-[#FF6D1F]/10 flex items-center justify-center border-2 border-[#FF6D1F]/40 shadow-lg shadow-[#FF6D1F]/10">
                <User size={56} className="text-[#FF6D1F]" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 border-4 border-[#141414] rounded-full shadow-sm" />
            </div>
            {/* Info */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight">{profile.username}</h1>
              <p className="text-white/50 flex items-center justify-center md:justify-start gap-2">
                <Clock size={14} className="text-white/40" />
                Member since {profile.memberSince}
              </p>
              <p className="text-white/60 text-sm">{profile.email}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-semibold border border-green-500/20">
                  ● Active
                </span>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20">
                  Verified
                </span>
              </div>
            </div>
            {/* Edit Button */}
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-sm bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium">
              <Edit3 size={16} />
              Edit Profile
            </button>
          </div>
        </div>

        {/* ---------- Stats Grid ---------- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Wallet,
              label: "Total Balance",
              value: `$${profile.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
              color: "bg-[#FF6D1F]/10 border-[#FF6D1F]/30",
              textColor: "text-[#FF6D1F]",
            },
            {
              icon: Zap,
              label: "Active Strategies",
              value: profile.activeStrategies.toString(),
              color: "bg-blue-500/10 border-blue-500/30",
              textColor: "text-blue-400",
            },
            {
              icon: BarChart3,
              label: "Backtests Run",
              value: profile.totalBacktests.toString(),
              color: "bg-purple-500/10 border-purple-500/30",
              textColor: "text-purple-400",
            },
            {
              icon: Activity,
              label: "Win Rate",
              value: `${profile.winRate}%`,
              color: "bg-green-500/10 border-green-500/30",
              textColor: "text-green-400",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`p-5 rounded-sm border backdrop-blur-sm ${stat.color} shadow-lg hover:scale-[1.02] transition-all duration-300`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-sm bg-white/5`}>
                  <stat.icon size={20} className={stat.textColor} />
                </div>
                <p className="text-white/40 text-xs uppercase tracking-widest font-medium">
                  {stat.label}
                </p>
              </div>
              <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* ---------- Content Area ---------- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold ml-1">Quick Settings</h3>
            <div className="rounded-sm bg-white/[0.03] border border-white/5 divide-y divide-white/5">
              {settingsItems.map((item, i) => (
                <button
                  key={i}
                  className="w-full flex items-center justify-between p-5 hover:bg-white/[0.05] transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-sm bg-white/5 group-hover:bg-white/10 transition-colors">
                      <item.icon size={18} className="text-white/70" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-white/30">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-white/20 group-hover:text-white/50" />
                </button>
              ))}
            </div>
          </div>

          {/* Platform Overview Message */}
          <div className="lg:col-span-2 flex items-center justify-center">
            <div className="rounded-sm bg-white/[0.02] border border-white/5 p-10 w-full text-center">
              <div className="w-20 h-20 mx-auto rounded-sm bg-gradient-to-br from-[#FF6D1F]/20 to-purple-500/10 flex items-center justify-center mb-6">
                <TrendingUp size={36} className="text-[#FF6D1F]" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Welcome to your BLINK Dashboard</h2>
              <p className="text-white/40 max-w-md mx-auto leading-relaxed">
                Manage your algorithmic trading strategies, review backtest results,
                and monitor live deployments — all from one place. Your performance
                data will appear here once you run your first simulation.
              </p>
              <button className="mt-6 px-6 py-2.5 rounded-sm bg-[#FF6D1F] hover:bg-[#e55d1a] text-white font-semibold transition-colors shadow-lg shadow-[#FF6D1F]/20">
                Start Researching
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="max-w-md w-full mx-4 bg-[#0f0f0f] border border-white/10 shadow-2xl p-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Profile</h2>
        <p className="text-white/60">
          The Profile page is the central hub for users to manage their algorithmic trading identity, monitor performance, and configure platform settings.
        </p>
      </div>
    </div>
    </div>
  );
};