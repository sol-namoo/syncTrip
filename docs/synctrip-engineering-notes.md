# SyncTrip Engineering Notes

프로젝트를 만들면서 합의된 기술 기준만 짧게 적는 문서다.  
상식적인 설명보다, 나중에 다시 판단할 때 기준이 되는 내용만 남긴다.

## 1. Data Modeling and Types

### 1.1. Good Type Management

- DB row 타입은 `src/types/database.ts`를 기준으로 삼는다.
- query 함수는 가능하면 그 타입을 바탕으로 만든다.
- UI에 필요한 형태가 다르면 query layer에서 변환해서 별도 타입으로 넘긴다.

### 1.2. Type Layers

- `DB type`
- `query result type`
- `view model`
- `domain model`

서버에서 DTO라고 부르는 개념과 가깝지만, 프론트에서는 위처럼 더 자주 나눠서 본다.

### 1.3. Rules for SyncTrip

- Supabase 실제 스키마 타입은 `src/types/database.ts`에 둔다.
- feature 전용 타입은 `src/features/<feature>/types.ts`에 둔다.
- query 함수는 DB raw row를 읽고, 필요하면 view model로 변환해서 반환한다.
- 화면 컴포넌트는 가능하면 DB raw row 타입을 직접 알지 않도록 한다.
- DB와 거의 같은 타입을 feature 코드에 중복 선언하지 않는다.

## 2. Project Structure

### 2.1. Why Feature-Driven

- SyncTrip MVP는 full FSD를 적용할 만큼 크거나 복잡하지 않다.
- Next.js App Router가 이미 라우팅 계층을 제공한다.
- 그래서 FSD 7계층보다 Feature-Driven 구조를 사용한다.

### 2.2. Folder Rules

- `src/app`: Next.js 라우팅 진입점
- `src/features`: 기능별 UI와 로직
   - feature 로직, query, hooks는 각 기능 폴더 하위에 둔다
- `src/components`: 공통 UI
- `src/store`: 전역 클라이언트 상태
- `src/lib`: 외부 서비스 연결, 공용 유틸
- `src/types`: 전역 타입, 특히 Supabase schema type

#### `apis`와 `lib`를 어떻게 구분할지

- SyncTrip에서는 feature 내부 네트워크/DB 호출 코드는 `apis` 대신 `lib`에 둔다.
- 이유는 이 레이어가 단순 HTTP 호출만이 아니라:
  - Supabase query
  - 데이터 변환
  - feature 전용 helper
  를 함께 가질 수 있기 때문이다.

#### `features/trips/lib`와 `features/trips/hooks`를 두는 이유

- `features/trips/lib`
  - Supabase query
  - 데이터 변환
  - feature 전용 유틸
- `features/trips/hooks`
  - React Query 래퍼
  - feature 전용 상태 훅

즉 같은 feature 아래에서 역할로만 한 번 더 나누는 것이다.

### 2.3. Placement Rule

1. 라우팅 진입점이면 `src/app`
2. 특정 기능에 묶이면 `src/features/<feature>`
3. 여러 기능에서 공통으로 쓰는 UI면 `src/components`
4. 외부 서비스 연결이나 공용 유틸이면 `src/lib`
5. 전역 타입이면 `src/types`

애매하면 먼저 feature 안에 두고, 공통화가 분명해질 때 올린다.

## 3. UI System

### 3.1. Why shadcn/ui

- MVP의 핵심은 디자인 시스템 제작이 아니라 realtime, Three.js, AI tool call 실습이다.
- 그래서 기본 UI는 headless 기반 shadcn/ui를 사용한다.
- MVP 동안은 기본 UI를 과하게 커스텀하지 않는다.

### 3.2. Primitive, cva, clsx, cn

- `primitive`
  - Button, Input, Tabs처럼 여러 화면에서 공통으로 쓰는 기초 UI 컴포넌트
- `cva`
  - variant와 size 같은 스타일 규칙을 정의하는 도구
- `clsx`
  - 조건부 className을 합치는 도구
- `cn`
  - 보통 `clsx`와 `tailwind-merge`를 감싼 프로젝트 유틸 함수
  - `className={cn(...)}`
  - 형태로 자주 쓴다

## 4. Data Fetching

### 4.1. React Query and Realtime

- 일반적인 서버 데이터 조회는 React Query를 사용한다.
- 실시간 동기화는 Supabase Realtime을 사용한다.
- React Query는 fetch/caching/loading/error 관리를 담당한다.
- Realtime은 presence, cursor, editing, card move 같은 live state를 담당한다.
- 별도 서버 계층이 없는 현재 구조에서는 query layer가 DB 결과를 읽고 UI용 shape로 변환하는 책임까지 맡는다.

즉 둘 중 하나로 통일하는 것이 아니라, 역할을 나눠서 함께 사용한다.

## 5. State Management

### 5.1. Workspace Data Flow

- Workspace는 full fetch를 반복하지 않는다.
- 진입 시점에 `WorkspaceSnapshot`을 한 번 받고, 이후에는 Realtime 이벤트를 snapshot 위에 누적 반영한다.
- `WorkspaceSnapshot`은 서버 초기 fetch 결과이자, 클라이언트 store hydrate 기준이다.
- 이후 변경은 full replace가 아니라 patch update로 적용한다.
- 따라서 Workspace 타입은 `초기 snapshot`과 `실시간 patch`를 구분해서 생각한다.

### 5.2. Why `trip_days`

- 처음에는 `trip_items.day_index`만으로 날짜 컬럼을 표현했다.
- 하지만 Day 컬럼 자체를 reorder 가능한 엔티티로 열어두려면 날짜도 별도 엔티티여야 한다.
- 그래서 `trip_days`를 도입하고, `trip_items`는 `trip_day_id`를 참조하도록 바꿨다.
- 이 결정으로 join과 snapshot 조립은 조금 복잡해졌지만, 나중에 데이터 모델을 다시 갈아엎는 비용보다 지금 구조를 고정하는 쪽을 택했다.
- 컬럼 순서 변경은 linked list까지 갈 필요는 없고, `trip_days.position`으로 다룬다.

### 5.3. DnD Library Choice

- `dnd-kit`은 더 커스터마이즈 가능하지만, 현재 칸반 UI에는 `@hello-pangea/dnd`가 더 빠르게 맞는다.
- 이 판단은 [Puck의 drag-and-drop 라이브러리 비교 글](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react)을 읽고 내렸다.
- 다만 `hello-pangea/dnd`의 컬럼 reorder 가능성은 바로 쓰지 않는다.
- 현재 모델에서 중요한 건 카드 이동/재정렬이고, Day 컬럼 reorder는 `trip_days` 구조 위에서 후순위로 연다.

## 6. Realtime and WebSocket

### 6.1. Realtime Model for Workspace

- SyncTrip MVP는 raw mouse cursor 공유보다 `현재 작업 중인 대상` 표시를 우선한다.
- 이유:
  - 사용자마다 화면 크기, 스크롤 위치, 지도 줌/팬 상태가 달라서 픽셀 좌표 broadcast는 쉽게 어긋난다.
  - 제품적으로도 상대 마우스의 정확한 좌표보다 `누가 어떤 카드/컬럼/장소를 보고 있는지`가 더 중요하다.
- 기준:
  - `Presence` = 접속자 목록, 아바타, 사용자 메타데이터
  - `Broadcast` = `selectedCardId`, `draggingItemId`, `focusedColumnId`, `focusedPlaceId` 같은 active target
  - `Postgres Changes` = `trip_items` 영속 데이터 변경
- UI 표현:
  - 카드/컬럼/장소 marker에 avatar, outline, shadow를 붙여 점유/작업 중 상태를 보여준다.

### 6.2. Demo Role Boundary

- `/workspace/demo`는 고정 fake user를 쓰지 않고 `anonymous auth` 세션으로 입장시킨다.
- `demo`는 DB 멤버십 role이 아니다.
- 따라서 `trip_members.role`과 `TripMemberRole`에는 `demo`를 추가하지 않는다.
- 구분:
  - `TripMemberRole`
    - DB 권한 원본
    - `owner | editor`
  - `WorkspaceRole`
    - 앱/UI 사용자 유형
    - `demo | owner | editor`
- 즉 demo는 앱 레벨 capability 모델로만 다룬다.

## 7. Supabase Integration

### 7.1. Postgres Function, RPC, Edge Function, Next.js Server Code

- `RPC`는 `Remote Procedure Call`의 약자다.
- Supabase에서 RPC는 Postgres function을 앱 코드에서 호출하는 방식이다.

#### Postgres Function + RPC

- DB 안에서 실행된다.
- 트랜잭션이 필요한 생성/수정 로직에 적합하다.
- 예: `create_trip_with_owner`
- 앱에서는 `supabase.rpc("create_trip_with_owner", ...)`처럼 호출한다.

#### Edge Function

- DB 밖에서 실행되는 서버 함수다.
- 외부 API 호출, 비밀키 사용, 복잡한 서버 로직에 적합하다.
- DB 트랜잭션 자체가 핵심인 작업에는 Postgres function보다 우선하지 않는다.

#### Next.js 서버 코드

- Route Handler, Server Action, Server Component에서 실행되는 앱 서버 코드다.
- 앱 라우팅과 가까운 서버 로직에 적합하다.
- 필요하면 여기서 Supabase query나 RPC를 호출한다.

#### 선택 기준

- DB 안에서 원자적으로 처리해야 하면 Postgres function + RPC
- 외부 서비스 호출이나 서버 비밀값이 필요하면 Edge Function
- 앱 서버에서 인증, 리다이렉트, 페이지 조립과 함께 처리하면 Next.js 서버 코드

### 7.2. DnD Save Strategy

- 카드 이동 저장 방식에는 두 가지 선택지가 있었다.

#### 옵션 A. DB 재계산형

- 프론트는 `itemId`, `source`, `destination`, `destinationIndex`만 보낸다.
- DB 함수가 source/destination 리스트를 다시 읽고 `order_index`를 재계산한다.

#### 옵션 B. 최종 순서 전달형

- 프론트는 optimistic update 후 source/destination의 최종 `itemIds` 배열을 계산한다.
- 실제 RPC 호출 시에는 이 최종 정렬 결과에 더해, 이동 대상 item과 destination 같은 최소한의 메타정보를 함께 보낸다.
- DB 함수는 그 순서대로 `order_index`를 트랜잭션으로 확정한다.

#### 현재 선택

- SyncTrip은 현재 `columnsById[columnId].cardIds`가 이미 최종 순서를 알고 있는 구조라서 옵션 B를 선택했다.
- 이유:
  - 프론트가 이미 계산한 결과를 그대로 저장할 수 있다.
  - rollback이 단순하다.
  - 현재 Zustand 구조와 연결이 더 자연스럽다.

## 8. Future Topics

- optimistic update 허용 범위
- `trip_items` 설계 원칙
- 서버 컴포넌트와 클라이언트 컴포넌트 분리 기준
- 3D ticket share용 데이터 shape 기준
- JavaScript 모듈, 싱글톤, 라이브러리 내부 공유 상태 구조

## 9. Browser APIs

### 9.1. Web Crypto API

- 브라우저와 최신 JS 런타임에는 `crypto`라는 전역 Web Crypto API가 있다.
- 별도 npm 라이브러리를 설치하지 않아도 `crypto.getRandomValues()`로 안전한 랜덤 바이트를 만들 수 있다.
- SyncTrip에서는 공유 링크용 `share_code`를 만들 때 이 API를 쓴다.

예시:

```ts
const randomBytes = crypto.getRandomValues(new Uint8Array(length));
const code = Array.from(
  randomBytes,
  (value) => alphabet[value % alphabet.length]
).join("");
```

- 위 흐름은:
  - 길이 `length`의 바이트 배열 생성
  - 각 칸을 랜덤한 0~255 값으로 채움
  - 각 바이트를 알파벳 인덱스로 매핑
  - 최종 문자열로 join
- 즉 `share_code` 같은 짧은 랜덤 식별자를 만들 때 Node 전용 `crypto` import 없이도 처리할 수 있다.
