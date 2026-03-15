import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./badge";

const meta = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Tones: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge tone="neutral">동기화됨</Badge>
      <Badge tone="primary">Day 2</Badge>
      <Badge tone="success">접속 중</Badge>
      <Badge tone="warning">공동 편집 중</Badge>
      <Badge tone="danger">저장 실패</Badge>
      <Badge tone="outline">보기 전용</Badge>
    </div>
  ),
};
