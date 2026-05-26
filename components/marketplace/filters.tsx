import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const taskFilters = ["All", "Escrow", "Regular", "Negotiable", "Open"];
const creatorFilters = ["All", "Research", "Growth", "Design QA", "Escrow-ready"];
const filterColors = [
  "bg-[#ff4fb8] text-white",
  "bg-[#ffdd3d] text-[#140625]",
  "bg-[#38e7ff] text-[#140625]",
  "bg-[#f1d8ff] text-[#140625]",
  "bg-white text-[#140625]",
];

function FilterShell({
  label,
  filters,
}: {
  label: string;
  filters: string[];
}) {
  return (
    <div className="rounded-lg border-2 border-[#140625] bg-[#fffaf4] p-4 shadow-[6px_6px_0_#140625]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block lg:min-w-[320px]">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c3cff]"
          />
          <input
            type="search"
            placeholder={label}
            className="h-11 w-full rounded-lg border-2 border-[#140625] bg-white pl-10 pr-3 text-sm font-bold text-[#140625] placeholder:text-[#5a3b66]/50 outline-none transition focus:bg-[#fff8ed] focus:ring-2 focus:ring-[#38e7ff]"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter, index) => (
            <button
              key={filter}
              type="button"
              className={cn(
                "inline-flex min-h-10 items-center gap-2 rounded-lg border-2 border-[#140625] px-3 text-sm font-black shadow-[3px_3px_0_#140625] transition hover:-translate-y-0.5",
                filterColors[index % filterColors.length],
              )}
            >
              {filter === "All" ? (
                <SlidersHorizontal
                  aria-hidden="true"
                  className="h-3.5 w-3.5"
                />
              ) : null}
              {filter}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TaskFilters() {
  return <FilterShell label="Search tasks, skills, operators..." filters={taskFilters} />;
}

export function CreatorFilters() {
  return (
    <FilterShell label="Search creators, services, specialties..." filters={creatorFilters} />
  );
}
