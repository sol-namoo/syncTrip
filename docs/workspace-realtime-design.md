# Workspace Realtime Design

이 문서는 Workspace의 실시간 협업 모델을 정의한다.  
핵심 원칙은 `정확하지 않은 공유 마우스`보다 `누가 지금 무엇을 만지고 있는지`를 안정적으로 보여주는 것이다.

## 1. Why Not Raw Cursor

- 사용자마다 화면 크기와 비율이 다르다.
- 보드와 지도는 각각 독립된 스크롤/줌 상태를 가진다.
- 같은 `x, y`라도 상대 화면에서는 전혀 다른 카드나 장소를 가리킬 수 있다.

즉 raw viewport 좌표를 그대로 broadcast하면 시각적으로 화려해 보여도, 실제로는 자주 어긋난다.

## 2. Chosen Model

SyncTrip MVP는 `cursor sync` 대신 `active target sync`를 기본 모델로 둔다.

- 온라인 유저 수와 아바타 스택은 `Presence`
- 누가 어떤 카드를 보고/선택/드래그 중인지, 어떤 장소를 보고 있는지는 `Broadcast`
- 실제 데이터 변경은 `Postgres Changes`

즉 중요한 건 `마우스 포인터 좌표`가 아니라:

- `selectedCardId`
- `hoveredCardId`
- `draggingItemId`
- `focusedColumnId`
- `focusedPlaceId`

같은 도메인 기준 식별자다.

## 3. Channel Model

- 채널 이름
  - `workspace:{tripId}`

채널 하나 안에서 역할을 나눈다.

### Demo Workspace Rule

- `/workspace/demo`는 고정 fake user를 쓰지 않는다.
- demo 진입 시 클라이언트에서 `anonymous sign-in`으로 익명 세션을 만든다.
- 즉 demo 방문자도 Supabase Realtime 입장에서는 서로 다른 실제 세션 사용자다.
- 다만 `demo`는 DB 멤버십 role이 아니라 앱/UI role이다.
  - DB의 `trip_members.role`은 계속 `owner | editor`
  - 앱의 `WorkspaceRole`은 `demo | owner | editor`
- 따라서 demo 사용자를 지원하기 위해 `trip_members`나 `TripMemberRole` 테이블에 `demo`를 추가하지 않는다.
- Realtime policy는 `workspace:demo` topic만 예외적으로 허용하거나, 별도 demo 규칙을 둔다.

### Presence

- 용도
  - 접속자 목록
  - 헤더 아바타 스택
  - 사용자별 표시 색
- 저장
  - DB 저장 없음

권장 payload:

```ts
type WorkspacePresenceMeta = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  colorKey: string;
  status: "online" | "away";
  tabId: string;
};
```

### Broadcast

- 용도
  - 현재 작업 중인 대상 표시
  - 드래그 시작/종료
  - 카드 선택/해제
  - 장소 focus
- 저장
  - DB 저장 없음

권장 이벤트:

```ts
type WorkspaceBroadcastEvent =
  | {
      type: "target";
      target:
        | { kind: "card"; id: string }
        | { kind: "column"; id: string }
        | { kind: "place"; id: string }
        | { kind: "none" };
    }
  | {
      type: "drag";
      state: "start" | "end";
      itemId: string;
      columnId: string | null;
    };
```

### Postgres Changes

- 용도
  - 카드 생성/이동/메모 수정/삭제
- 저장
  - `trip_items`

## 4. UI Rendering Rule

실시간 상태는 `포인터 좌표`가 아니라 `요소 강조`로 보인다.

- 카드
  - 사용자 아바타를 우상단에 붙임
  - 해당 사용자의 color로 outline 또는 shadow 표시
- 컬럼
  - 현재 누가 보고 있는 Day인지 헤더나 상단에 아바타로 표시
- 지도 장소
  - marker 위에 작은 collaborator badge 또는 ring 표시

즉 “상대 마우스가 화면 어디 있는가”보다 “상대가 지금 어느 카드/컬럼/장소를 작업 중인가”를 보여준다.

## 5. Why This Fits SyncTrip

- 반응형 레이아웃 차이에 덜 취약하다.
- 보드 가로 스크롤, 지도 줌/팬 상태 차이에 덜 취약하다.
- 사용자가 실제로 궁금한 정보와 더 가깝다.
  - 누가 어디를 만지고 있는가
  - 지금 이 카드가 점유 중인가
- 구현과 디버깅이 더 단순하다.

## 6. MVP Scope

MVP에서 우선 구현할 것:

- 헤더 접속자 아바타
- 카드 편집/드래그 상태 표시
- 장소 marker focus 표시
- `trip_items` 실시간 반영

MVP에서 후순위:

- 자유 커서 공유
- 컨테이너 정규화 좌표 기반 pointer sync

## 7. Store Ownership

- `workspace-presence-store`
  - online users
  - active target map
  - dragging state
- `workspace-board-store`
  - DB row 기반 카드/컬럼 상태
- `workspace-ui-store`
  - 로컬 선택 상태

Realtime 이벤트는 가능하면 `presence-store`를 먼저 갱신하고, 영속 데이터는 `board-store`에만 반영한다.

## 8. Role Boundary

- `WorkspaceActor`
  - 현재 화면을 조작 중인 사용자와 그 capability를 표현하는 앱 개념이다.
- `WorkspaceRole`
  - 앱/UI 역할 모델이다.
  - `demo | owner | editor`
- `TripMemberRole`
  - DB 멤버십 역할 모델이다.
  - `owner | editor`

즉 demo는 앱 레벨 사용자 유형이지, DB의 정식 멤버십 role이 아니다.
