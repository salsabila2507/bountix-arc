export type PaymentType = "regular" | "escrow";
export type TaskType = "task" | "service";
export type WorkStatus =
  | "open"
  | "reviewing"
  | "in_progress"
  | "submitted"
  | "completed";

export type Task = {
  id: string;
  title: string;
  summary: string;
  budget: string;
  paymentType: PaymentType;
  status: WorkStatus;
  category: string;
  postedBy: string;
  location: string;
  applicants: number;
  submissions: number;
  skills: string[];
  timeline: string;
  negotiable: boolean;
};

export type Creator = {
  id: string;
  name: string;
  handle: string;
  title: string;
  summary: string;
  reputation: number;
  completedTasks: number;
  approvalRate: string;
  responseTime: string;
  specialties: string[];
  services: string[];
  availableForEscrow: boolean;
};

export type Service = {
  id: string;
  creatorId: string;
  title: string;
  summary: string;
  startingAt: string;
  category: string;
  delivery: string;
  negotiable: boolean;
  paymentType: PaymentType;
};

export const tasks: Task[] = [
  {
    id: "task-market-map",
    title: "Map 40 active creator communities for launch outreach",
    summary:
      "Build a qualified list of Discord, Telegram, and X communities with contact notes and relevance score.",
    budget: "$420",
    paymentType: "escrow",
    status: "open",
    category: "Research",
    postedBy: "Bountix Launch",
    location: "Remote",
    applicants: 12,
    submissions: 2,
    skills: ["Research", "Community", "Spreadsheet ops"],
    timeline: "3 days",
    negotiable: true,
  },
  {
    id: "task-landing-qa",
    title: "Run mobile QA pass across Bountix landing and waitlist",
    summary:
      "Audit visual layout, form states, copy issues, and edge-case responsiveness across common mobile widths.",
    budget: "$180",
    paymentType: "regular",
    status: "reviewing",
    category: "QA",
    postedBy: "Frontend Ops",
    location: "Remote",
    applicants: 7,
    submissions: 1,
    skills: ["QA", "Mobile", "Frontend"],
    timeline: "24 hours",
    negotiable: false,
  },
  {
    id: "task-operator-playbook",
    title: "Draft the first operator quality playbook",
    summary:
      "Turn our task execution standards into a concise playbook for incoming operators and reviewers.",
    budget: "$650",
    paymentType: "escrow",
    status: "in_progress",
    category: "Operations",
    postedBy: "Protocol Ops",
    location: "Remote",
    applicants: 18,
    submissions: 4,
    skills: ["Docs", "Ops", "Workflow design"],
    timeline: "5 days",
    negotiable: true,
  },
];

export const creators: Creator[] = [
  {
    id: "maya-research",
    name: "Maya Chen",
    handle: "@mayaresearch",
    title: "Launch researcher and community mapper",
    summary:
      "Specializes in market maps, community intelligence, and structured outreach lists for early-stage products.",
    reputation: 94,
    completedTasks: 68,
    approvalRate: "98%",
    responseTime: "2h",
    specialties: ["Research", "Community", "Lead lists"],
    services: ["Community market map", "Competitor landscape"],
    availableForEscrow: true,
  },
  {
    id: "rio-growth",
    name: "Rio Tan",
    handle: "@riogrowth",
    title: "Growth systems operator",
    summary:
      "Builds lean launch systems, creator pipelines, campaign tracking, and weekly execution dashboards.",
    reputation: 89,
    completedTasks: 51,
    approvalRate: "96%",
    responseTime: "4h",
    specialties: ["Growth", "Automation", "Ops"],
    services: ["Launch ops sprint", "Campaign tracker setup"],
    availableForEscrow: true,
  },
  {
    id: "nina-designops",
    name: "Nina Park",
    handle: "@ninadesignops",
    title: "Design QA and product polish reviewer",
    summary:
      "Reviews product surfaces for layout quality, copy clarity, edge states, and startup-grade polish.",
    reputation: 87,
    completedTasks: 44,
    approvalRate: "97%",
    responseTime: "1 day",
    specialties: ["Design QA", "Copy review", "Frontend polish"],
    services: ["Landing page audit", "Mobile polish pass"],
    availableForEscrow: false,
  },
];

export const services: Service[] = [
  {
    id: "service-community-map",
    creatorId: "maya-research",
    title: "Community market map",
    summary:
      "A scored database of communities, owners, activity signals, and outreach priority.",
    startingAt: "$350",
    category: "Research",
    delivery: "3-5 days",
    negotiable: true,
    paymentType: "escrow",
  },
  {
    id: "service-growth-system",
    creatorId: "rio-growth",
    title: "Launch ops sprint",
    summary:
      "Set up the operating board, owner cadence, weekly reporting, and campaign task queue.",
    startingAt: "$700",
    category: "Growth",
    delivery: "1 week",
    negotiable: true,
    paymentType: "escrow",
  },
  {
    id: "service-mobile-polish",
    creatorId: "nina-designops",
    title: "Mobile polish pass",
    summary:
      "A focused UI audit covering responsive layout, hierarchy, readability, and form states.",
    startingAt: "$220",
    category: "Design QA",
    delivery: "48 hours",
    negotiable: false,
    paymentType: "regular",
  },
];

export const dashboardStats = [
  { label: "Open tasks", value: "8" },
  { label: "Active deals", value: "3" },
  { label: "Pending submissions", value: "5" },
  { label: "Escrow ready", value: "2" },
];

export function getTask(id: string) {
  return tasks.find((task) => task.id === id);
}

export function getCreator(id: string) {
  return creators.find((creator) => creator.id === id);
}

export function getCreatorServices(creatorId: string) {
  return services.filter((service) => service.creatorId === creatorId);
}
