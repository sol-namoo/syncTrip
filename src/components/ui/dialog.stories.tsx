import type { Meta, StoryObj } from "@storybook/react"
import { Button } from "./button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog"

const meta = {
  title: "UI/Dialog",
  component: Dialog,
  tags: ["autodocs"],
} satisfies Meta<typeof Dialog>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>친구 초대</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>친구 초대</DialogTitle>
          <DialogDescription>
            링크를 복사해서 친구에게 공유하면 같은 여행 스페이스에 참여할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm">
          https://app.example.com/workspace/demo-trip
        </div>
        <DialogFooter>
          <Button variant="outline">취소</Button>
          <Button>링크 복사</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}
