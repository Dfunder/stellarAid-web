import React from 'react';
import { Metadata } from 'next';
import { LegalLayout } from '@/components/legal/LegalLayout';

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read StellarAid's terms of service. Understand the rules and guidelines for using our platform for transparent charitable donations.",
  openGraph: {
    title: "Terms of Service | StellarAid",
    description: "Read StellarAid's terms of service. Understand the rules and guidelines for using our platform for transparent charitable donations.",
    url: "/terms",
  },
  twitter: {
    title: "Terms of Service | StellarAid",
    description: "Read StellarAid's terms of service. Understand the rules and guidelines for using our platform for transparent charitable donations.",
  },
};

const SECTIONS = [
  { id: 'acceptance', title: '1. Acceptance of Terms' },
  { id: 'description', title: '2. Description of Service' },
  { id: 'eligibility', title: '3. User Eligibility' },
  { id: 'donations', title: '4. Donations and Fees' },
  { id: 'blockchain', title: '5. Blockchain & Stellar Network' },
  { id: 'liability', title: '6. Limitation of Liability' },
  { id: 'termination', title: '7. Termination' },
];

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      lastUpdated="April 27, 2026"
      sections={SECTIONS}
    >
      <section id="acceptance">
        <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
        <p>
          By accessing or using the StellarAid platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
        </p>
      </section>

      <section id="description">
        <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
        <p>
          StellarAid provides a decentralized platform that connects donors with charitable projects using the Stellar blockchain network. We facilitate the transfer of digital assets (such as USDC and XLM) from donors to project creators.
        </p>
      </section>

      <section id="eligibility">
        <h2 className="text-2xl font-bold mb-4">3. User Eligibility</h2>
        <p>
          You must be at least 18 years of age to use this service. By using StellarAid, you represent and warrant that you have the right, authority, and capacity to enter into this agreement.
        </p>
      </section>

      <section id="donations">
        <h2 className="text-2xl font-bold mb-4">4. Donations and Fees</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>All donations made through StellarAid are final and non-refundable once settled on the blockchain.</li>
          <li>StellarAid may charge a platform fee for each donation to cover operational costs.</li>
          <li>Users are responsible for any network fees (base reserve/gas) associated with their transactions on the Stellar network.</li>
        </ul>
      </section>

      <section id="blockchain">
        <h2 className="text-2xl font-bold mb-4">5. Blockchain & Stellar Network</h2>
        <p>
          StellarAid operates on the Stellar network. We do not control the blockchain and cannot reverse transactions. You acknowledge that blockchain technology involves inherent risks, including but not limited to, price volatility and technical vulnerabilities.
        </p>
      </section>

      <section id="liability">
        <h2 className="text-2xl font-bold mb-4">6. Limitation of Liability</h2>
        <p>
          In no event shall StellarAid or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the platform.
        </p>
      </section>

      <section id="termination">
        <h2 className="text-2xl font-bold mb-4">7. Termination</h2>
        <p>
          We reserve the right to terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
        </p>
      </section>
    </LegalLayout>
  );
}
