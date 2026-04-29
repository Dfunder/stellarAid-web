import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from './Spinner';

const meta = {
  title: 'UI/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  args: {
    size: 'md',
    color: 'primary',
    label: 'Loading donations',
  },
} satisfies Meta<typeof Spinner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FullScreen: Story = {
  args: {
    fullScreen: true,
    size: 'xl',
    label: 'Syncing wallet activity',
  },
};
