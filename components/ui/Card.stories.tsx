import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardBody, CardFooter, CardHeader } from './Card';
import { Button } from './Button';

const meta = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
  render: (args) => (
    <Card {...args} className="w-[360px]">
      <CardHeader>Clean Water Initiative</CardHeader>
      <CardBody>
        Delivering safe drinking water infrastructure to underserved communities.
      </CardBody>
      <CardFooter>
        <Button size="sm">View Project</Button>
      </CardFooter>
    </Card>
  ),
  args: {
    variant: 'elevated',
    padding: 'lg',
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Elevated: Story = {};

export const Outlined: Story = {
  args: {
    variant: 'outline',
  },
};
