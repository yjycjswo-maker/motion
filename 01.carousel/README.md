# carousel-only

`carousel-3d` 에서 3D 카드 캐러셀만 떼어 낸 독립 프로젝트입니다.
(인트로 배지, 상세 창, 커스텀 커서, 키보드 카드 목록, 페이지 HTML 은 빠져 있습니다.)

```bash
pnpm install   # 또는 npm install
pnpm dev
```

- 카드 목록: `src/data/items.js` (`title` / `link`, 카드 면은 비어 있음)
- 카드 색·비율·테두리·시작 위치: `src/config.js`
- 카드 클릭 동작: `src/App.jsx` 의 `onSelect` (기본: `link` 가 있으면 이동)

## 구조

```
src/
  App.jsx                 상하단 그라디언트 + Scene
  components/Scene.jsx    Canvas, 카메라, 휠/터치/방향키 입력(virtual-scroll)
  components/Carousel.jsx 무한 고리 슬롯 재배치 + 관성 이동 + 슬라이드 인
  components/ProjectCard.jsx 카드 메시(셰이더) + 호버 pop + 클릭
  shaders.js              단색 면 · 둥근 모서리 · 테두리 셰이더
```
