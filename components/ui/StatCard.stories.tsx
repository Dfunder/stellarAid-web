import { DollarSign } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react';
import { StatCard } from './StatCard';

const meta = {
  title: 'UI/StatCard',
  component: StatCard,
  tags: ['autodocs'],
  args: {
    title: 'Funds Raised',
    value: 124500,
    previousValue: 100000,
    type: 'currency',
    description: 'Across all active campaigns this month.',
    info: 'Includes both XLM and supported Stellar assets.',
    icon: <DollarSign className="w-5 h-5 text-green-700" />,
    iconBg: 'bg-green-100',
  },
} satisfies Meta<typeof StatCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Currency: Story = {};

export const Loading: Story = {
  args: {
    loading: true,
  },
};
