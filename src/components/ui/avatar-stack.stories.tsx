import type { Meta, StoryObj } from "@storybook/react"
import { AvatarStack } from "./avatar-stack"

const meta = {
  title: "UI/AvatarStack",
  component: AvatarStack,
  tags: ["autodocs"],
} satisfies Meta<typeof AvatarStack>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    users: [
      { id: "1", name: "김민지", color: "teal", status: "online" },
      { id: "2", name: "Alex Park", color: "olive", status: "editing" },
      { id: "3", name: "Jamie Lee", color: "amber", status: "away" },
      { id: "4", name: "Chris Han", color: "slate", status: "offline" },
      { id: "5", name: "Taylor Song", color: "red", status: "online" },
    ],
    max: 4,
  },
}

export const EditingFocus: Story = {
  args: {
    users: [
      { id: "1", name: "김민지", color: "violet", status: "editing" },
      { id: "2", name: "Alex Park", color: "teal", status: "online" },
      { id: "3", name: "Jamie Lee", color: "amber", status: "away" },
    ],
    max: 4,
  },
}
