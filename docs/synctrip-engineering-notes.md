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

## 4. Data Fetching

### 4.1. React Query and Realtime

- 일반적인 서버 데이터 조회는 React Query를 사용한다.
- 실시간 동기화는 Supabase Realtime을 사용한다.
- React Query는 fetch/caching/loading/error 관리를 담당한다.
- Realtime은 presence, cursor, editing, card move 같은 live state를 담당한다.
- 별도 서버 계층이 없는 현재 구조에서는 query layer가 DB 결과를 읽고 UI용 shape로 변환하는 책임까지 맡는다.

즉 둘 중 하나로 통일하는 것이 아니라, 역할을 나눠서 함께 사용한다.

## 5. State Management

## 6. Realtime and WebSocket

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

## 8. Future Topics

- optimistic update 허용 범위
- `trip_cards` 설계 원칙
- 서버 컴포넌트와 클라이언트 컴포넌트 분리 기준
- 3D passport용 데이터 shape 기준
