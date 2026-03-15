import type { Meta, StoryObj } from "@storybook/react"
import { WifiOff, AlertTriangle } from "lucide-react"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "./alert"
import { Button } from "./button"

const meta = {
  title: "UI/Alert",
  component: Alert,
  tags: ["autodocs"],
} satisfies Meta<typeof Alert>

export default meta

type Story = StoryObj<typeof meta>

export const States: Story = {
  render: () => (
    <div className="grid w-[560px] gap-4">
      <Alert>
        <WifiOff className="size-4" />
        <AlertTitle>실시간 연결이 끊겼습니다</AlertTitle>
        <AlertDescription>변경사항은 재연결 후 다시 동기화됩니다.</AlertDescription>
      </Alert>

      <Alert variant="destructive">
        <AlertTriangle className="size-4" />
        <AlertTitle>저장 실패</AlertTitle>
        <AlertDescription>잠시 후 다시 시도하거나 새로고침해 주세요.</AlertDescription>
        <AlertAction>
          <Button size="sm" variant="outline">
            다시 시도
          </Button>
        </AlertAction>
      </Alert>
    </div>
  ),
}
