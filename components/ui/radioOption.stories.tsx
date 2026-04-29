import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { RadioOption } from './radioOption';

const meta = {
  title: 'UI/RadioOption',
  component: RadioOption,
  tags: ['autodocs'],
  render: (args) => {
    const Demo = () => {
      const [selectedValue, setSelectedValue] = useState(args.value);

      return (
        <div className="w-[320px] space-y-3">
          {['xlm', 'usdc'].map((value) => (
            <RadioOption
              key={value}
              {...args}
              id={value}
              value={value}
              label={value.toUpperCase()}
              checked={selectedValue === value}
              onChange={(event) => setSelectedValue(event.target.value)}
            />
          ))}
        </div>
      );
    };

    return <Demo />;
  },
  args: {
    id: 'xlm',
    name: 'asset',
    value: 'xlm',
    label: 'XLM',
    checked: true,
    onChange: () => undefined,
  },
} satisfies Meta<typeof RadioOption>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
