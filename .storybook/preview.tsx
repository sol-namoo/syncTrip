import type { Preview } from "@storybook/react";
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "canvas",
      values: [
        { name: "canvas", value: "#f5f4ef" },
        { name: "ink", value: "#1d1e20" },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen w-full bg-[linear-gradient(180deg,#f8f6f0_0%,#f1ecdf_100%)] p-8 text-[#1d1e20]">
        <Story />
      </div>
    ),
  ],
};

export default preview;
