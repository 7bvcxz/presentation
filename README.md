# AI가 개발자를 대체할 수 있을까요?

30~35분 분량 기술 발표용 웹 프레젠테이션.

> ## ⚠️ 이 버전은 **대외용(비공개 정보 제거)** 입니다
>
> - 제품(BI Tool)의 **실체·진척도·실적 수치를 일절 노출하지 않습니다.**
>   (Days / Commits / Features / Test Cases / 기능 커버리지 / 성능 배수 / 병행 프로젝트 수)
> - 말할 수 있는 범위는 **"Spotfire를 대체할 만한지 프로토타입으로 검증했고, 착수는 가능해 보인다. 다만 이제 시작 단계다"** 까지입니다.
> - 검증한 것은 **01 Interaction Performance / 02 Big Data Processing 두 가지 프로토타입**까지입니다.
>   현재 위치는 **남은 문제가 많은 상태에서 개발을 막 시작한 약 10% 지점**입니다.
> - 발표 목표는 실적 자랑이 아니라 **함께할 사람과의 접점 만들기**입니다. 다만 화면에는 넣지 않고,
>   발표자가 Q&A를 닫을 때 **구두로만** 전합니다. (17페이지 Speaker Note에 문구가 있습니다.)
>
> **원본(수치 포함 전체 버전)** 은 `archive/v1-full` 브랜치와 `v1-full` 태그에 보존되어 있습니다.
> ```
> git show v1-full:index.html > /tmp/full.html   # 열람
> git switch archive/v1-full                     # 전체 버전으로 이동
> ```
> GitHub Pages는 `main`만 서빙하므로 원본은 배포되지 않습니다.
순수 HTML / CSS / JavaScript. **외부 CDN 의존성 없음 → 오프라인에서 그대로 발표 가능.**

## 실행

```
open index.html          # 더블클릭으로 열어도 동작합니다
# 또는
python3 -m http.server 8080   →  http://localhost:8080
```

> `file://` 로 열어도 전부 동작합니다. (스크린샷 자동 로딩만 로컬 서버에서 더 안정적)

## 조작

| Key | 동작 |
|---|---|
| `→` `Space` `Enter` `PageDown` / **클릭** | 다음 단계 → 다음 페이지 |
| `←` `PageUp` / **우클릭** | 이전 단계 → 이전 페이지 |
| `↓` `↑` | 페이지 단위 이동 (단계 건너뛰기) |
| `Home` / `End` | 첫 / 마지막 페이지 |
| `F` | 전체화면 |
| `N` | **Speaker Note** 패널 토글 |
| `?` | 단축키 도움말 |
| `Alt` + `1~9` | 해당 페이지로 점프 |

- URL 해시(`#/7`)로 특정 페이지에서 바로 시작할 수 있습니다. 리허설 중 새로고침해도 위치가 유지됩니다.
- 발표 중 텍스트 선택은 비활성화되어 있습니다.

## 구조

```
index.html    17개 Slide + Speaker Note(<template class="notes">) + 아이콘 스프라이트
styles.css    디자인 토큰 → 타이포 → 프리미티브(node/chip/arrow) → 슬라이드 컴포넌트
script.js     Stage 스케일링 · 단계 Reveal 엔진 · 내비게이션 · 카운트업 · 노트
assets/       (선택) modulo-1..4.png
```

### 화면 규격
1920×1080 고정 Stage를 뷰포트에 맞춰 **균등 스케일**합니다. 어떤 해상도·비율에서도
레이아웃이 깨지지 않고 letterbox로 중앙 정렬됩니다. (1280×1024 / 1440×900 / 4K 검증 완료)

## 디자인 시스템

- Accent: `#FF4D00` — 발표 전체에서 이 색 하나만 강조용으로 사용
- Ink `#0B0B0C` / BG `#FBFBFA` / Line `#E2E2DF`
- Dark Slide: Page 2(회의감), Page 7(문제 발생), Page 15 후반(결론) — 감정선 전환 지점에만 사용
- 다이어그램은 전부 직접 제작한 HTML/CSS/SVG (외부 이미지 없음)
- 색/간격/모서리 값을 바꾸려면 `styles.css` 상단 `:root` 토큰만 수정하면 전체에 반영됩니다.

## 페이지 구성

| # | 내용 | 단계 수 |
|---|---|---|
| 01 | 들어가면서 — 질문 던지기 | 4 |
| 02 | AI 개발 Challenge (dark) | 4 |
| 03 | 직접 해보자 — 4개 시련 | 2 |
| 04 | 무엇을 만들까 — Spotfire급 BI Tool (12개 기능 연타) | 15 |
| 05 | **1단계 검증** — 01·02만 Prototype 검증 → Go/No-Go → 진척 미터(Prototype 어느 정도 / Development 약 10%) | 6 |
| 06 | **개발 방식의 변화** — 핵심 이해 · 즉시 개발 · 장기 위임 → "신뢰성은 누가 지키나?" | 2 |
| 07 | **본질적 문제** — AI Output ≫ Human Capacity (dark) | 5 |
| 08 | Problem 01 → Everything on Web | 3 |
| 09 | **Problem 02 → Test Everything** | 3 |
| 10 | Problem 03 → Documentation for Human | 3 |
| 11 | Problem 04 → Make Decisions Persistent | 4 |
| 12 | **최종 구조** — 지금까지의 구조 vs 새로운 구조 비교 → 3층 아키텍처 | 4 |
| 13 | 이 방식의 강력함 | 4 |
| 14 | 정리하며 | 4 |
| 15 | **다시 처음 질문** — 결론 (후반 dark 전환) | 7 |
| 16 | **마무리 — 걷어내기** — 3가지 회수 → "하나씩 걷어내는 것" | 2 |
| 17 | **마지막 메시지** — 생각의 속도가 개발의 속도 → Q&A | 1 |

**굵은 페이지**는 연출 비중이 큰 지점입니다. Page 4는 빠르게 연타, Page 15는 각 단계마다 충분히 쉬어가세요.

## 대본

각 슬라이드 `<template class="notes">` 안에 발표 대본이 그대로 들어 있습니다.
화면에는 절대 렌더링되지 않으며 `N` 키로만 확인합니다.
수정하려면 `index.html` 에서 해당 슬라이드의 `<template class="notes">` 블록만 고치면 됩니다.
