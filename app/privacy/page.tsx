import React from 'react';
import { LegalLayout } from '@/components/legal/LegalLayout';

const SECTIONS = [
  { id: 'collection', title: '1. Information Collection' },
  { id: 'usage', title: '2. How We Use Information' },
  { id: 'sharing', title: '3. Information Sharing' },
  { id: 'blockchain-privacy', title: '4. Blockchain Transparency' },
  { id: 'security', title: '5. Data Security' },
  { id: 'rights', title: '6. Your Rights' },
];

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      lastUpdated="April 27, 2026"
      sections={SECTIONS}
    >
      <section id="collection">
        <h2 className="text-2xl font-bold mb-4">1. Information Collection</h2>
        <p>
          We collect information you provide directly to us when you create an account, make a donation, or communicate with us. This may include your name, email address, and Stellar wallet address.
        </p>
      </section>

      <section id="usage">
        <h2 className="text-2xl font-bold mb-4">2. How We Use Information</h2>
        <p>
          We use the information we collect to provide, maintain, and improve our services, to process transactions, and to send you technical notices and support messages.
        </p>
      </section>

      <section id="sharing">
        <h2 className="text-2xl font-bold mb-4">3. Information Sharing</h2>
        <p>
          We do not share your personal information with third parties except as described in this policy or with your consent. We may share information to comply with legal obligations or protect our rights.
        </p>
      </section>

      <section id="blockchain-privacy">
        <h2 className="text-2xl font-bold mb-4">4. Blockchain Transparency</h2>
        <p>
          Please be aware that any transaction on the Stellar network is public. Your wallet address and donation amounts are recorded on the public ledger and can be viewed by anyone using a block explorer.
        </p>
      </section>

      <section id="security">
        <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
        <p>
          We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access. However, no internet transmission is ever fully secure or error-free.
        </p>
      </section>

      <section id="rights">
        <h2 className="text-2xl font-bold mb-4">6. Your Rights</h2>
        <p>
          Depending on your location, you may have the right to access, correct, or delete your personal data. Contact us at privacy@stellaraid.org to exercise these rights.
        </p>
      </section>
    </LegalLayout>
  );
}
