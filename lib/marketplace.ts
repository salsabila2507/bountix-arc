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
  accessLevel: "early_contributor";
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
    budget: "420 USDC",
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
    accessLevel: "early_contributor",
  },
  {
    id: "task-landing-qa",
    title: "Run mobile QA pass across Bountix landing and signup",
    summary:
      "Audit visual layout, form states, copy issues, and edge-case responsiveness across common mobile widths.",
    budget: "180 USDC",
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
    accessLevel: "early_contributor",
  },
  {
    id: "task-operator-playbook",
    title: "Draft the first operator quality playbook",
    summary:
      "Turn our task execution standards into a concise playbook for incoming operators and reviewers.",
    budget: "650 USDC",
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
    accessLevel: "early_contributor",
  },
];

export const creators: Creator[] = [];

export const services: Service[] = [];

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
