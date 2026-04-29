import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  args: {
    label: 'Email address',
    placeholder: 'name@example.com',
    helperText: 'We only use this for project updates.',
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Success: Story = {
  args: {
    inputState: 'success',
    helperText: 'Looks good.',
    defaultValue: 'donor@stellaraid.org',
  },
};

export const Error: Story = {
  args: {
    inputState: 'error',
    error: 'A valid wallet email is required.',
  },
};
