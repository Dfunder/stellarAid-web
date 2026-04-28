export interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: 'donors' | 'creators' | 'stellar' | 'fees';
  relatedArticles?: {
    title: string;
    url: string;
  }[];
}

export const faqData: FAQItem[] = [
  {
    id: 1,
    category: 'donors',
    question: 'How do I make a donation to a project on StellarAid?',
    answer:
      'To make a donation, browse or search for a project you\'d like to support, click on the project to view its details, and click the "Donate" button. You\'ll be prompted to connect your Stellar wallet, select the asset and amount you want to donate, and confirm the transaction. The donation will be sent directly to the project\'s Stellar account on the blockchain.',
    relatedArticles: [
      {
        title: 'Understanding Stellar Assets and Tokens',
        url: '/docs/stellar-assets',
      },
      {
        title: 'Setting up Your Stellar Wallet',
        url: '/docs/wallet-setup',
      },
    ],
  },
  {
    id: 2,
    category: 'donors',
    question: 'Which payment methods are accepted for donations?',
    answer:
      'StellarAid accepts donations in any asset available on the Stellar network, including XLM (Lumens), USDC, and other Stellar-based tokens. You can donate using any Stellar wallet that supports the Stellar network, such as Freighter, LOBSTR, or Xellar.',
    relatedArticles: [
      {
        title: 'Supported Assets on StellarAid',
        url: '/docs/supported-assets',
      },
    ],
  },
  {
    id: 3,
    category: 'donors',
    question: 'Is my donation tax-deductible?',
    answer:
      'Tax deductibility depends on your local jurisdiction and the tax-exempt status of the specific project or organization receiving the donation. StellarAid provides donation receipts with transaction details that you can use for tax purposes. We recommend consulting with a tax professional in your jurisdiction to determine if your donation qualifies for tax deductions.',
    relatedArticles: [
      {
        title: 'Tax Information and Receipts',
        url: '/docs/tax-receipts',
      },
    ],
  },
  {
    id: 4,
    category: 'donors',
    question: 'How can I track my donation history?',
    answer:
      'Once you connect your Stellar wallet to StellarAid, you can view your complete donation history in your profile dashboard. This includes all past donations, transaction hashes, dates, and the projects you\'ve supported. Your donation history is permanently recorded on the Stellar blockchain and can be verified at any time using a Stellar block explorer.',
    relatedArticles: [
      {
        title: 'Managing Your Profile',
        url: '/docs/profile-management',
      },
      {
        title: 'Viewing Transaction History',
        url: '/docs/transaction-history',
      },
    ],
  },
  {
    id: 5,
    category: 'donors',
    question: 'Can I donate anonymously?',
    answer:
      'Yes, you can donate anonymously on StellarAid. While your Stellar wallet address will be visible on the blockchain as part of the transaction record, your personal identity is not linked to your donation unless you choose to connect a verified account. The project creator will see the donation amount and wallet address but not your personal information.',
    relatedArticles: [
      {
        title: 'Privacy and Data Protection',
        url: '/docs/privacy',
      },
    ],
  },
  {
    id: 6,
    category: 'creators',
    question: 'How do I create a fundraising project on StellarAid?',
    answer:
      'To create a fundraising project, click on the "Start a Project" button in your dashboard (you must be logged in). Fill out the project details including title, description, funding goal, category, and timeline. You\'ll need to provide information about how funds will be used and upload supporting images. Once submitted, your project will be reviewed by our team before going live.',
    relatedArticles: [
      {
        title: 'Project Creation Guidelines',
        url: '/docs/project-guidelines',
      },
      {
        title: 'Creating a Compelling Campaign',
        url: '/docs/campaign-best-practices',
      },
    ],
  },
  {
    id: 7,
    category: 'creators',
    question: 'How and when do I receive the funds raised?',
    answer:
      'Funds are sent directly to your Stellar wallet address specified during project creation. Since Stellar operates on blockchain technology, you receive funds in real-time as donations are made. There is no holding period or waiting time. You can withdraw or use the funds immediately once they arrive in your wallet.',
    relatedArticles: [
      {
        title: 'Managing Project Funds',
        url: '/docs/managing-funds',
      },
    ],
  },
  {
    id: 8,
    category: 'creators',
    question: 'What verification is required for project creators?',
    answer:
      'We require basic identity verification to prevent fraud and ensure legitimate fundraising campaigns. This includes providing a valid email address, government-issued ID for larger projects, and proof of your connection to the cause or organization you\'re raising funds for. Verification helps build trust with donors and increases your project\'s credibility.',
    relatedArticles: [
      {
        title: 'KYC and Verification Process',
        url: '/docs/kyc-process',
      },
    ],
  },
  {
    id: 9,
    category: 'creators',
    question: 'Can I update my project after it\'s live?',
    answer:
      'Yes, you can update certain aspects of your live project, including the project description, timeline updates, and milestone achievements. Major changes to funding goals or project scope may require re-approval. You can post updates in your project dashboard to keep donors informed about progress.',
    relatedArticles: [
      {
        title: 'Updating Project Information',
        url: '/docs/project-updates',
      },
    ],
  },
  {
    id: 10,
    category: 'stellar',
    question: 'What is Stellar and why does StellarAid use it?',
    answer:
      'Stellar is an open-source, decentralized blockchain network designed for fast, low-cost cross-border transactions and digital asset issuance. StellarAid uses Stellar because it provides instant settlement, minimal transaction fees (typically 0.00001 XLM), built-in asset issuance for custom tokens, and a proven, secure network that has been operational since 2014.',
    relatedArticles: [
      {
        title: 'Introduction to Stellar Blockchain',
        url: '/docs/stellar-intro',
      },
    ],
  },
  {
    id: 11,
    category: 'stellar',
    question: 'How secure are transactions on StellarAid?',
    answer:
      'Transactions on StellarAid are secured by the Stellar blockchain network, which uses federated Byzantine agreement (FBA) consensus. All donations are recorded immutably on the blockchain and can be independently verified. StellarAid does not hold or custody your funds - they go directly from donor to recipient wallet. We employ industry-standard encryption and security practices for all user data.',
    relatedArticles: [
      {
        title: 'Security and Transparency',
        url: '/docs/security',
      },
    ],
  },
  {
    id: 12,
    category: 'stellar',
    question: 'What is XLM and do I need it to donate?',
    answer:
      'XLM (Lumens) is the native cryptocurrency of the Stellar network. You need a small amount of XLM to activate a Stellar wallet account (minimum balance of 1 XLM) and to pay transaction fees, which are extremely low (0.00001 XLM per transaction). You can donate in other Stellar assets like USDC, but you\'ll still need XLM in your wallet to cover the transaction fee.',
    relatedArticles: [
      {
        title: 'Understanding XLM and Transaction Fees',
        url: '/docs/xlm-basics',
      },
    ],
  },
  {
    id: 13,
    category: 'fees',
    question: 'What fees does StellarAid charge for donations?',
    answer:
      'StellarAid charges a 2% platform fee on all donations to cover operational costs, payment processing, and platform maintenance. There are no setup fees, monthly fees, or hidden charges. The only other cost is the Stellar network transaction fee (0.00001 XLM), which is negligible. 100% of the platform fee goes toward maintaining and improving the StellarAid platform.',
    relatedArticles: [
      {
        title: 'Fee Structure Explained',
        url: '/docs/fee-structure',
      },
    ],
  },
  {
    id: 14,
    category: 'fees',
    question: 'Are there any hidden costs or withdrawal fees?',
    answer:
      'No, there are no hidden costs or withdrawal fees. The 2% platform fee is taken from the donation amount at the time of the transaction. When you withdraw funds from your project wallet to your personal Stellar wallet, there are no additional fees charged by StellarAid. The only cost is the minimal Stellar network fee for the withdrawal transaction (0.00001 XLM).',
    relatedArticles: [
      {
        title: 'Withdrawal Process and Fees',
        url: '/docs/withdrawals',
      },
    ],
  },
  {
    id: 15,
    category: 'fees',
    question: 'How does StellarAid compare to other fundraising platforms?',
    answer:
      'StellarAid offers significantly lower fees than traditional crowdfunding platforms (which often charge 5-10%). Our 2% platform fee is among the lowest in the industry. Combined with near-zero blockchain transaction fees on Stellar, donors get more value and creators keep more of their funds. We also provide instant settlement, global accessibility, and transparent, verifiable transactions through blockchain technology.',
    relatedArticles: [
      {
        title: 'Why Choose StellarAid',
        url: '/docs/why-stellaraid',
      },
    ],
  },
  {
    id: 16,
    category: 'fees',
    question: 'Is my credit card information secure?',
    answer:
      'StellarAid does not process credit card payments. All transactions occur on the Stellar blockchain using cryptocurrency. You fund your Stellar wallet through external exchanges or payment processors, then donate directly from your wallet. This approach provides an additional layer of security as we never store or process your payment information directly.',
    relatedArticles: [
      {
        title: 'Payment Security Practices',
        url: '/docs/payment-security',
      },
    ],
  },
];

export const categoryLabels: Record<string, string> = {
  donors: 'For Donors',
  creators: 'For Creators',
  stellar: 'About Stellar',
  fees: 'Fees & Pricing',
};

export const categoryDescriptions: Record<string, string> = {
  donors: 'Questions about making donations, tracking contributions, and donor benefits.',
  creators: 'Information for project creators about fundraising, verification, and payouts.',
  stellar: 'Technical questions about the Stellar blockchain and how it powers StellarAid.',
  fees: 'Details about platform fees, costs, and pricing comparisons.',
};
