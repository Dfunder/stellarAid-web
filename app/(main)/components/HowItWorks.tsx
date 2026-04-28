import React from "react";
import { UserPlus, Search, Wallet, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: <UserPlus className="w-7 h-7 text-primary" />,
    step: "01",
    title: "Create an Account",
    description: "Sign up in minutes and connect your Stellar wallet to get started.",
  },
  {
    icon: <Search className="w-7 h-7 text-primary" />,
    step: "02",
    title: "Discover Projects",
    description: "Browse verified campaigns across health, education, environment, and more.",
  },
  {
    icon: <Wallet className="w-7 h-7 text-primary" />,
    step: "03",
    title: "Donate Securely",
    description: "Send XLM or any Stellar asset directly to the project wallet on-chain.",
  },
  {
    icon: <CheckCircle className="w-7 h-7 text-primary" />,
    step: "04",
    title: "Track Impact",
    description: "Follow real-time updates and verify every transaction on the blockchain.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            How It Works
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Four simple steps to make a transparent, verifiable impact.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s) => (
            <div key={s.step} className="flex flex-col items-center text-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  {s.icon}
                </div>
                <span className="absolute -top-2 -right-2 text-xs font-bold text-primary bg-background border border-border rounded-full w-6 h-6 flex items-center justify-center">
                  {s.step}
                </span>
              </div>
              <h3 className="text-lg font-bold text-foreground">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
