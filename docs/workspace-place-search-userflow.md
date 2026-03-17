# SyncTrip Workspace Place Search User Flow

## 목적

Workspace에서 `지도 + 장소 검색 + 일정 item 추가 + 보드/지도 연결`이 어떤 흐름으로 동작하는지 설명한다.

이 문서는 점검 메모가 아니라, 현재 SyncTrip에서 채택하려는 사용자 흐름과 구현 우선순위를 설명하기 위한 문서다.

## 핵심

현재 문서 기준의 핵심 방향은 다음과 같다.

- 지도는 좌측에 항상 노출한다.
- 장소 검색은 Workspace 안에서 처리한다.
- 검색 결과는 `장소 바구니(bucket)`에 넣을 수도 있고, 특정 `Day`에 바로 넣을 수도 있다.
- 사용자가 item 또는 날짜를 선택하면 지도와 보드가 같은 `selectedCardId` 또는 `selectedDayIndex`를 기준으로 반응한다.

즉 MVP에서도 `검색 -> bucket 추가`만 가능한 구조로 제한하지 않는다.  
사용자가 원하면 검색 결과를 **바로 Day 컬럼에 넣는 흐름**까지 지원하는 것을 목표로 둔다.

## 왜 가능한가

현재 데이터 구조는 이 흐름을 수용할 수 있다.

- `trips`
  - 여행 메타데이터
- `trip_items`
  - 장소/일정 item
  - `trip_id`
  - `list_type`
  - `day_index`
  - `lat`, `lng`
  - `name`, `address`
  - `image_url`
- Zustand
  - `board store`
  - `ui store`

특히 `trip_items`에 이미 위치 정보와 list/day 배치 정보가 있으므로:

- 검색 결과를 item으로 생성할 수 있고
- 지도에서 marker를 렌더할 수 있고
- 특정 item을 선택했을 때 보드와 지도 양쪽에서 같은 id를 기준으로 반응시킬 수 있다

## 권장 사용자 흐름

### Flow 1. 장소 검색 후 item 추가

1. 사용자가 Workspace에 진입한다.
2. 좌측에는 지도, 우측에는 `장소 바구니 + Day 컬럼`이 보인다.
3. 사용자가 장소 검색창에 키워드를 입력한다.
4. 검색 결과 목록이 노출된다.
5. 사용자가 특정 장소를 선택한다.
6. 시스템은 Google Places 응답에서 아래 정보를 추출한다.
   - `place_id`
   - `name`
   - `address`
   - `lat`
   - `lng`
   - `image_url` 또는 photo reference 기반 썸네일
7. 시스템은 사용자 입력에 따라 새 `trip_item`을 생성한다.
   - `장소 바구니에 추가`를 선택하면
     - `list_type = bucket`
     - `day_index = null`
   - `특정 Day에 바로 추가`를 선택하면
     - `list_type = day`
     - `day_index = 선택한 day`
8. 우측 보드에 새 카드가 나타난다.
   - bucket으로 넣었으면 `장소 바구니`
   - day로 넣었으면 해당 `Day` 컬럼
9. 좌측 지도에도 새 marker가 반영된다.

### Flow 2. 바구니에서 Day 컬럼으로 이동

1. 사용자가 `장소 바구니`의 item을 Day 컬럼으로 드래그한다.
2. 시스템은 `trip_item`의 `list_type = day`와 `day_index`를 갱신한다.
3. 우측 보드에서 카드가 해당 Day 컬럼으로 이동한다.
4. 좌측 지도에서 해당 item marker 색상도 해당 Day 색상으로 바뀐다.
5. 같은 Day에 속한 장소들은 경로선으로 연결된다.

### Flow 3. 검색 결과를 Day 컬럼에 직접 추가

1. 사용자가 검색 결과에서 특정 장소를 선택한다.
2. 시스템은 `추가 위치`를 묻는다.
   - `장소 바구니`
   - `Day 1`
   - `Day 2`
   - ...
3. 사용자가 특정 Day를 선택한다.
4. 시스템은 새 `trip_item`을 해당 Day에 바로 생성한다.
5. 우측 보드의 해당 Day 컬럼에 카드가 즉시 나타난다.
6. 좌측 지도에서도 해당 Day 색상 marker로 표시된다.

이 흐름은 MVP에서 지원 가치가 높다.  
사용자가 일정 입력을 빠르게 끝내고 싶을 때 `bucket -> drag`를 한 단계 생략할 수 있기 때문이다.

### Flow 4. 보드에서 item 하이라이트 -> 지도 반응

1. 사용자가 우측 보드에서 특정 item을 hover 또는 click 한다.
2. 시스템은 `selectedCardId`를 UI 상태에 저장한다.
3. 좌측 지도는 해당 item marker를 강조한다.
   - marker 확대
   - 색 강조
   - info tooltip 또는 이름 표시
4. 필요하면 같은 Day 경로선도 함께 강조한다.

### Flow 5. 지도에서 marker 선택 -> 보드 반응

1. 사용자가 지도에서 marker를 click 한다.
2. 시스템은 marker가 가리키는 `trip_item.id`를 찾는다.
3. `selectedCardId`를 해당 id로 갱신한다.
4. 우측 보드에서 해당 카드가 하이라이트된다.
5. 필요하면 그 컬럼으로 자동 스크롤한다.

이 흐름도 충분히 가능하다. 핵심은 지도 marker와 보드 card가 같은 `trip_item.id`를 공유해야 한다는 점이다.

## 가장 중요한 상태

이 시나리오를 성립시키는 핵심 상태는 다음이다.

### 1. 검색 결과 상태

별도 UI 상태로 관리:

- `searchQuery`
- `searchResults`
- `isSearching`
- `searchError`

이건 영속 DB 상태가 아니라 화면 상태다.

### 2. 보드 item 상태

영속 DB + board store 기준:

- `trip_items`
- `cardsById`
- `columnsById`

### 3. 선택 상태

양방향 하이라이트를 위해 필요:

- `selectedCardId`

이 값 하나만 있어도:

- 카드 선택 -> 지도 강조
- marker 선택 -> 카드 강조

를 연결할 수 있다.

## MVP 권장안

### 권장안 A. 검색 결과를 bucket에 추가

장점:

- 구현이 단순하다
- 검색과 일정 배치를 분리할 수 있다
- 사용자가 장소를 모아두고 나중에 Day를 정할 수 있다
- 기존 `bucket -> day` 구조와 잘 맞는다

단점:

- 클릭 한 번으로 특정 Day에 바로 넣는 빠른 흐름은 없다

### 권장안 B. 검색 시 어느 Day에 넣을지 바로 선택

장점:

- 일정 입력 속도가 빠르다
- 사용자가 검색과 배치를 한 번에 끝낼 수 있다

단점:

- UI가 더 복잡해진다
- 검색 결과마다 대상 Day 선택 UI가 필요하다
- bucket의 역할이 약해질 수 있다

현재 SyncTrip 기준으로는 **권장안 A와 B를 둘 다 지원하는 방향**이 적절하다.

- 빠르게 넣고 싶은 사용자는 Day 직접 추가
- 모아두고 나중에 정리하고 싶은 사용자는 bucket 추가

## 지도 위 검색창 vs 보드 위 검색창

### 지도 위 검색창

장점:

- 사용자의 정신 모델과 잘 맞는다
- "지도에서 장소를 찾는다"는 느낌이 강하다

단점:

- 지도 오버레이 UI를 따로 설계해야 한다
- 검색 결과 패널과 marker interaction이 겹치기 쉽다

### 보드 위 검색창

장점:

- 현재 Kanban 구조와 자연스럽게 이어진다
- 구현이 단순하다
- 검색 결과를 bucket에 넣는 흐름과 잘 맞는다

단점:

- 지도와 검색이 분리되어 보여서 직관성이 조금 약해질 수 있다

현재 기준 추천:

- 검색 입력은 우선 우측 `장소 바구니` 상단
- 지도는 검색 결과와 선택 반응을 담당
- 이후 필요하면 지도 위 floating search bar를 추가

추후 고도화:

- 지도 위 floating search bar 추가 가능

## 필요한 외부 연동

이 흐름을 구현하려면 결국 장소 검색 provider가 필요하다.

현재 구상과 가장 잘 맞는 선택은:

- Google Maps JavaScript API
- Google Places API

최소 필요 기능:

- Place autocomplete 또는 text search
- place detail
- lat/lng
- 대표 이미지

## 선결정 항목

이 시나리오를 실제 구현하기 전에 아래를 먼저 정해야 한다.

### 1. 검색창 위치

- 지도 위 오버레이
- 장소 바구니 상단

### 2. 검색 결과 추가 방식

- 선택 즉시 bucket 추가
- 선택 후 특정 Day 직접 지정
- 두 방식을 모두 지원할지 여부

### 3. 대표 이미지 저장 방식

- `image_url` 직접 저장
- Google photo reference 저장 후 렌더 시 URL 생성

### 4. marker 선택 시 보드 반응 수준

- 카드 하이라이트만
- 해당 컬럼 자동 스크롤까지

### 5. 카드 선택 시 지도 반응 수준

- marker 강조만
- marker 중심으로 지도 pan/zoom까지

## 추천 결정

현재 기준으로는 아래가 가장 적절하다.

- 검색창 위치: `장소 바구니` 상단
- 검색 결과 추가 방식:
  - `장소 바구니에 추가`
  - `특정 Day에 바로 추가`
  둘 다 지원
- item 데이터: `trip_items` 저장
- 양방향 연결 기준: `selectedCardId`
- 지도 반응:
  - 1차는 marker 강조만
  - 자동 pan/zoom은 후순위
- 보드 반응:
  - 1차는 카드 하이라이트만
  - 컬럼 자동 스크롤은 후순위

## 구현 순서 제안

1. 검색 UI와 결과 목록 추가
2. 검색 결과를 `trip_items`로 생성
   - bucket 또는 day 직접 배치 지원
3. bucket/day 컬럼에서 새 item 렌더링
4. 지도 marker 렌더링
5. `selectedCardId` 기반 양방향 하이라이트
6. 이후 DnD와 저장 연결

## 최종 판단

네가 제안한 시나리오는 충분히 가능한 시나리오다.

현재 가장 중요한 건:

- 검색
- bucket 또는 day 직접 추가
- 보드/지도 연결

즉:

- "지도에서 검색도 하고"
- "오른쪽 보드와 연결되고"
- "필요하면 특정 Day로 바로 넣을 수 있는"

흐름을 우선 구현하는 것이 맞다.
