import type { Meta, StoryObj } from '@storybook/react';
import { Toast } from './Toast';

const meta = {
  title: 'UI/Toast',
  component: Toast,
  tags: ['autodocs'],
  args: {
    id: 'toast-demo',
    type: 'success',
    title: 'Donation confirmed',
    message: 'Your contribution has been recorded on the Stellar network.',
    duration: 'persistent',
    isClosable: true,
    onClose: () => undefined,
  },
} satisfies Meta<typeof Toast>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Success: Story = {};

export const Warning: Story = {
  args: {
    type: 'warning',
    title: 'Wallet attention needed',
    message: 'Reconnect your wallet to finish syncing offline changes.',
  },
};
