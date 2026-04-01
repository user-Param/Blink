import { Circle, CalendarDays, Tag, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type SimulateCardProps = {
  icon?: LucideIcon;
  title: string;
  description: string;
  stocks: string;
  date: string;
  source: string;
  isSelected?: boolean;
  onClick?: () => void;
};

const SimulateCard = ({
  icon: Icon = Circle,
  title,
  description,
  stocks,
  date,
  source,
  isSelected,
  onClick,
}: SimulateCardProps) => {
  return (
    <div 
      onClick={onClick}
      className={`relative h-full w-full rounded-2xl p-5 shadow-sm cursor-pointer transition-all duration-200 border-2 ${
        isSelected 
          ? "bg-[#2a2a2a] border-[#FF6D1F] scale-[1.02]" 
          : "bg-[#202020] border-transparent hover:border-white/10"
      }`}
    >
      {isSelected && (
        <div className="absolute top-4 right-4 text-[#FF6D1F]">
          <CheckCircle2 size={20} />
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
          <Icon className="h-6 w-6 text-orange-500" />
        </div>
      </div>

      <h2 className="text-[18px] font-semibold text-white/90">
        {title}
      </h2>

      <p className="mt-2 text-[13px] leading-5 text-white/40 line-clamp-2">
        {description}
      </p>

      <div className="mt-6 space-y-3 text-white/50">
        <div className="flex items-center gap-3">
          <Circle className="h-3.5 w-3.5" />
          <span className="text-[13px]">{stocks}</span>
        </div>

        <div className="flex items-center gap-3">
          <CalendarDays className="h-3.5 w-3.5" />
          <span className="text-[13px]">{date}</span>
        </div>

        <div className="flex items-center gap-3">
          <Tag className="h-3.5 w-3.5" />
          <span className="text-[13px]">{source}</span>
        </div>
      </div>
    </div>
  );
};

export default SimulateCard;