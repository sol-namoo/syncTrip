# SyncTrip MVP Frontend Implementation Plan

## 섹션 1: Implementation Summary

### 디자이너 산출물에서 구현상 중요한 결정
- MVP의 주 경로는 `로그인 -> 여행 생성 -> Workspace 편집 -> 3D 여권 발급/공유`로 고정한다.
- Workspace는 데스크톱 우선이며, `지도 + 칸반 보드`를 동시에 보여주는 2-pane 구조를 유지한다.
- 장소 검색 결과를 별도 페이지로 보내지 않고, Workspace 우측 `장소 바구니` 컬럼 내부에서 처리한다.
- 여행 기간 기준으로 `Day 1..N` 컬럼을 자동 생성한다. MVP에서는 컬럼 추가/삭제 커스터마이징을 후순위로 둔다.
- 실시간 협업은 별도 패널이 아니라 `헤더의 접속자`, `카드 편집 상태`, `멀티 커서`, `카드 이동 동기화`로 분산 노출한다.
- 카드 자체가 일정의 최소 저장 단위다. 장소 메타데이터, 일자 배치, 정렬 순서, 메모를 모두 카드 row에 둔다.
- 충돌 해결은 CRDT 대신 `누가 편집 중인지 시각적으로 강하게 노출 + 마지막 저장 우선`으로 제한한다.
- 3D 여권은 Workspace 상태 전체를 계속 바라보는 구조가 아니라, `발급 시점의 itinerary snapshot`을 받아 렌더링한다.
- 다운로드 CTA를 공유보다 우선한다. 구현도 `PNG 이미지 다운로드`를 1차 목표로 둔다.
- 모바일은 `Share / Export 확인`을 우선하고, Workspace 편집은 읽기 전용 또는 축소된 상호작용으로 제한한다.

### 현재 코드베이스 기준 해석
- `src/app` 라우트는 대부분 비어 있다. 페이지 단위 뼈대를 새로 잡아도 기존 코드와 충돌이 거의 없다.
- `src/lib/supabase`는 브라우저/서버 클라이언트 유틸이 이미 있으므로 그대로 확장한다.
- `src/features/workspace/utils/order.ts`는 보드 정렬 유틸로 재사용 가능하다.
- `src/types/database.ts`는 현재 `trips`만 정의돼 있으므로, MVP 구현 전에 DB 타입 재생성 또는 수동 확장이 필요하다.
- 아직 `components/ui`, `store`, `types`의 실제 구현이 거의 없으므로 과도한 리팩터링 없이 초기 구조를 바로 확정할 수 있다.

### 확정 필요
- 장소 검색 데이터 소스
  - Google Places, Mapbox Geocoding, Foursquare 등 외부 provider가 필요하다.
  - 미확정 상태에서는 `PlaceSearchAdapter` 인터페이스로 분리하고, provider 확정 전까지 mock 구현을 둘 수 있다.
- 지도 렌더링 provider
  - 현재 스택 목록에 지도 SDK가 없다.
  - 지도 provider를 확정해야 `MapOverview` 실제 구현 범위를 고정할 수 있다.
- 공유 권한 모델
  - `/share/[id]`를 완전 공개로 둘지, 로그인 필요 링크로 둘지 결정이 필요하다.
- 초대 방식
  - MVP에서 이메일 초대가 필요한지, 링크 복사만으로 충분한지 결정이 필요하다.
- 3D 다운로드 포맷
  - 1차는 PNG 캡처로 두고, PDF 또는 다중 해상도 지원은 범위 밖으로 두는지 확인이 필요하다.

## 섹션 2: Architecture Decisions

### 서버 컴포넌트와 클라이언트 컴포넌트 분리

#### 서버 컴포넌트로 둘 영역
- `src/app/page.tsx`
  - 공개 랜딩 데이터 주입 정도만 담당한다.
- `src/app/(auth)/login/page.tsx`
  - 세션 확인 후 이미 로그인한 사용자는 `/trips`로 리다이렉트한다.
- `src/app/trips/page.tsx`
  - 현재 사용자 세션 확인, 여행 목록 초기 fetch를 담당한다.
- `src/app/workspace/[id]/page.tsx`
  - 접근 권한 확인, trip 메타데이터/멤버/카드 초기 snapshot fetch를 담당한다.
- `src/app/share/[id]/page.tsx`
  - 공개/읽기 전용 데이터 fetch와 공유 권한 체크를 담당한다.

#### 클라이언트 컴포넌트로 둘 영역
- 소셜 로그인 버튼 및 인증 모달
- My Trips 목록 필터링, 생성 모달
- Workspace 전체 본문
  - 지도 인터랙션
  - 검색창
  - dnd-kit 보드
  - 멀티 커서 오버레이
  - Realtime presence subscription
- 3D Passport viewer
  - Three.js canvas
  - orbit control
  - 이미지 다운로드

### 파일 구조 제안

#### 유지
- `src/app`
- `src/features/workspace`
- `src/features/map`
- `src/features/passport3d`
- `src/components/ui`
- `src/lib/supabase`
- `src/types`

#### 추가
- `src/features/auth`
- `src/features/trips`
- `src/lib/query`
- `src/store/workspace-board-store.ts`
- `src/store/workspace-ui-store.ts`
- `src/store/workspace-presence-store.ts`
- `src/store/trips-store.ts`
- `src/types/trip.ts`
- `src/types/workspace.ts`
- `src/types/passport.ts`
- `src/types/realtime.ts`

### 책임 분리 원칙
- `src/components/ui`
  - 버튼, 인풋, 모달, 배지, 아바타 스택 등 순수 프리미티브
- `src/features/*/components`
  - 화면/기능 단위 조합 컴포넌트
- `src/features/*/lib`
  - Supabase read/write 함수, adapter, formatter
- `src/features/*/hooks`
  - Realtime 구독, DnD, keyboard shortcut, download 처리
- `src/store`
  - 브라우저 세션 동안만 유지할 UI 상태와 낙관적 편집 상태
- `src/types`
  - DB row와 분리된 UI view model, Realtime payload, 3D viewer props

### 데이터 접근 방식
- Trips Dashboard(목록 화면)는 TanStack Query를 사용한다.
  - 서버 상태 캐싱
  - `isLoading` 기반 로딩 처리
  - query 단위 에러 처리
- Workspace(편집 화면)는 TanStack Query를 배제한다.
  - 초기 데이터는 서버 컴포넌트에서 Supabase로 fetch한다.
  - 이후 상태 관리는 Zustand와 Supabase Realtime channel, `postgres_changes` 직접 연결로만 해결한다.
  - 잦은 낙관적 업데이트와 웹소켓 실시간 동기화가 Query 캐시와 충돌하지 않도록 캐시 계층을 두지 않는다.
- 낙관적 UI는 Workspace에서 Zustand store로 처리하고, 성공/실패는 mutation 결과와 Realtime 반영으로 수습한다.

### 반응형 우선순위
- `Workspace`: 데스크톱 우선, 모바일은 읽기 전용/축소 상호작용
- `Landing / Login / My Trips / Share`: 모바일 대응 필수
- `Export Modal`: 모바일에서도 완전 동작해야 하며, CTA는 하단 고정 우선

## 섹션 3: Epics

### Epic 1. Auth + App Shell + Route Bootstrapping
- 공개/인증 라우트 구조를 고정하고 세션 흐름을 붙인다.

### Epic 2. Trips Dashboard + Trip Creation
- 여행 목록 조회, 생성, 진입 경로를 완성한다.

### Epic 3. Workspace Data Model + Kanban Editing
- 여행 카드 데이터 모델, 칸반 보드, 메모 편집, 저장 상태를 구현한다.

### Epic 4. Place Search + Map Visualization
- 장소 검색과 지도 표시를 연결한다.

### Epic 5. Realtime Collaboration
- presence, cursor, card editing state, card 이동 동기화를 붙인다.

### Epic 6. 3D Passport Export + Share
- 3D 여권 결과 렌더링, 다운로드, 읽기 전용 공유를 구현한다.

## 섹션 4: Task Breakdown

### Epic 1. Auth + App Shell + Route Bootstrapping

#### Task 1-1. 전역 레이아웃과 라우트 스켈레톤 정리
- 목적
  - MVP 라우트 흐름과 페이지별 서버/클라이언트 경계를 고정한다.
- 작업 내용
  - `src/app/page.tsx`, `src/app/(auth)/login/page.tsx`, `src/app/trips/page.tsx`, `src/app/workspace/[id]/page.tsx`, `src/app/share/[id]/page.tsx`를 목적에 맞는 서버 페이지 셸로 구성한다.
  - `src/app/workspace/[id]/layout.tsx`는 Workspace용 헤더/높이 제약을 걸 수 있는 전용 layout으로 정리한다.
  - 공통 메타데이터와 body class를 `src/app/layout.tsx`에 설정한다.
- 관련 파일/폴더
  - `src/app`
- 필요한 상태/타입
  - `AppRouteIntent`, `AuthRedirectTarget`
- Supabase 연동 필요 여부
  - 예
- 선행조건
  - 없음
- 난이도
  - 하
- 리스크
  - 낮음. 페이지 셸만 만들면 된다.
- 완료 조건
  - 모든 핵심 라우트가 목적에 맞는 빈 상태/초기 데이터 fetch 자리까지 준비된다.

#### Task 1-2. 소셜 로그인 UI와 세션 흐름 구현
- 목적
  - Google / GitHub 로그인과 로그인 후 복귀 동선을 완성한다.
- 작업 내용
  - `src/features/auth/components/social-login-buttons.tsx` 작성
  - 로그인 모달/페이지 공용 CTA 구현
  - 비로그인 상태에서 보호 액션 시 로그인 모달 오픈
  - 로그인 완료 후 `redirectTo` 기반 복귀
- 관련 파일/폴더
  - `src/features/auth`
  - `src/app/(auth)/login/page.tsx`
  - `src/lib/supabase/client.ts`
- 필요한 상태/타입
  - `AuthProvider`, `AuthModalState`
- Supabase 연동 필요 여부
  - 예
- 선행조건
  - Task 1-1
- 난이도
  - 중
- 리스크
  - OAuth redirect 설정 누락 시 로컬/배포 환경 모두 막힌다.
- 완료 조건
  - Google/GitHub 버튼 클릭 시 OAuth 시작, 로그인 완료 후 의도한 경로로 복귀한다.

#### Task 1-3. 기본 UI 프리미티브 구축
- 목적
  - 이후 feature 구현에서 반복될 버튼/모달/배지/아바타 스타일을 고정한다.
- 작업 내용
  - `src/components/ui`에 button, input, modal, badge, avatar-stack, toast, banner 추가
  - Tailwind 토큰 클래스와 상태 variant를 정리
- 관련 파일/폴더
  - `src/components/ui`
  - `src/app/globals.css`
- 필요한 상태/타입
  - `ButtonVariant`, `BannerTone`, `ToastState`
- Supabase 연동 필요 여부
  - 아니오
- 선행조건
  - 없음
- 난이도
  - 중
- 리스크
  - 너무 범용적으로 설계하면 오히려 구현 속도가 늦어진다.
- 완료 조건
  - 랜딩, 대시보드, Workspace, Export에서 공통 UI를 재사용 가능하다.

### Epic 2. Trips Dashboard + Trip Creation

#### Task 2-1. 여행 목록 조회 모델 정의
- 목적
  - My Trips 화면에서 필요한 최소 데이터를 고정한다.
- 작업 내용
  - `trip_members`, `trips` 기준으로 대시보드 목록 query shape 설계
  - `TripSummary`, `TripMemberSummary` 타입 정의
  - 서버 페이지에서 초기 목록 fetch
- 관련 파일/폴더
  - `src/types/trip.ts`
  - `src/features/trips/lib/queries.ts`
  - `src/app/trips/page.tsx`
- 필요한 상태/타입
  - `TripSummary[]`
- Supabase 연동 필요 여부
  - 예
- 선행조건
  - Task 1-1
- 난이도
  - 중
- 리스크
  - 현재 DB 타입에 `trip_members`가 없으므로 스키마 확장 전에는 mock이 필요하다.
- 완료 조건
  - 서버에서 대시보드 초기 목록을 받아 렌더할 수 있다.

#### Task 2-2. My Trips 화면 구현
- 목적
  - 목록 탐색과 재진입 동선을 완성한다.
- 작업 내용
  - 카드 그리드, 빈 상태, 로딩 스켈레톤, 탭 필터 구현
  - 최근 수정순 정렬과 초대/내 여행 뱃지 노출
- 관련 파일/폴더
  - `src/features/trips/components/trips-dashboard.tsx`
  - `src/features/trips/components/trip-card.tsx`
  - `src/app/trips/page.tsx`
- 필요한 상태/타입
  - `TripsFilterTab`, `TripCardViewModel`
- Supabase 연동 필요 여부
  - 예
- 선행조건
  - Task 2-1, Task 1-3
- 난이도
  - 중
- 리스크
  - 낮음
- 완료 조건
  - 로그인 사용자가 `/trips`에서 자신의 여행 목록을 확인하고 클릭으로 진입할 수 있다.

#### Task 2-3. 여행 생성 모달과 생성 액션 구현
- 목적
  - 제목/기간만으로 새 여행을 만들고 Workspace로 이동시킨다.
- 작업 내용
  - 생성 모달 UI, 폼 검증, Supabase insert, 기본 Day 수 계산
  - 생성 성공 시 `trip_members`에 owner row 생성
  - 성공 후 `/workspace/[id]` 이동
- 관련 파일/폴더
  - `src/features/trips/components/create-trip-modal.tsx`
  - `src/features/trips/lib/mutations.ts`
  - `src/app/trips/page.tsx`
- 필요한 상태/타입
  - `CreateTripInput`, `TripRole`
- Supabase 연동 필요 여부
  - 예
- 선행조건
  - Task 2-1
- 난이도
  - 중
- 리스크
  - 여행 기간과 Day 컬럼 생성 규칙이 백엔드/프론트에서 달라지면 초기 보드가 틀어진다.
- 완료 조건
  - 모달에서 여행 생성 후 즉시 해당 Workspace로 진입한다.

### Epic 3. Workspace Data Model + Kanban Editing

#### Task 3-1. Workspace 도메인 타입과 DB 최소 스키마 정의
- 목적
  - 칸반과 지도, 3D 결과가 같은 데이터를 바라보게 만든다.
- 작업 내용
  - `trip_cards`, `trip_members` 기준 DB 타입 확장
  - UI용 `BoardColumn`, `PlaceCard`, `WorkspaceSnapshot` 타입 정의
  - 카드 row에 필요한 필드 고정
    - `id`, `trip_id`, `place_id`, `name`, `address`, `lat`, `lng`, `image_url`, `note`, `list_type`, `day_index`, `order_index`, `created_by`, `updated_at`
- 관련 파일/폴더
  - `src/types/database.ts`
  - `src/types/workspace.ts`
  - `src/types/trip.ts`
- 필요한 상태/타입
  - `TripCardRow`, `BoardColumnId`, `WorkspaceSnapshot`
- Supabase 연동 필요 여부
  - 예
- 선행조건
  - 없음
- 난이도
  - 중
- 리스크
  - 스키마가 늦게 확정되면 이후 태스크가 전부 흔들린다.
- 완료 조건
  - Workspace 전체에서 재사용할 공통 타입과 저장 모델이 확정된다.

#### Task 3-2. Workspace 페이지 초기 fetch와 클라이언트 엔트리 구현
- 목적
  - 서버에서 초기 snapshot을 내려주고, 클라이언트 편집 화면으로 연결한다.
- 작업 내용
  - trip 기본 정보, 멤버, 카드 목록을 서버에서 fetch
  - `WorkspaceScreen` 클라이언트 컴포넌트에 `initialSnapshot` 전달
  - 접근 권한 없을 때 redirect 또는 403 UI 처리
- 관련 파일/폴더
  - `src/app/workspace/[id]/page.tsx`
  - `src/features/workspace/components/workspace-screen.tsx`
  - `src/features/workspace/lib/queries.ts`
- 필요한 상태/타입
  - `WorkspacePageProps`, `WorkspaceSnapshot`
- Supabase 연동 필요 여부
  - 예
- 선행조건
  - Task 3-1
- 난이도
  - 중
- 리스크
  - 낮음
- 완료 조건
  - Workspace 진입 시 보드/지도에 필요한 초기 데이터가 모두 준비된다.

#### Task 3-3. Workspace Zustand store 설계
- 목적
  - DnD와 낙관적 업데이트, UI 상태를 한 곳에서 관리한다.
- 작업 내용
  - `workspace-board-store`를 별도로 두고 보드 데이터를 정규화된 형태로 저장한다.
    - `columns`: 컬럼 메타데이터와 카드 id 배열만 보유
    - `cards`: 카드 상세 정보 엔티티 맵 보유
  - `workspace-ui-store`에 다음 상태를 둔다.
    - split pane 비율
    - 선택 카드 id
    - 활성 day filter
    - 검색창 query
    - drag active id
    - 저장 상태 표시
  - `workspace-presence-store`에 다음 상태를 둔다.
    - 접속 중 유저 목록
    - 원격 커서 위치
    - 카드 편집 중 사용자
  - 서버 영속 데이터 자체는 중첩 배열로 들고 가지 않고, `initialSnapshot -> normalized board state + optimistic patch` 수준으로 관리한다.
- 관련 파일/폴더
  - `src/store/workspace-board-store.ts`
  - `src/store/workspace-ui-store.ts`
  - `src/store/workspace-presence-store.ts`
- 필요한 상태/타입
  - `BoardColumnEntity`, `BoardCardEntity`, `SaveIndicatorState`, `RemoteCursor`, `EditingPresenceMap`
- Supabase 연동 필요 여부
  - 아니오
- 선행조건
  - Task 3-1
- 난이도
  - 중
- 리스크
  - store가 과도하게 커지면 Realtime 디버깅이 어려워진다.
- 완료 조건
  - Workspace UI 상태와 ephemeral 협업 상태가 영속 데이터와 분리된다.

#### Task 3-4. 칸반 보드 레이아웃과 컬럼 렌더링 구현
- 목적
  - 장소 바구니 + Day 컬럼의 기본 편집 화면을 만든다.
- 작업 내용
  - 헤더, 보드 스크롤 영역, 컬럼, 빈 상태, 카드 렌더링
  - 여행 기간 기반 Day 컬럼 자동 생성
  - 컬럼별 카드 수, 빈 컬럼 drop hint 표시
- 관련 파일/폴더
  - `src/features/workspace/components/workspace-header.tsx`
  - `src/features/workspace/components/workspace-board.tsx`
  - `src/features/workspace/components/workspace-column.tsx`
  - `src/features/workspace/components/place-card.tsx`
- 필요한 상태/타입
  - `BoardColumn`, `TripPlaceCard`
- Supabase 연동 필요 여부
  - 아니오
- 선행조건
  - Task 3-2, Task 3-3, Task 1-3
- 난이도
  - 중
- 리스크
  - 낮음
- 완료 조건
  - 서버 snapshot만으로 보드가 렌더되고, 카드 구조가 확정된다.

#### Task 3-5. dnd-kit 기반 카드 이동 구현
- 목적
  - 바구니와 Day 컬럼 간 카드 이동, 같은 컬럼 내 재정렬을 구현한다.
- 작업 내용
  - drag sensor, overlay, placeholder, 이동 후 order 계산
  - 낙관적 UI 적용
  - drop 시 mutation 호출
- 관련 파일/폴더
  - `src/features/workspace/hooks/use-board-dnd.ts`
  - `src/features/workspace/utils/order.ts`
  - `src/features/workspace/lib/mutations.ts`
  - `src/features/workspace/components/workspace-board.tsx`
- 필요한 상태/타입
  - `MoveCardInput`, `DragActiveState`
- Supabase 연동 필요 여부
  - 예
- 선행조건
  - Task 3-4
- 난이도
  - 상
- 리스크
  - Realtime 반영과 local optimistic reorder가 꼬일 가능성이 높다.
- 완료 조건
  - 카드 이동이 즉시 보이고, 새로고침 후에도 저장된 순서가 유지된다.

#### Task 3-6. 카드 메모 편집과 저장 상태 구현
- 목적
  - 카드 단위 메모 입력과 저장 피드백을 구현한다.
- 작업 내용
  - textarea autosize 적용
  - 타이핑(`onChange`) 중에는 컴포넌트 내부의 local state(`useState`)만 업데이트하여 전역 리렌더링을 차단한다.
  - 타이핑 중 500ms throttle로 서버에 배경 저장하고, 웹소켓 Presence로 `편집 중` 상태는 지속 전송한다.
  - 포커스 아웃(`onBlur`) 시 최종 로컬 텍스트를 Zustand 전역 상태에 덮어쓰고 강제 flush한다.
  - 저장 중/완료/실패 상태를 헤더와 카드에 표시
- 관련 파일/폴더
  - `src/features/workspace/components/card-memo-field.tsx`
  - `src/features/workspace/lib/mutations.ts`
  - `src/store/workspace-ui-store.ts`
- 필요한 상태/타입
  - `UpdateCardNoteInput`, `SaveIndicatorState`
- Supabase 연동 필요 여부
  - 예
- 선행조건
  - Task 3-4
- 난이도
  - 중
- 리스크
  - throttle 저장 중 탭 이동/새로고침 시 유실 가능성이 있다.
- 완료 조건
  - 메모 편집이 저장 상태와 함께 동작하고, 다른 사용자에게 반영될 준비가 된다.

#### Task 3-7. 초대 버튼과 링크 복사 플로우 구현
- 목적
  - 멤버 초대 UX를 MVP 범위 내에서 마무리한다.
- 작업 내용
  - 헤더 초대 버튼
  - 초대 모달
  - 링크 복사
  - 공유 권한 정책에 맞는 URL 생성
- 관련 파일/폴더
  - `src/features/workspace/components/invite-modal.tsx`
  - `src/features/workspace/lib/share.ts`
- 필요한 상태/타입
  - `InviteLinkPayload`
- Supabase 연동 필요 여부
  - 정책에 따라 다름
- 선행조건
  - 공유 권한 모델 확정
- 난이도
  - 하
- 리스크
  - 권한 정책 미확정 시 재작업 가능성이 있다.
- 완료 조건
  - 사용자가 Workspace에서 초대 링크를 복사할 수 있다.

### Epic 4. Place Search + Map Visualization

#### Task 4-1. 장소 검색 adapter 계층 구현
- 목적
  - provider 미확정 상태에서도 UI 개발을 진행할 수 있게 검색 계층을 분리한다.
- 작업 내용
  - `PlaceSearchAdapter` 인터페이스 정의
  - provider별 응답을 공통 `PlaceSearchResult`로 normalize
  - mock adapter와 실제 adapter 교체 가능 구조 작성
- 관련 파일/폴더
  - `src/features/map/lib/place-search-adapter.ts`
  - `src/types/trip.ts`
- 필요한 상태/타입
  - `PlaceSearchResult`, `PlaceSearchProvider`
- Supabase 연동 필요 여부
  - 아니오
- 선행조건
  - 장소 검색 provider 확정 또는 mock 사용 결정
- 난이도
  - 중
- 리스크
  - provider마다 이미지, 주소, 좌표 필드가 달라 normalize 비용이 있다.
- 완료 조건
  - UI는 provider와 무관하게 같은 타입으로 검색 결과를 받을 수 있다.

#### Task 4-2. Workspace 검색창과 결과 드롭다운 구현
- 목적
  - 사용자가 장소를 검색하고 바구니에 추가하는 경로를 완성한다.
- 작업 내용
  - 검색 input, debounce, 결과 dropdown, 로딩/빈 상태
  - 검색 결과를 `trip_cards`의 basket 카드로 insert
- 관련 파일/폴더
  - `src/features/workspace/components/place-search-bar.tsx`
  - `src/features/workspace/components/place-search-results.tsx`
  - `src/features/workspace/lib/mutations.ts`
- 필요한 상태/타입
  - `PlaceSearchQueryState`, `CreateTripCardInput`
- Supabase 연동 필요 여부
  - 예
- 선행조건
  - Task 4-1, Task 3-1
- 난이도
  - 중
- 리스크
  - 검색 API rate limit과 debounce 설정이 맞지 않으면 UX가 흔들린다.
- 완료 조건
  - 검색 결과를 클릭하면 카드가 바구니 컬럼에 추가된다.

#### Task 4-3. 지도 뷰와 카드 연동 구현
- 목적
  - 보드 편집 결과를 공간적으로 바로 확인하게 한다.
- 작업 내용
  - 지도 provider 연결
  - 카드 목록 기반 마커 렌더링
  - Day 색상별 경로(Polyline) 표시
  - 일자와 일자 사이의 장소는 선으로 연결하지 않고, 같은 일자 내부 장소들만 선으로 잇는다.
  - 선택 카드와 지도 마커 동기화
- 관련 파일/폴더
  - `src/features/map/components/map-overview.tsx`
  - `src/features/map/components/map-toolbar.tsx`
  - `src/features/map/lib/map-markers.ts`
  - `src/features/workspace/components/workspace-screen.tsx`
- 필요한 상태/타입
  - `MapMarkerViewModel`, `DayRouteSegment`
- Supabase 연동 필요 여부
  - 아니오
- 선행조건
  - 지도 provider 확정, Task 3-4
- 난이도
  - 상
- 리스크
  - 이동 경로를 실제 길찾기로 만들면 범위가 급격히 커진다. MVP에서는 straight polyline으로 제한해야 한다.
- 완료 조건
  - Day별 마커와 연결선이 보드 상태에 맞게 갱신된다.

### Epic 5. Realtime Collaboration

#### Task 5-1. Realtime 채널 구조 정의
- 목적
  - 어떤 정보는 broadcast/presence로, 어떤 정보는 DB subscription으로 받을지 고정한다.
- 작업 내용
  - trip 단위 채널 네이밍 규칙 정의: `trip:{tripId}`
  - presence, cursor, editing-lock, transient drag 상태 payload 타입 정의
  - `postgres_changes` 대상 테이블 정의: `trip_cards`, `trip_members`
- 관련 파일/폴더
  - `src/types/realtime.ts`
  - `src/features/workspace/lib/realtime-channel.ts`
- 필요한 상태/타입
  - `TripPresenceState`, `CursorBroadcastPayload`, `CardEditPresencePayload`
- Supabase 연동 필요 여부
  - 예
- 선행조건
  - Task 3-1
- 난이도
  - 중
- 리스크
  - payload shape가 늦게 바뀌면 클라이언트 처리 코드가 연쇄 수정된다.
- 완료 조건
  - Realtime 메시지 스펙과 테이블 구독 범위가 문서화/코드화된다.

#### Task 5-2. Presence와 접속자 아바타 구현
- 목적
  - 누가 접속 중인지 항상 보이게 한다.
- 작업 내용
  - Supabase presence join/leave
  - 헤더 avatar stack, tooltip, 현재 보고 있는 day 정도의 메타데이터 반영
- 관련 파일/폴더
  - `src/features/workspace/hooks/use-workspace-presence.ts`
  - `src/features/workspace/components/workspace-header.tsx`
  - `src/store/workspace-presence-store.ts`
- 필요한 상태/타입
  - `PresenceUser`, `PresenceMeta`
- Supabase 연동 필요 여부
  - 예
- 선행조건
  - Task 5-1, Task 3-4
- 난이도
  - 중
- 리스크
  - 브라우저 탭 다중 접속 시 동일 사용자가 중복 표시될 수 있다.
- 완료 조건
  - 동일 trip에 접속한 사용자가 헤더에 실시간으로 나타나고 사라진다.

#### Task 5-3. 커서 동기화 구현
- 목적
  - 같은 화면 안에서 협업 존재감을 시각적으로 전달한다.
- 작업 내용
  - 보드/지도 영역 좌표를 기준으로 커서 broadcast
  - 50~80ms throttle
  - 2초 무동작 시 커서 fade 처리
- 관련 파일/폴더
  - `src/features/workspace/hooks/use-cursor-broadcast.ts`
  - `src/features/workspace/components/cursor-layer.tsx`
  - `src/store/workspace-presence-store.ts`
- 필요한 상태/타입
  - `RemoteCursor`, `CursorViewportScope`
- Supabase 연동 필요 여부
  - 예
- 선행조건
  - Task 5-1
- 난이도
  - 중
- 리스크
  - 스크롤 컨테이너 좌표계 보정이 틀리면 커서 위치가 어긋난다.
- 완료 조건
  - 원격 사용자의 커서와 이름 라벨이 보드/지도 영역에 실시간으로 표시된다.

#### Task 5-4. 카드 편집 상태와 충돌 경고 구현
- 목적
  - 누가 어떤 카드를 만지고 있는지 보이게 하고, 충돌을 예고한다.
- 작업 내용
  - 카드 focus 시 editing presence broadcast
  - focus 해제 또는 heartbeat timeout 시 해제
  - 카드 테두리 색, 이름 pill, 상단 배너 반영
- 관련 파일/폴더
  - `src/features/workspace/hooks/use-card-edit-presence.ts`
  - `src/features/workspace/components/place-card.tsx`
  - `src/store/workspace-presence-store.ts`
- 필요한 상태/타입
  - `EditingPresenceMap`, `CardLockState`
- Supabase 연동 필요 여부
  - 예
- 선행조건
  - Task 5-1, Task 3-6
- 난이도
  - 중
- 리스크
  - 진짜 lock이 아니라 표시용 상태이므로 동시에 수정은 여전히 가능하다.
- 완료 조건
  - 카드마다 현재 편집 중인 사용자가 표시되고, 충돌 가능성 배너가 노출된다.

#### Task 5-5. 카드 이동/메모 변경의 실시간 반영 구현
- 목적
  - 다른 사용자의 변경이 내 화면에도 즉시 반영되게 한다.
- 작업 내용
  - `trip_cards` `postgres_changes` 구독
  - row insert/update/delete를 현재 보드 store에 반영
  - 로컬 optimistic 상태와 충돌 시 server row 기준 정렬 재계산
- 관련 파일/폴더
  - `src/features/workspace/hooks/use-trip-cards-realtime.ts`
  - `src/features/workspace/lib/reconcile-trip-cards.ts`
  - `src/store/workspace-ui-store.ts`
- 필요한 상태/타입
  - `TripCardRow`, `RealtimeCardMutation`
- Supabase 연동 필요 여부
  - 예
- 선행조건
  - Task 3-5, Task 3-6, Task 5-1
- 난이도
  - 상
- 리스크
  - move와 note 저장이 거의 동시에 들어오면 정렬/내용 반영 순서가 꼬일 수 있다.
- 완료 조건
  - 타 사용자의 카드 추가, 이동, 메모 변경, 삭제가 새로고침 없이 반영된다.

### Epic 6. 3D Passport Export + Share

#### Task 6-1. Passport 렌더 입력 데이터 shape 정의
- 목적
  - Three.js 뷰어가 Workspace 내부 상태와 느슨하게 결합되게 만든다.
- 작업 내용
  - `PassportRenderData` 타입 정의
  - trip title, date range, participant count, day 그룹, stamp item 목록으로 shape 고정
  - Workspace snapshot -> passport render data 변환 함수 작성
- 관련 파일/폴더
  - `src/types/passport.ts`
  - `src/features/passport3d/lib/build-passport-data.ts`
- 필요한 상태/타입
  - `PassportRenderData`, `PassportStampItem`, `PassportDayGroup`
- Supabase 연동 필요 여부
  - 아니오
- 선행조건
  - Task 3-1
- 난이도
  - 중
- 리스크
  - stamp 배치 규칙이 늦게 바뀌면 3D 레이아웃 함수 수정이 필요하다.
- 완료 조건
  - 3D 컴포넌트는 고정된 props shape 하나만 받아 렌더할 수 있다.

#### Task 6-2. Export Modal과 3D Viewer 구현
- 목적
  - Workspace에서 결과물 미리보기를 띄우고 회전 가능한 3D 오브젝트를 보여준다.
- 작업 내용
  - full-screen modal
  - 좌측 여행 요약, 중앙 canvas, 우측 CTA 패널
  - Three.js passport model, stamp mesh/text 배치, orbit control
- 관련 파일/폴더
  - `src/features/passport3d/components/export-modal.tsx`
  - `src/features/passport3d/components/passport-viewer.tsx`
  - `src/features/passport3d/components/passport-scene.tsx`
- 필요한 상태/타입
  - `ExportModalState`, `PassportRenderData`
- Supabase 연동 필요 여부
  - 아니오
- 선행조건
  - Task 6-1, Task 1-3
- 난이도
  - 상
- 리스크
  - 3D 모델 복잡도를 높이면 모바일/저사양 브라우저에서 급격히 느려진다.
- 완료 조건
  - Workspace에서 Export Modal을 열고 3D 여권을 회전해 볼 수 있다.

#### Task 6-3. 이미지 다운로드 구현
- 목적
  - 현재 보고 있는 3D 결과를 PNG로 저장한다.
- 작업 내용
  - canvas를 `preserveDrawingBuffer` 또는 offscreen render target 방식으로 캡처
  - 현재 카메라 각도 기준 PNG 생성
  - 다운로드 버튼 상태 처리
- 관련 파일/폴더
  - `src/features/passport3d/hooks/use-passport-download.ts`
  - `src/features/passport3d/components/export-modal.tsx`
- 필요한 상태/타입
  - `DownloadStatus`
- Supabase 연동 필요 여부
  - 아니오
- 선행조건
  - Task 6-2
- 난이도
  - 중
- 리스크
  - 브라우저별 캔버스 캡처 품질 차이가 있다.
- 완료 조건
  - 사용자가 PNG 이미지 파일을 다운로드할 수 있다.

#### Task 6-4. 읽기 전용 Share 화면 구현
- 목적
  - 링크 공유 대상이 3D 결과를 모바일 포함 환경에서 확인하게 한다.
- 작업 내용
  - 서버에서 trip snapshot fetch
  - read-only share shell + 3D viewer + 다운로드 CTA
  - 로그인 여부와 무관한 접근 정책 반영
- 관련 파일/폴더
  - `src/app/share/[id]/page.tsx`
  - `src/features/passport3d/components/share-screen.tsx`
  - `src/features/passport3d/lib/queries.ts`
- 필요한 상태/타입
  - `SharePageSnapshot`
- Supabase 연동 필요 여부
  - 예
- 선행조건
  - 공유 권한 모델 확정, Task 6-1
- 난이도
  - 중
- 리스크
  - 공개 링크 정책이 바뀌면 접근 제어 로직이 달라진다.
- 완료 조건
  - 공유 링크로 3D 결과를 확인하고 다운로드할 수 있다.

## 섹션 5: State Model

### Supabase에 저장할 상태
- `trips`
  - `id`, `name`, `start_date`, `end_date`, `created_at`
- `trip_members`
  - `trip_id`, `user_id`, `role`, `joined_at`
- `trip_cards`
  - `id`, `trip_id`
  - 장소 메타데이터: `place_id`, `name`, `address`, `lat`, `lng`, `image_url`
  - 보드 상태: `list_type`, `day_index`, `order_index`
  - 메모 상태: `note`
  - 메타: `created_by`, `updated_at`

### Zustand에 둘 상태
- `workspace-ui-store`
  - 현재 선택 카드 id
  - 현재 day filter
  - 검색창 query 문자열
  - split pane 비율
  - drag active state
  - 저장 인디케이터
  - export modal open/close
- `workspace-presence-store`
  - 현재 접속자 목록
  - remote cursor 좌표
  - 카드별 편집 중 사용자
  - 일시적인 remote drag 상태
- `trips-store`
  - 대시보드 필터 탭
  - create modal open state

### 컴포넌트 local state로 둘 상태
- 로그인 버튼 loading
- 검색 dropdown 열림/닫힘
- 카드 메모 textarea 높이
- 3D viewer orbit UI hint 노출 여부

### Zustand 데이터 구조 설계 원칙
- Data Normalization(정규화)
  - 보드 데이터를 중첩 배열로 관리하지 않고, 관계형 DB처럼 평탄화한다.
  - `workspace-board-store`가 이를 담당한다.
  - `columns`는 일자별 카드 id 배열과 컬럼 메타데이터만 보유한다.
  - `cards`는 개별 카드 상세 정보 엔티티 맵을 보유한다.
- Granular Subscription(미세 구독)과 `useShallow`
  - 각 카드 컴포넌트는 전체 store가 아니라 자신의 `cardId`에 해당하는 데이터만 구독한다.
  - 지도 컴포넌트는 전체 카드 객체를 통째로 구독하지 않는다.
  - `useShallow`를 이용해 카드의 `[id, lat, lng, dayIndex]` 배열 값 자체가 바뀌었을 때만 지도 렌더링이 일어나도록 방어한다.
  - 이 구조를 지키면 메모 타이핑 중에도 전체 보드와 지도가 불필요하게 리렌더링되지 않는다.

### 서버 컴포넌트에서만 유지할 상태
- 현재 세션 user
- 페이지 최초 렌더에 필요한 trip snapshot
- 접근 권한 여부

### 3D Passport props/data shape

```ts
type PassportRenderData = {
  tripId: string;
  title: string;
  startDate: string | null;
  endDate: string | null;
  participantCount: number;
  coverCityLabel: string;
  days: PassportDayGroup[];
  stamps: PassportStampItem[];
};

type PassportDayGroup = {
  dayIndex: number;
  colorToken: string;
  places: {
    cardId: string;
    name: string;
    cityLabel: string | null;
  }[];
};

type PassportStampItem = {
  id: string;
  dayIndex: number;
  label: string;
  subLabel?: string | null;
  colorToken: string;
  position: { x: number; y: number; rotation: number };
  emphasis: "hero" | "normal" | "micro";
};
```

### 왜 이렇게 나누는가
- 보드의 진짜 소스 오브 트루스는 `trip_cards`다. 그래야 새로고침, 공유, 3D export가 모두 같은 데이터를 읽는다.
- presence/cursor/editing은 영속할 필요가 없으므로 DB에 저장하지 않는다. Supabase channel presence/broadcast로 끝내는 편이 맞다.
- UI 상태를 DB에 섞지 않으면 optimistic update 롤백이 단순해진다.

## 섹션 6: Realtime Integration Plan

### 채널 단위
- 채널 이름
  - `trip:{tripId}`

### presence, cursor, card lock, cursor sync 분리 기준

#### 1. Presence
- 용도
  - 접속자 목록, 현재 보고 있는 day 등의 세션 메타데이터
- 전송 방식
  - Supabase `presence`
- 저장 위치
  - DB 저장 없음
- 갱신 트리거
  - join, leave, day filter 변경

#### 2. Cursor Sync
- 용도
  - 보드/지도에서 원격 커서 위치 표시
- 전송 방식
  - channel `broadcast`
- 저장 위치
  - DB 저장 없음
- 갱신 트리거
  - pointer move를 50~80ms throttle

#### 3. Card Lock / Editing Presence
- 용도
  - 누가 어떤 카드를 현재 만지고 있는지 표시
- 전송 방식
  - channel `broadcast`
- 저장 위치
  - DB 저장 없음
- 갱신 트리거
  - textarea focus, drag start, blur, drag end, heartbeat timeout

#### 4. Card Data Sync
- 용도
  - 카드 생성/이동/메모 변경/삭제 영속화
- 전송 방식
  - Supabase table write + `postgres_changes`
- 저장 위치
  - `trip_cards`
- 갱신 트리거
  - mutation 발생 시

### 실시간 이벤트 흐름

#### 카드 이동
1. 로컬에서 DnD drop
2. Zustand에서 낙관적 reorder
3. Supabase update
4. 성공 시 헤더 저장 상태 갱신
5. 다른 클라이언트는 `postgres_changes`를 받아 보드 반영

#### 카드 메모 편집
1. focus 시 editing presence broadcast
2. 입력 중 500ms throttle update
3. blur 시 마지막 flush
4. 다른 클라이언트는 note update row를 받아 카드 갱신

#### 드래그 존재감
1. drag start 시 `editing/dragging` broadcast
2. 원격 클라이언트는 해당 카드를 반투명 처리하고 이름 pill 표시
3. drop/end 시 dragging 해제

### 구현상 주의점
- `postgres_changes`가 늦게 도착해도 로컬 낙관적 상태와 충돌하지 않도록 `updated_at` 기준 최신 row를 우선한다.
- 같은 사용자가 여러 탭을 열 경우 presence key를 `userId + tabId`로 둔다.
- 커서 좌표는 viewport 절대값이 아니라 `container-relative coordinates`로 보내야 한다.

## 섹션 7: Risks and Tradeoffs

### 주요 리스크
- 장소 검색 provider와 지도 provider가 미확정이다.
  - 이 둘이 늦어지면 Workspace의 절반이 막힌다.
- DnD와 Realtime을 동시에 붙이면 reorder 충돌 디버깅 비용이 크다.
- 3D export는 시각적 임팩트를 올릴수록 모바일 성능이 급격히 떨어진다.
- Supabase DB 타입이 실제 스키마와 맞지 않으면 타입 안정성이 깨진다.

### 현실적인 대안
- 지도 경로는 실제 길찾기 API 대신 straight polyline으로 제한한다.
- 카드 lock은 진짜 동시 편집 방지 락이 아니라 `시각적 편집 표시`로 제한한다.
- 장소 검색 provider 확정 전까지는 mock adapter로 UI를 먼저 진행한다.
- 3D 여권 모델은 복잡한 glTF 대신 `Three primitives + 텍스트/스탬프 plane`으로 시작한다.
- 다운로드는 첫 단계에서 PNG만 지원한다.

### 모바일/데스크톱 우선순위 차이
- 데스크톱 우선
  - Workspace split layout
  - full DnD
  - 멀티 커서
- 모바일 우선
  - Share 페이지
  - Export modal
  - 로그인/대시보드 기본 사용성
- 모바일에서 후순위
  - 자유 드래그 기반 편집
  - 지도/보드 동시 표시

## 섹션 8: Suggested Build Order

1. DB 최소 스키마와 타입 확정
2. Auth + 라우트 셸 + 공통 UI 프리미티브 구축
3. Trips 목록/생성 플로우 구현
4. Workspace 초기 fetch + 보드 렌더
5. 카드 DnD, 메모 저장, 저장 상태 구현
6. 장소 검색 adapter + 검색 결과를 바구니 카드로 저장
7. 지도 마커/경로 연동
8. Realtime presence
9. Realtime cursor + editing presence
10. `trip_cards` 구독 기반 실시간 동기화
11. Passport render data builder
12. Export Modal + 3D viewer
13. PNG 다운로드
14. Share 화면

### 이 순서를 권장하는 이유
- `trip_cards` 저장 모델이 먼저 고정돼야 보드, 지도, export가 같은 데이터를 볼 수 있다.
- Realtime은 기본 편집이 끝난 뒤 붙여야 디버깅 범위를 줄일 수 있다.
- 3D viewer는 데이터 모델이 안정된 뒤 구현해야 재작업이 적다.
- Share 화면은 Export 결과를 재사용하므로 가장 마지막에 붙이는 편이 효율적이다.
