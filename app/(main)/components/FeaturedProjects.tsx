import React from 'react';
import Link from 'next/link';

const projects = [
  {
    id: 1,
    title: 'Clean Water Initiative',
    category: 'Health',
    progress: 90,
    raised: 45000,
    goal: 50000,
    imageGradient: 'from-cyan-400/20 to-blue-500/20',
  },
  {
    id: 2,
    title: 'School for Rural Communities',
    category: 'Education',
    progress: 71,
    raised: 28500,
    goal: 40000,
    imageGradient: 'from-blue-400/20 to-indigo-500/20',
  },
  {
    id: 3,
    title: 'Emergency Food Support',
    category: 'Disaster Relief',
    progress: 100,
    raised: 62100,
    goal: 60000,
    imageGradient: 'from-emerald-400/20 to-teal-500/20',
  },
];

const FeaturedProjects = () => {
  return (
    <section className="py-24 bg-[#f0f4fa]/50">
      <div className="container px-4 mx-auto max-w-[1280px]">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3 tracking-tight">
            Featured Projects
          </h2>
          <p className="text-neutral-500 text-lg font-medium">
            Making a real difference around the world
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-neutral-100 flex flex-col h-full"
            >
              {/* Card Image area */}
              <div className={`relative h-56 w-full bg-gradient-to-br ${project.imageGradient} flex items-center justify-center overflow-hidden`}>
                 <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-colors duration-300" />
                 {/* Decorative element */}
                 <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md border border-white/40 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500">
                    <div className="w-8 h-8 rounded-full bg-white/80 shadow-inner" />
                 </div>
              </div>

              {/* Card Content */}
              <div className="p-7 flex flex-col flex-grow">
                <span className="text-[11px] font-bold text-secondary-500 uppercase tracking-[0.1em] mb-3">
                  {project.category}
                </span>
                <h3 className="text-xl font-bold text-neutral-900 mb-6 group-hover:text-primary-600 transition-colors line-clamp-2">
                  {project.title}
                </h3>

                <div className="mt-auto space-y-6">
                  {/* Progress Section */}
                  <div>
                    <div className="flex justify-between items-end mb-2.5">
                      <span className="text-sm font-semibold text-neutral-400">Progress</span>
                      <span className="text-sm font-bold text-neutral-900">{project.progress}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-primary-600 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${Math.min(project.progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Funding Section */}
                  <div className="flex justify-between items-center gap-4 pt-2">
                    <div className="flex flex-col">
                      <span className="text-[15px] text-neutral-600">
                        <span className="font-bold text-neutral-900">${project.raised.toLocaleString()}</span>
                        <span className="mx-1 text-neutral-400">of</span>
                        <span className="text-neutral-500">${project.goal.toLocaleString()}</span>
                      </span>
                    </div>
                    <Link
                      href={`/projects/${project.id}`}
                      className="px-5 py-2 rounded-lg border border-neutral-200 text-sm font-bold text-neutral-800 hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200 shadow-sm"
                    >
                      Donate
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
