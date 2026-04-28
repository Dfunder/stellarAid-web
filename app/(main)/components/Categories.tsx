import React from "react";
import Link from "next/link";
import { Heart, GraduationCap, Leaf, Users, Home, Scale, Globe, Sparkles } from "lucide-react";

const categories = [
  { icon: <Heart className="w-6 h-6" />, name: "Health", slug: "health", count: 234 },
  { icon: <GraduationCap className="w-6 h-6" />, name: "Education", slug: "education", count: 189 },
  { icon: <Leaf className="w-6 h-6" />, name: "Environment", slug: "environment", count: 156 },
  { icon: <Users className="w-6 h-6" />, name: "Community", slug: "community", count: 142 },
  { icon: <Home className="w-6 h-6" />, name: "Disaster Relief", slug: "disaster_relief", count: 98 },
  { icon: <Scale className="w-6 h-6" />, name: "Human Rights", slug: "human_rights", count: 87 },
  { icon: <Globe className="w-6 h-6" />, name: "Poverty", slug: "poverty", count: 203 },
  { icon: <Sparkles className="w-6 h-6" />, name: "Other", slug: "other", count: 76 },
];

export default function Categories() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            Explore by Category
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Find causes that matter to you across diverse impact areas.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/explore?category=${cat.slug}`}
              className="group bg-card border border-border rounded-xl p-6 hover:shadow-md hover:border-primary/50 transition-all duration-200"
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {cat.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{cat.count} projects</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
