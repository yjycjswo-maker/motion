// 기기 설정의 "동작 줄이기". 켜져 있으면 카드 튀어나옴·인트로 슬라이드를 짧게 줄입니다.
const mq = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null

export const prefersReducedMotion = () => !!mq?.matches
