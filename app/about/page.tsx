'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Globe, HeartHandshake } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { TeamProfile } from '@/components/about/TeamProfile';
import { ImpactStoryCard } from '@/components/about/ImpactStoryCard';
import { PressMentions } from '@/components/about/PressMentions';

const MOCK_TEAM = [
  {
    name: 'Sarah Chen',
    role: 'Executive Director',
    bio: 'Former UN aid coordinator with 10+ years of experience in global crisis response.',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800',
    socials: { linkedin: '#', twitter: '#' }
  },
  {
    name: 'David Okafor',
    role: 'Head of Technology',
    bio: 'Blockchain architect passionate about using decentralized systems for social good.',
    imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800',
    socials: { github: '#', linkedin: '#' }
  },
  {
    name: 'Elena Rodriguez',
    role: 'Community Lead',
    bio: 'Connecting donors with on-the-ground projects to ensure maximum impact.',
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800',
    socials: { twitter: '#' }
  }
];

const MOCK_PRESS = [
  {
    id: '1',
    source: 'TechForGood Magazine',
    quote: 'StellarAid is revolutionizing how we think about transparent charitable giving through blockchain technology.',
    date: 'March 2026'
  },
  {
    id: '2',
    source: 'Global Finance Weekly',
    quote: 'By drastically reducing cross-border transfer fees, more money is reaching those who actually need it.',
    date: 'January 2026'
  },
  {
    id: '3',
    source: 'Crypto Philanthropy Report',
    quote: 'A shining example of real-world utility in the Stellar ecosystem.',
    date: 'November 2025'
  }
];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero / Mission Statement */}
      <section className="relative bg-blue-900 text-white py-24 px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center mix-blend-overlay" />
        </div>
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Transparent Giving, Global Impact</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              StellarAid's mission is to eliminate the friction, opacity, and high costs of traditional charitable donations by leveraging the power of the Stellar network. We ensure that every cent you give goes directly where it's needed most.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Platform Statistics */}
      <section className="py-16 px-6 max-w-7xl mx-auto -mt-12 relative z-20">
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div variants={fadeIn}>
            <StatCard 
              title="Total Donations" 
              value={1250000} 
              type="currency" 
              precision={0} 
              icon={<HeartHandshake className="text-blue-600" />} 
              iconBg="bg-blue-100"
              className="shadow-xl"
            />
          </motion.div>
          <motion.div variants={fadeIn}>
            <StatCard 
              title="Active Projects" 
              value={42} 
              type="count" 
              icon={<Globe className="text-emerald-600" />} 
              iconBg="bg-emerald-100"
              className="shadow-xl"
            />
          </motion.div>
          <motion.div variants={fadeIn}>
            <StatCard 
              title="Avg. Transfer Fee" 
              value={0.001} 
              type="currency" 
              precision={3}
              icon={<Zap className="text-amber-600" />} 
              iconBg="bg-amber-100"
              className="shadow-xl"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Why Stellar? (Blockchain Transparency) */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why We Built on Stellar</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Traditional cross-border donations lose up to 10% in wire fees and exchange rates. Blockchain changes everything.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
              <p className="text-gray-600">Transactions settle in 3-5 seconds. In times of crisis, immediate funding saves lives.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">100% Transparent</h3>
              <p className="text-gray-600">Every donation is trackable on the public ledger. You can see exactly when the funds reach the project wallet.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Border-less</h3>
              <p className="text-gray-600">Send USDC or XLM anywhere in the world without worrying about correspondent banking networks.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Impact Stories */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }}
          variants={fadeIn}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Real Impact</h2>
          <p className="text-lg text-gray-600">See how direct, decentralized funding is changing lives on the ground.</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <ImpactStoryCard 
            quote="When the floods hit, we needed funds for water purifiers immediately. Traditional grants take months. Through StellarAid, we received USDC in seconds and bought supplies the same day."
            author="Maria G., Local Coordinator"
            location="Relief Project 2025"
            imageUrl="https://images.unsplash.com/photo-1593113580327-024ceae8ebec?auto=format&fit=crop&q=80&w=1200"
          />
        </motion.div>
      </section>

      {/* Team Profiles */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We are a group of humanitarians, developers, and designers united by a belief in decentralized technology for public good.
            </p>
          </motion.div>

          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {MOCK_TEAM.map((member, i) => (
              <motion.div key={i} variants={fadeIn}>
                <TeamProfile {...member} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Press / Media Mentions */}
      <section className="py-20 px-6 bg-gray-50 max-w-7xl mx-auto border-t border-gray-200 mt-10">
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }}
          variants={fadeIn}
          className="text-center mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What They're Saying</h2>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <PressMentions mentions={MOCK_PRESS} />
        </motion.div>
      </section>
    </div>
  );
}
