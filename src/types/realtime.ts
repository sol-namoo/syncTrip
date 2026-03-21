export type WorkspaceChannelTopic = `workspace:${string}`;

export type WorkspacePresenceMeta = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  colorKey: string;
  status: "online" | "away";
  tabId: string;
};

export type WorkspaceTargetPayload =
  | { kind: "card"; id: string }
  | { kind: "column"; id: string }
  | { kind: "place"; id: string }
  | { kind: "none" };

export type WorkspaceTargetBroadcastPayload = {
  type: "target";
  userId: string;
  target: WorkspaceTargetPayload;
};

export type WorkspaceDragBroadcastPayload = {
  type: "drag";
  userId: string;
  state: "start" | "end";
  itemId: string;
  columnId: string | null;
};

export type WorkspaceBroadcastPayload =
  | WorkspaceTargetBroadcastPayload
  | WorkspaceDragBroadcastPayload;

