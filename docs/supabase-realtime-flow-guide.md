# Supabase Realtime Flow Guide

이 문서는 SyncTrip에서 적용된 Supabase Realtime 흐름을 이해하기 위한 리뷰 가이드다.  
목표는 "채널 연결이 어디서 시작되고, 어떤 payload가 store를 거쳐 카드/컬럼 UI에 표시되는가"를 코드 기준으로 따라갈 수 있게 하는 것이다.

## 1. 큰 흐름

실시간 흐름은 아래 순서로 보면 된다.

1. Workspace 화면 진입
2. Realtime 채널 구독 시작
3. Presence / Broadcast 수신
4. Zustand presence store 갱신
5. `WorkspaceScreen`이 store를 읽어 협업용 view model 생성
6. 카드/컬럼/헤더가 그 상태를 렌더

즉 핵심은:

- 채널 시작: [workspace-screen.tsx](/Users/namooair/Documents/Workspace/SyncTrip/src/features/workspace/components/workspace-screen.tsx)
- 채널 연결/수신: [use-workspace-presence.ts](/Users/namooair/Documents/Workspace/SyncTrip/src/features/workspace/hooks/use-workspace-presence.ts)
- 채널 정의: [realtime-channel.ts](/Users/namooair/Documents/Workspace/SyncTrip/src/features/workspace/lib/realtime-channel.ts)
- payload 타입: [realtime.ts](/Users/namooair/Documents/Workspace/SyncTrip/src/types/realtime.ts)
- 수신 상태 저장: [workspace-presence-store.ts](/Users/namooair/Documents/Workspace/SyncTrip/src/store/workspace-presence-store.ts)
- 실제 표시: [workspace-board.tsx](/Users/namooair/Documents/Workspace/SyncTrip/src/features/workspace/components/workspace-board.tsx), [workspace-column.tsx](/Users/namooair/Documents/Workspace/SyncTrip/src/features/workspace/components/workspace-column.tsx), [place-card.tsx](/Users/namooair/Documents/Workspace/SyncTrip/src/features/workspace/components/place-card.tsx), [workspace-header.tsx](/Users/namooair/Documents/Workspace/SyncTrip/src/features/workspace/components/workspace-header.tsx)

## 2. 시작점: WorkspaceScreen

[workspace-screen.tsx](/Users/namooair/Documents/Workspace/SyncTrip/src/features/workspace/components/workspace-screen.tsx)에서:

- `useHydrateWorkspaceStores(snapshot)`로 보드 상태를 먼저 채운다.
- `useWorkspacePresence(...)`로 Realtime 연결을 시작한다.
- `presenceUsers`를 읽고
- `assignCollaborationColors(userIds)`로 현재 참가자 집합 기준 사용자 색을 계산한다.
- 그 결과를:
  - 헤더 참석자 표시
  - 카드/컬럼 협업 표시
에 쓰기 좋게 가공한다.

즉 `WorkspaceScreen`은 "협업 상태를 화면용 데이터로 바꾸는 조립 지점"이다.

## 3. 채널 연결: useWorkspacePresence

[use-workspace-presence.ts](/Users/namooair/Documents/Workspace/SyncTrip/src/features/workspace/hooks/use-workspace-presence.ts)를 보면 두 개의 `useEffect`가 중요하다.

### 첫 번째 effect

역할:

- 현재 사용자와 `tripId` 기준으로 Supabase client 준비
- access token 준비
- `workspace:${tripId}` 채널 생성
- presence sync 수신
- broadcast 수신
- subscribe 성공 후 `track()`으로 내 presence 전송

이 effect는 "채널 연결과 수신 핸들러 등록"만 담당한다.

중요 포인트:

- `members`는 이 effect의 dependency가 아니다.
- 대신 `membersRef`를 써서 최신 멤버 목록만 읽는다.
- 그래서 단순 멤버 배열 변화 때문에 채널을 다시 열지 않는다.

### 두 번째 effect

역할:

- `selectedCardId`, `selectedColumnId`에서 만든 `currentTarget`이 바뀔 때
- 같은 채널로 `target` broadcast를 보낸다.

즉:

- 첫 번째 effect = presence + broadcast 수신 / 채널 연결
- 두 번째 effect = target broadcast 송신

그리고 추가로 `broadcastDragState`, `broadcastEditingState` 함수를 리턴한다.

이유:

- drag/editing은 이벤트 발생 시점이 명확해서 함수 호출형이 더 자연스럽다.
- target은 로컬 UI 선택 상태를 이미 훅 안에서 보고 있으니 자동 송신으로 충분하다.

## 4. 채널/토픽 정의

[realtime-channel.ts](/Users/namooair/Documents/Workspace/SyncTrip/src/features/workspace/lib/realtime-channel.ts)에서:

- topic: `workspace:${tripId}`
- presence key: `${userId}:${tabId}`

를 만든다.

즉 같은 사용자가 여러 탭을 열어도 presence key는 달라진다.

또 이 파일의 `buildPresenceUsersFromState()`는 Supabase presence state를 앱의 `PresenceUser[]`로 바꿔준다.

## 5. Realtime payload 타입

[realtime.ts](/Users/namooair/Documents/Workspace/SyncTrip/src/types/realtime.ts)에서 실제 전송 타입을 본다.

### Presence

```ts
type WorkspacePresenceMeta = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: WorkspaceRole;
  status: "online" | "away";
  tabId: string;
}
```

### Broadcast

```ts
type WorkspaceTargetBroadcastPayload = {
  type: "target";
  userId: string;
  target:
    | { kind: "card"; id: string }
    | { kind: "column"; id: string }
    | { kind: "place"; id: string }
    | { kind: "none" };
}
```

```ts
type WorkspaceDragBroadcastPayload = {
  type: "drag";
  userId: string;
  state: "start" | "end";
  itemId: string;
  columnId: string | null;
}
```

```ts
type WorkspaceEditingBroadcastPayload = {
  type: "editing";
  userId: string;
  state: "start" | "end";
  cardId: string;
}
```

## 6. Store에 무엇이 들어가는가

[workspace-presence-store.ts](/Users/namooair/Documents/Workspace/SyncTrip/src/store/workspace-presence-store.ts)는 websocket 수신 상태의 목적지다.

핵심 상태:

- `users`
- `activeTargetsByUserId`
- `draggingByUserId`
- `editingByCardId`

의미:

- `users`
  - presence 참가자 목록
- `activeTargetsByUserId`
  - 누가 어떤 카드/컬럼/장소를 보고 있는가
- `draggingByUserId`
  - 누가 어떤 카드를 드래그 중인가
- `editingByCardId`
  - 누가 어떤 카드 편집을 시작했는가

중요:

- `activeTargetsByUserId`, `draggingByUserId`는 **broadcast를 수신했을 때** 갱신된다.
- 로컬 사용자는 주로 `workspace-ui-store`의 선택 상태로 움직이고,
- 원격 사용자는 이 presence store를 보고 렌더한다.

## 7. 카드/컬럼 클릭과 버블링

[place-card.tsx](/Users/namooair/Documents/Workspace/SyncTrip/src/features/workspace/components/place-card.tsx)

- 카드 클릭 시 `event.stopPropagation()`
- `selectedCardId` 설정
- `selectedColumnId` 해제

[workspace-column.tsx](/Users/namooair/Documents/Workspace/SyncTrip/src/features/workspace/components/workspace-column.tsx)

- 컬럼 루트 클릭 시 `selectedColumnId` 설정
- `selectedCardId` 해제

즉 카드 클릭과 컬럼 클릭은 분리돼 있다.

현재 MVP 기준 active target 범위:

- 클릭: 카드, 컬럼
- 드래그: 카드
- 수정중: 카드

hover는 노이즈가 커서 MVP 범위에서 제외한다.

## 8. card와 place를 왜 나누는가

`target.kind`의 `card`와 `place`는 데이터 종류보다 **surface 차이**에 가깝다.

- `card`
  - 보드의 카드 요소를 보고 있음
- `place`
  - 지도에서 특정 marker/장소를 보고 있음

즉 같은 장소를 가리키더라도:

- 보드에서 선택했으면 `card`
- 지도에서 선택했으면 `place`

로 표현할 수 있다.

## 9. 드래그 상태는 무엇을 의미하나

`DraggingPresenceState`는 현재 이렇게 본다.

```ts
{
  itemId: string;
  columnId: string | null;
}
```

즉:

- 누가 어떤 카드를 잡고 있는가
- 어느 컬럼 문맥에서 드래그 중인가

를 보여준다.

중요:

- "실시간 destination index 추적"까지는 하지 않는다.
- 그래서 다른 사용자가 내 드래그를 로컬처럼 부드러운 DnD 애니메이션으로 보지는 못한다.
- 최종 위치는 DB 저장 + `postgres_changes` 반영으로 따라온다.

즉 현재 구조는:

- drag broadcast = 임시 존재감
- data sync = 최종 결과

로 분리된다.

## 10. 색상은 왜 payload에 넣지 않는가

사용자 색은 realtime payload에 넣지 않는다.  
대신 [collaboration-colors.ts](/Users/namooair/Documents/Workspace/SyncTrip/src/lib/collaboration-colors.ts)에서 현재 참가자 집합 기준으로 계산한다.

이유:

- 색은 서버 truth가 아니라 view concern이다.
- 규칙을 바꿔도 payload 스키마를 바꿀 필요가 없다.
- 현재 참가자 집합이 같으면 모든 클라이언트에서 같은 결과를 낼 수 있다.

현재 구현은:

- `userId` 집합을 만든 뒤
- 정렬하고
- `assignCollaborationColors()`에 넣는다

중요:

- `presence_state`가 항상 같은 순서로 온다고 믿지 않는다.
- 동일성은 "같은 참가자 id 집합을 각 클라이언트가 같은 방식으로 정렬"해서 만든다.

즉 Realtime이 순서를 보장해서가 아니라, 클라이언트가 `userId`를 정렬해서 같은 색 결과를 얻는다.

## 11. 자주 나왔던 질문 정리

### `currentTarget`은 누구의 상태인가

`useWorkspacePresence` 안의 `currentTarget`은 **현재 보고 있는 사용자 본인**의 작업 대상이다.

- 카드 선택 시 `{ kind: "card", id }`
- 컬럼 선택 시 `{ kind: "column", id }`
- 둘 다 없으면 `{ kind: "none" }`

이 값이 두 번째 effect에서 `target` broadcast로 전송된다.

### 첫 번째 `useEffect`는 무엇을 하나

첫 번째 effect는 채널 lifecycle만 담당한다.

- Supabase client 생성
- 세션 토큰 준비
- `workspace:{tripId}` 채널 생성
- presence sync 수신
- broadcast 수신
- subscribe 성공 후 `track()`

멤버 배열 변화나 로컬 target 변화 때문에 채널을 다시 열지 않도록:

- `members`는 `membersRef`로 읽는다
- store action은 effect dependency에 직접 넣지 않고 store의 `getState()`로 호출한다

즉 이 effect는 "정말 채널 연결에 영향을 주는 값"만 의존한다.

### 두 번째 `useEffect`는 무엇을 하나

두 번째 effect는 `currentTarget` 변화만 보고 `target` broadcast를 보낸다.

즉:

- 첫 번째 effect = presence + broadcast 수신 / 채널 연결
- 두 번째 effect = target broadcast 송신

그리고 `broadcastDragState`, `broadcastEditingState`는 이벤트 시점에 직접 호출하는 송신 함수다.

### `DraggingPresenceState`는 Presence인가 Broadcast인가

이름 때문에 헷갈리지만, **실제 전송은 Broadcast**다.

`DraggingPresenceState`는 store 안에서 드래그 상태를 저장하는 타입 이름일 뿐이다.

구조는:

- `Presence`
  - 누가 접속해 있는가
- `Broadcast`
  - 누가 무엇을 선택/드래그/편집 중인가

### 드래그 상태는 어디까지 추적하나

현재 drag broadcast는:

- `itemId`
- `columnId`
- `state: "start" | "end"`

만 보낸다.

즉:

- "누가 이 카드를 잡고 있다"
- "어느 컬럼 문맥에서 드래그 중이다"

까지만 안다.

실시간 destination index까지 보내지 않기 때문에, 다른 사용자가 내 드래그를 로컬 DnD처럼 그대로 재생하진 않는다.

최종 위치는:

- DB 저장
- 이후 `postgres_changes`

로 반영하는 방향이다.

### `card`와 `place`는 왜 나누는가

둘 다 장소를 가리킬 수 있지만, 현재 의도는 **surface 구분**이다.

- `card`
  - 보드에서 본 장소
- `place`
  - 지도에서 본 장소

즉 도메인 종류보다는 "어느 화면 문맥에서 보고 있나"를 나타낸다.

## 12. 디버깅 순서

문제가 생기면 이 순서로 보면 빠르다.

1. [workspace-screen.tsx](/Users/namooair/Documents/Workspace/SyncTrip/src/features/workspace/components/workspace-screen.tsx)
2. [use-workspace-presence.ts](/Users/namooair/Documents/Workspace/SyncTrip/src/features/workspace/hooks/use-workspace-presence.ts)
3. [realtime-channel.ts](/Users/namooair/Documents/Workspace/SyncTrip/src/features/workspace/lib/realtime-channel.ts)
4. [realtime.ts](/Users/namooair/Documents/Workspace/SyncTrip/src/types/realtime.ts)
5. [workspace-presence-store.ts](/Users/namooair/Documents/Workspace/SyncTrip/src/store/workspace-presence-store.ts)
6. [workspace-board.tsx](/Users/namooair/Documents/Workspace/SyncTrip/src/features/workspace/components/workspace-board.tsx)
7. [workspace-column.tsx](/Users/namooair/Documents/Workspace/SyncTrip/src/features/workspace/components/workspace-column.tsx)
8. [place-card.tsx](/Users/namooair/Documents/Workspace/SyncTrip/src/features/workspace/components/place-card.tsx)

브라우저에서는:

- `Network`
- `WS`
- `realtime/v1/websocket`
- `Frames / Messages`

를 열고 아래를 보면 된다.

- `presence_state`
- `presence_diff`
- `broadcast` with `event: target`
- `broadcast` with `event: drag`

이걸로:

- 실제 websocket으로 이벤트가 나갔는지
- 상대방이 받았는지
- store/UI만 잘못된 건지

를 분리해서 확인할 수 있다.

중요:

- Realtime이 같은 순서로 `presence_state`를 보내준다고 믿는 게 아니다.
- 클라이언트가 직접 `userId` 집합을 정렬해서 동일성을 보장한다.

## 11. 여러 명이 동시에 표시될 때 규칙

현재 UI 규칙:

- collaborator 1명
  - 카드/컬럼에 그 사용자의 색으로 outline + soft shadow
  - 아바타는 표시하지 않음
- collaborator 2명 이상
  - 상단에 `AvatarStack`
  - outline/shadow보다 스택이 우선

즉 한 명일 때는 더 조용하고, 여러 명일 때만 stack으로 간다.

## 12. Demo와 익명 사용자

`/workspace/demo`는 고정 fake user가 아니다.

- demo 진입 시 `anonymous sign-in`
- 즉 demo 참가자도 서로 다른 Supabase 세션 user다
- 하지만 `demo`는 DB role이 아니라 앱 role이다

정리:

- DB `trip_members.role`
  - `owner | editor`
- 앱 `WorkspaceRole`
  - `demo | owner | editor`

따라서 demo 사용자를 위해 DB 멤버십 테이블에 `demo` role을 넣지 않는다.

## 13. Supabase에서 필요한 것

현재 상태를 재현하려면 다음이 필요하다.

1. `trip_items`, `trip_days` publication / RLS / RPC migration
2. `realtime.messages` 정책 migration
   - [20260321000100_add_workspace_realtime_policies.sql](/Users/namooair/Documents/Workspace/SyncTrip/supabase/migrations/20260321000100_add_workspace_realtime_policies.sql)
3. Supabase Dashboard에서 Anonymous Auth 활성화

주의:

- Anonymous Auth는 SQL migration이 아니라 Dashboard 설정이다.

## 14. DevTools에서 확인하는 법

브라우저에서:

- `Network`
- `WS`
- `realtime/v1/websocket`
- `Frames` 또는 `Messages`

를 보면 된다.

확인 포인트:

- `presence_state`
- `presence_diff`
- `broadcast` with `event: "target"`
- `broadcast` with `event: "drag"`
- 나중엔 `broadcast` with `event: "editing"`

즉 카드 클릭 후 `target` 프레임이 나가는지, 상대 창에서 같은 프레임을 받는지 바로 확인할 수 있다.

## 15. 코드 읽기 추천 순서

1. [workspace-screen.tsx](/Users/namooair/Documents/Workspace/SyncTrip/src/features/workspace/components/workspace-screen.tsx)
2. [use-workspace-presence.ts](/Users/namooair/Documents/Workspace/SyncTrip/src/features/workspace/hooks/use-workspace-presence.ts)
3. [realtime-channel.ts](/Users/namooair/Documents/Workspace/SyncTrip/src/features/workspace/lib/realtime-channel.ts)
4. [realtime.ts](/Users/namooair/Documents/Workspace/SyncTrip/src/types/realtime.ts)
5. [workspace-presence-store.ts](/Users/namooair/Documents/Workspace/SyncTrip/src/store/workspace-presence-store.ts)
6. [workspace-board.tsx](/Users/namooair/Documents/Workspace/SyncTrip/src/features/workspace/components/workspace-board.tsx)
7. [workspace-column.tsx](/Users/namooair/Documents/Workspace/SyncTrip/src/features/workspace/components/workspace-column.tsx)
8. [place-card.tsx](/Users/namooair/Documents/Workspace/SyncTrip/src/features/workspace/components/place-card.tsx)
9. [collaboration-colors.ts](/Users/namooair/Documents/Workspace/SyncTrip/src/lib/collaboration-colors.ts)

이 순서로 보면 "채널 연결 -> payload -> store -> UI" 흐름이 가장 잘 읽힌다.
