import{j as e}from"./iframe-BuNC81Qu.js";import{P as s}from"./presence-dot-D7NeYcNT.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-C8nBGPD0.js";const r={title:"UI/PresenceDot",component:s,tags:["autodocs"]},n={render:()=>e.jsxs("div",{className:"flex items-center gap-6",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(s,{tone:"online"}),e.jsx("span",{className:"text-sm",children:"online"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(s,{tone:"away"}),e.jsx("span",{className:"text-sm",children:"away"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(s,{tone:"editing",pulse:!0}),e.jsx("span",{className:"text-sm",children:"editing"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(s,{tone:"offline"}),e.jsx("span",{className:"text-sm",children:"offline"})]})]})};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <PresenceDot tone="online" />
        <span className="text-sm">online</span>
      </div>
      <div className="flex items-center gap-2">
        <PresenceDot tone="away" />
        <span className="text-sm">away</span>
      </div>
      <div className="flex items-center gap-2">
        <PresenceDot tone="editing" pulse />
        <span className="text-sm">editing</span>
      </div>
      <div className="flex items-center gap-2">
        <PresenceDot tone="offline" />
        <span className="text-sm">offline</span>
      </div>
    </div>
}`,...n.parameters?.docs?.source}}};const l=["States"];export{n as States,l as __namedExportsOrder,r as default};
