import type { Meta, StoryObj } from "@storybook/react"
import { Avatar, AvatarFallback } from "./avatar"

const meta = {
  title: "UI/Avatar",
  component: Avatar,
  tags: ["autodocs"],
} satisfies Meta<typeof Avatar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarFallback>김</AvatarFallback>
      </Avatar>
      <Avatar className="size-12">
        <AvatarFallback>AP</AvatarFallback>
      </Avatar>
    </div>
  ),
}
