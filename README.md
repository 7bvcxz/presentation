# AI가 개발자를 대체할 수 있을까요?

30~35분 분량 기술 발표용 웹 프레젠테이션.
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
index.html    18개 Slide + Speaker Note(<template class="notes">) + 아이콘 스프라이트
styles.css    디자인 토큰 → 타이포 → 프리미티브(node/chip/arrow) → 슬라이드 컴포넌트
script.js     Stage 스케일링 · 단계 Reveal 엔진 · 내비게이션 · 카운트업 · 노트
assets/       (선택) modulo-1..4.png
```

### 화면 규격
1920×1080 고정 Stage를 뷰포트에 맞춰 **균등 스케일**합니다. 어떤 해상도·비율에서도
레이아웃이 깨지지 않고 letterbox로 중앙 정렬됩니다. (1280×1024 / 1440×900 / 4K 검증 완료)

### 실제 스크린샷 넣기 (Page 5)
`assets/` 에 `modulo-1.png` ~ `modulo-4.png` (jpg/webp 가능)를 넣으면
Page 5 하단에 자동으로 스트립이 생깁니다. 파일이 없으면 그 영역은 아예 사라지고
레이아웃은 그대로 균형을 유지합니다. **코드 수정 불필요.**

## 디자인 시스템

- Accent: `#FF4D00` — 발표 전체에서 이 색 하나만 강조용으로 사용
- Ink `#0B0B0C` / BG `#FBFBFA` / Line `#E2E2DF`
- Dark Slide: Page 2(회의감), Page 8(문제 발생), Page 16 후반(결론) — 감정선 전환 지점에만 사용
- 다이어그램은 전부 직접 제작한 HTML/CSS/SVG (외부 이미지 없음)
- 색/간격/모서리 값을 바꾸려면 `styles.css` 상단 `:root` 토큰만 수정하면 전체에 반영됩니다.

## 페이지 구성

| # | 내용 | 단계 수 |
|---|---|---|
| 01 | 들어가면서 — 질문 던지기 | 4 |
| 02 | AI 개발 Challenge (dark) | 4 |
| 03 | 직접 해보자 — 4개 시련 | 2 |
| 04 | 무엇을 만들까 — Spotfire급 BI Tool (12개 기능 연타) | 15 |
| 05 | **결과부터** — 50 Days / 433 Commits / 160+ / 1,200+ | 6 |
| 06 | **개발 방식의 변화** — 핵심 이해 · 즉시 개발 · 장기 위임 → 신뢰성 유지 → 4~5 Projects | 4 |
| 07 | 1단계 검증 — Prototype → Go/No-Go | 5 |
| 08 | **본질적 문제** — AI Output ≫ Human Capacity (dark) | 5 |
| 09 | Problem 01 → Everything on Web | 3 |
| 10 | **Problem 02 → Test Everything** | 3 |
| 11 | Problem 03 → Documentation for Human | 3 |
| 12 | Problem 04 → Make Decisions Persistent | 4 |
| 13 | **최종 구조** — 지금까지의 구조 vs 새로운 구조 비교 → 3층 아키텍처 | 4 |
| 14 | 이 방식의 강력함 | 4 |
| 15 | 정리하며 | 4 |
| 16 | **다시 처음 질문** — 결론 (후반 dark 전환) | 7 |
| 17 | **마무리 — 걷어내기** — 3가지 회수 → "하나씩 걷어내는 것" | 2 |
| 18 | **마지막 메시지** — 생각의 속도가 개발의 속도 → Q&A | 1 |

**굵은 페이지**는 연출 비중이 큰 지점입니다. Page 4는 빠르게 연타, Page 16은 각 단계마다 충분히 쉬어가세요.

## 대본

각 슬라이드 `<template class="notes">` 안에 발표 대본이 그대로 들어 있습니다.
화면에는 절대 렌더링되지 않으며 `N` 키로만 확인합니다.
수정하려면 `index.html` 에서 해당 슬라이드의 `<template class="notes">` 블록만 고치면 됩니다.
