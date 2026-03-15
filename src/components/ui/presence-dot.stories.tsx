import type { Meta, StoryObj } from "@storybook/react";
import { PresenceDot } from "@/components/ui/presence-dot";

const meta = {
  title: "UI/PresenceDot",
  component: PresenceDot,
  tags: ["autodocs"],
} satisfies Meta<typeof PresenceDot>;

export default meta;

type Story = StoryObj<typeof meta>;

export const States: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <PresenceDot tone="online" />
        <span className="text-sm">online</span>
      </div>
      <div className="flex items-center gap-2">
        <PresenceDot tone="away" />
        <span className="text-sm">away</span>
      </div>
      <div className="flex items-center gap-2">
        <PresenceDot tone="editing" pulse />
        <span className="text-sm">editing</span>
      </div>
      <div className="flex items-center gap-2">
        <PresenceDot tone="offline" />
        <span className="text-sm">offline</span>
      </div>
    </div>
  ),
};
