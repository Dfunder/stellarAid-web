import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    children: 'Support a Project',
    variant: 'primary',
    size: 'md',
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
};

export const OutlineLoading: Story = {
  args: {
    variant: 'outline',
    isLoading: true,
    children: 'Submitting',
  },
};
