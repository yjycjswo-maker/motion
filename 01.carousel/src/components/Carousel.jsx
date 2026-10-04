import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { animate } from 'framer-motion'
import * as THREE from 'three'
import ProjectCard from './ProjectCard.jsx'
import { START_OFFSET } from '../config.js'
import { prefersReducedMotion } from '../motion.js'

const SPACING = 0.5338157894736841 // 한 칸(카드 한 장)에 해당하는 스크롤 거리
const SCROLL_FACTOR = 5e-4 // virtual-scroll 픽셀 → 3D 단위
const LERP = 0.1 // 관성 비율
const toX = (position) => position / 1.9 // 슬롯 인덱스 → 월드 X

const lerp = (a, b, t) => a + (b - a) * t

// 모든 카드가 공유하는 지오메트리/머티리얼
const cardGeometry = new THREE.BoxGeometry(1, 1, 0.0075)
const eventsGeometry = new THREE.BoxGeometry(1, 1, 0.0075)
const eventsMaterial = new THREE.MeshStandardMaterial({ transparent: true, opacity: 0 })

// 인트로: x = 6 에서 시작해 1번 카드가 원점보다 START_OFFSET 칸 앞에 오도록 슬라이드 인
const START_X = 6
const END_X = -toX(START_OFFSET)

// 무한 고리 + useFrame lerp
export default function Carousel({ scroll, items, playSound, isMobile, onSelect }) {
  const outerRef = useRef(null) // 인트로 슬라이드용
  const innerRef = useRef(null) // 스크롤 이동용
  const current = useRef(0) // lerp 된 현재 위치
  const lastSnap = useRef(0) // 마지막으로 고리를 회전시킨 위치

  // slots: { position, itemIndex, id } — position 은 슬롯 자리, itemIndex 는 어떤 이미지를 보여줄지
  const slots = useRef([])
  const [, forceRender] = useState(0)

  useEffect(() => {
    slots.current = items.map((_, i) => ({ position: i, itemIndex: i, id: i }))
    forceRender((n) => n + 1)
  }, [items.length])

  // 마운트되면 2초 동안 슬라이드 인
  useEffect(() => {
    const ctrl = animate(START_X, END_X, {
      duration: prefersReducedMotion() ? 0.3 : 2,
      delay: 0.2,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => {
        if (outerRef.current) outerRef.current.position.x = v
      },
    })
    return () => ctrl.stop()
  }, [])

  useFrame(() => {
    current.current = lerp(current.current, -(SCROLL_FACTOR * scroll.current), LERP)

    const delta = current.current - lastSnap.current
    const steps = Math.floor(Math.abs(delta) / SPACING)
    const arr = slots.current

    if (steps > 0 && arr.length > 0) {
      for (let i = 0; i < steps; i++) {
        if (delta > 0) {
          // 오른쪽으로 이동: 맨 끝 슬롯을 맨 앞으로
          const last = arr.pop()
          const first = arr[0]
          const idx = (first.itemIndex - 1 + items.length) % items.length
          arr.unshift({ ...last, position: first.position - 1, itemIndex: idx })
        } else {
          // 왼쪽으로 이동: 맨 앞 슬롯을 맨 끝으로
          const first = arr.shift()
          const last = arr[arr.length - 1]
          const idx = (last.itemIndex + 1) % items.length
          arr.push({ ...first, position: last.position + 1, itemIndex: idx })
        }
      }
      forceRender((n) => n + 1)
      lastSnap.current = current.current - (delta % SPACING)
    }

    if (innerRef.current) innerRef.current.position.x = current.current
  })

  return (
    <group ref={outerRef} position-x={START_X} position-y={isMobile ? 0.1 : 0}>
      <group ref={innerRef}>
        {slots.current.map((slot) => (
          <ProjectCard
            key={slot.id}
            x={toX(slot.position)}
            item={items[slot.itemIndex]}
            cardGeometry={cardGeometry}
            eventsGeometry={eventsGeometry}
            eventsMaterial={eventsMaterial}
            playSound={playSound}
            isMobile={isMobile}
            onSelect={onSelect}
          />
        ))}
      </group>
    </group>
  )
}
