import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/ui/button";

const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "3D 여권 발급받기",
    variant: "primary",
    size: "md",
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="primary">Google로 계속하기</Button>
      <Button variant="secondary">친구 초대</Button>
      <Button variant="ghost">둘러보기</Button>
      <Button variant="danger">삭제</Button>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-2">
      <Button>기본 상태</Button>
      <Button data-hovered="true">Hover 상태</Button>
      <Button data-focused="true">Focus 상태</Button>
      <Button loading>Loading 상태</Button>
      <Button disabled>Disabled 상태</Button>
      <Button variant="secondary" size="lg">
        새 여행 만들기
      </Button>
    </div>
  ),
};
