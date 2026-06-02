// Internal seed data for the "Recent completed work" marketplace section.
// Manual payment only. No escrow, no on-chain tx, no transaction hashes.

export type CompletedWork = {
  id: string;
  title: string;
  description: string;
  rewardAmount: number;
  rewardCurrency: "USDC";
  paymentMethod: "manual";
  status: "completed";
  taskType: string;
  project: string;
  worker: string;
  result: string;
};

export const completedWork: CompletedWork[] = [
  {
    id: "cw-web3-announcement-comment",
    title: "Comment on a Web3 announcement post",
    description:
      "Read the latest protocol announcement and leave a thoughtful, on-topic comment that adds context for the community.",
    rewardAmount: 12,
    rewardCurrency: "USDC",
    paymentMethod: "manual",
    status: "completed",
    taskType: "Engagement",
    project: "Aster Protocol",
    worker: "@lenacomments",
    result:
      "Posted a 3-sentence comment summarizing the roadmap change and tagged two relevant builders. Link to the comment submitted for review.",
  },
  {
    id: "cw-crypto-meme",
    title: "Create a meme for a crypto project",
    description:
      "Design a shareable meme that fits the project's voice and is ready to post across X and Telegram.",
    rewardAmount: 35,
    rewardCurrency: "USDC",
    paymentMethod: "manual",
    status: "completed",
    taskType: "Design",
    project: "Nimbus Finance",
    worker: "@pixeljuno",
    result:
      "Delivered two meme variants (1:1 and 16:9) with editable source files. Project picked variant A for the launch thread.",
  },
  {
    id: "cw-landing-feedback",
    title: "Test a landing page and submit feedback",
    description:
      "Walk through the new landing page on mobile and desktop, then report usability issues and copy suggestions.",
    rewardAmount: 28,
    rewardCurrency: "USDC",
    paymentMethod: "manual",
    status: "completed",
    taskType: "QA",
    project: "Orbital Labs",
    worker: "@mishqa",
    result:
      "Submitted a 9-point feedback list with screenshots: 3 layout issues on mobile, 2 broken anchor links, and 4 copy tweaks. All confirmed by the team.",
  },
  {
    id: "cw-telegram-community-feedback",
    title: "Join a Telegram community and give feedback",
    description:
      "Join the project's Telegram, observe the onboarding flow, and report what works and what is confusing for newcomers.",
    rewardAmount: 18,
    rewardCurrency: "USDC",
    paymentMethod: "manual",
    status: "completed",
    taskType: "Community",
    project: "Meridian DAO",
    worker: "@tovesignal",
    result:
      "Joined, completed onboarding, and submitted notes on the welcome flow plus three pinned-message improvements. Suggestions added to the mod backlog.",
  },
  {
    id: "cw-x-thread",
    title: "Write a short X thread about a product",
    description:
      "Write a concise 4-5 post thread explaining the product's main benefit with a clear call to action.",
    rewardAmount: 40,
    rewardCurrency: "USDC",
    paymentMethod: "manual",
    status: "completed",
    taskType: "Content",
    project: "Stride Wallet",
    worker: "@arcwrites",
    result:
      "Delivered a 5-post thread draft with hooks and a CTA. Reviewed for accuracy and approved for scheduling.",
  },
  {
    id: "cw-campaign-banner",
    title: "Create a simple campaign banner",
    description:
      "Produce a clean campaign banner sized for X and Telegram headers, matching the project's brand colors.",
    rewardAmount: 30,
    rewardCurrency: "USDC",
    paymentMethod: "manual",
    status: "completed",
    taskType: "Design",
    project: "Beacon Bridge",
    worker: "@studiomara",
    result:
      "Delivered banner in two sizes (X header and Telegram) plus a PNG export. Team confirmed it matched brand guidelines.",
  },
];
