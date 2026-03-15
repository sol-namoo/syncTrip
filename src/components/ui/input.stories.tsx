import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./input";

const meta = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  args: {
    placeholder: "도시나 장소를 검색하세요",
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const States: Story = {
  render: () => (
    <div className="grid w-[320px] gap-4">
      <Input placeholder="기본 상태" />
      <Input placeholder="Hover 상태" className="border-ring" />
      <Input placeholder="Focus 상태" className="ring-3 ring-ring/50" />
      <Input aria-invalid defaultValue="종료일이 시작일보다 빠릅니다" />
      <Input placeholder="비활성 상태" disabled defaultValue="보기 전용" />
    </div>
  ),
};
