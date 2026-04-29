import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { Modal, ModalBody, ModalFooter, ModalHeader } from './Modal';

const meta = {
  title: 'UI/Modal',
  component: Modal,
  tags: ['autodocs'],
  render: (args) => {
    const Demo = () => {
      const [isOpen, setIsOpen] = useState(true);

      return (
        <div className="w-[420px]">
          <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
          <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
            <ModalHeader onClose={() => setIsOpen(false)}>
              Connect your wallet
            </ModalHeader>
            <ModalBody>
              Choose a Stellar wallet to continue donating with full on-chain transparency.
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsOpen(false)}>Continue</Button>
            </ModalFooter>
          </Modal>
        </div>
      );
    };

    return <Demo />;
  },
  args: {
    variant: 'centered',
    size: 'md',
    closeOnEscape: true,
    closeOnOverlayClick: true,
  },
} satisfies Meta<typeof Modal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => undefined,
  },
};

export const Large: Story = {
  args: {
    isOpen: true,
    onClose: () => undefined,
    size: 'lg',
  },
};
