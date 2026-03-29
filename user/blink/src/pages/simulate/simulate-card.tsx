import { Circle, CalendarDays, Tag } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type SimulateCardProps = {
  icon?: LucideIcon;
  title: string;
  description: string;
  stocks: string;
  date: string;
  source: string;
};

const SimulateCard = ({
  icon: Icon = Circle,
  title,
  description,
  stocks,
  date,
  source,
}: SimulateCardProps) => {
  return (
    <div className="h-[100%] w-[30%] rounded-2xl bg-[#202020] p-5 shadow-sm">
      <div className="mb-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
          <Icon className="h-6 w-6 text-orange-500" />
        </div>
      </div>

      <h2 className="text-[20px] text-[#5a5a5a]">
        {title}
      </h2>

      <p className="mt-4 text-[15px] leading-6 text-[#666]">
        {description}
      </p>

      <div className="mt-6 space-y-4 text-[#666]">
        <div className="flex items-center gap-3">
          <Circle className="h-4 w-4 text-[#666]" />
          <span className="text-[15px]">{stocks}</span>
        </div>

        <div className="flex items-center gap-3">
          <CalendarDays className="h-4 w-4 text-[#666]" />
          <span className="text-[15px]">{date}</span>
        </div>

        <div className="flex items-center gap-3">
          <Tag className="h-4 w-4 text-[#666]" />
          <span className="text-[15px]">{source}</span>
        </div>
      </div>
    </div>
  );
};

export default SimulateCard;