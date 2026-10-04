// 모든 카드가 이 가로세로 비율로 통일됩니다. (가로 / 세로)
// 이미지는 비율이 달라도 찌그러지지 않고 object-fit: cover 처럼 가운데를 기준으로 잘려 채워집니다.
export const CARD_ASPECT = 4 / 3

// 카드 면 색 (내용 없이 이 색으로 채워집니다)
export const CARD_COLOR = '#f6f3ea'

// 모서리 반지름 (카드 높이 대비 비율). 0 이면 각진 모서리.
export const CARD_RADIUS = 0

// 카드 테두리. width 는 화면 px, color 는 sRGB, alpha 는 투명도. width 0 이면 없음.
export const CARD_BORDER = { width: 1, color: '#a8a8a8', alpha: 1 }

// 시작 위치: 1번 카드가 카메라 초점(원점)보다 몇 칸 앞(카메라 쪽)에 놓일지.
export const START_OFFSET = 2
