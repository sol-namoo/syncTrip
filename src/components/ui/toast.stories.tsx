import type { Meta, StoryObj } from "@storybook/react"
import { Button } from "@/components/ui/button"
import { Toaster, toast } from "@/components/ui/toast"

const meta = {
  title: "UI/Toast",
  component: Button,
  tags: ["autodocs"],
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Toaster richColors position="top-right" />
      <Button
        onClick={() =>
          toast.success("초대 링크를 복사했습니다", {
            description: "친구에게 공유해 함께 여행을 편집할 수 있습니다.",
          })
        }
      >
        Toast 열기
      </Button>
    </div>
  ),
}
