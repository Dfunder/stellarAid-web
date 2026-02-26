import React from "react";
import { Shield, TrendingUp, Heart, Zap } from "lucide-react";

const features = [
  {
    icon: <Shield className="w-8 h-8 text-[#002E6D]" />,
    title: "Blockchain Verified",
    description: "Every transaction is verified on the Stellar network",
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-[#002E6D]" />,
    title: "Real-Time Impact",
    description: "Track your donation impact with live updates",
  },
  {
    icon: <Heart className="w-8 h-8 text-[#002E6D]" />,
    title: "Complete Transparency",
    description: "See exactly where your money goes",
  },
  {
    icon: <Zap className="w-8 h-8 text-[#002E6D]" />,
    title: "Low Fees",
    description: "More of your money reaches the cause",
  },
];

const WhyChooseUs: React.FC = () => {
  return (
    <section className="bg-[#F8FAFC] py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            Why choose StellarAid?
          </h2>
        </div>

        {/* Grid System */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl border border-[#E2E8F0] shadow-sm 
                         transition-all duration-300 ease-in-out 
                         hover:shadow-md hover:-translate-y-1 hover:border-[#CBD5E1]"
            >
              {/* Icon Container */}
              <div className="mb-6">
                {feature.icon}
              </div>

              {/* Text Content */}
              <h3 className="text-xl font-bold text-[#0F172A] mb-3">
                {feature.title}
              </h3>
              <p className="text-[#64748B] text-[0.95rem] leading-relaxed font-medium">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { WhyChooseUs };