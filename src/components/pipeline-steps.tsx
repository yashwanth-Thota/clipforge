import { DollarSign, Radar, Scissors, Share2, Youtube } from "lucide-react";

const STEPS = [
  { icon: Youtube, title: "Connect", body: "Paste a channel or video URL, or upload a file." },
  { icon: Radar, title: "Detect", body: "We watch for new uploads — no refresh needed." },
  { icon: Scissors, title: "AI Clip", body: "Score viral moments and cut Shorts-ready clips." },
  { icon: Share2, title: "Auto-Post", body: "Publish to YouTube, TikTok & Reels (opt-in)." },
  { icon: DollarSign, title: "Earn", body: "Monetization hooks, ready to switch on." },
];

export function PipelineSteps() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        return (
          <div key={step.title} className="relative flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-foreground">
              <Icon className="h-6 w-6" />
            </div>
            <div className="mt-3 text-sm font-semibold">{step.title}</div>
            <p className="mt-1 text-xs text-muted-foreground">{step.body}</p>
            <span className="absolute -left-3 top-6 text-xs text-muted-foreground/50">
              {i > 0 ? "→" : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}
