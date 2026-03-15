import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarStack } from "@/components/ui/avatar";

const meta = {
  title: "UI/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  args: {
    name: "Minji Kim",
    size: "md",
    status: "online",
  },
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

const users = [
  { id: "1", name: "Minji Kim", status: "online" as const },
  { id: "2", name: "Alex Park", status: "editing" as const },
  { id: "3", name: "Jamie Lee", status: "away" as const },
  { id: "4", name: "Taylor Song", status: "online" as const },
  { id: "5", name: "Chris Han", status: "offline" as const },
];

export const Default: Story = {};

export const Statuses: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <Avatar name="Minji Kim" status="online" />
      <Avatar name="Alex Park" status="editing" />
      <Avatar name="Jamie Lee" status="away" />
      <Avatar name="Chris Han" status="offline" />
      <Avatar name="Read Only" showStatus={false} />
    </div>
  ),
};

export const Stack: Story = {
  render: () => <AvatarStack users={users} max={4} />,
};
