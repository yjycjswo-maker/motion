import { useEffect, useRef } from 'react'
import { useAspect } from '@react-three/drei'
import { animate, useMotionValue } from 'framer-motion'
import * as THREE from 'three'
import { vertexShader, fragmentShader } from '../shaders.js'
import { CARD_ASPECT, CARD_COLOR, CARD_RADIUS, CARD_BORDER } from '../config.js'
import { prefersReducedMotion } from '../motion.js'

const POP_Z = 0.65 // 호버 시 카드가 튀어나가는 최소 거리
// 앞 카드와 겹치지 않도록, 카드 폭의 이 비율만큼 옆으로 완전히 빠져나옵니다
const POP_CLEAR = 1.08

// 호버 모션은 화면 폭이 아니라 마우스가 있는지로 켭니다. 터치 기기에서는 꺼짐.
const canHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches

// '#rrggbb' → vec3 (0..1). 이 머티리얼은 색 관리 변환 없이 값을 그대로 출력하므로 sRGB 값을 그대로 넘깁니다.
const hexToVec3 = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255)
}
const cardColor = hexToVec3(CARD_COLOR)
const borderColor = hexToVec3(CARD_BORDER.color)

// 보이는 메시 + 포인터 이벤트용 투명 히트 메시
export default function ProjectCard({
  x,
  item,
  cardGeometry,
  eventsGeometry,
  eventsMaterial,
  playSound,
  isMobile,
  onSelect,
}) {
  const meshRef = useRef(null)
  const hitRef = useRef(null)
  const z = useMotionValue(0) // pop 높이
  const hovering = useRef(false) // 포인터가 이 카드 위에 있는지
  const enterZ = useRef(0) // 포인터가 들어온 순간 카드가 있던 z

  // 모든 카드를 CARD_ASPECT 비율로 통일, 모바일 0.255 / 데스크톱 0.275 배율
  const scale = useAspect(CARD_ASPECT, 1, isMobile ? 0.255 : 0.275)
  const popZ = Math.max(POP_Z, scale[0] * POP_CLEAR)
  const uniforms = useRef({
    uColor: { value: cardColor },
    uCardAspect: { value: CARD_ASPECT },
    uRadius: { value: CARD_RADIUS },
    uBorderWidth: { value: CARD_BORDER.width },
    uBorderColor: { value: borderColor },
    uBorderAlpha: { value: CARD_BORDER.alpha ?? 1 },
  })

  // 히트 메시는 평소엔 보이는 카드와 같은 자리·크기.
  // 호버 중에는 "들어온 순간의 자리 ~ 튀어나간 자리" 를 모두 덮도록 늘려서 enter/leave 떨림을 막습니다.
  const applyZ = () => {
    if (meshRef.current) meshRef.current.position.z = z.get()
    const hit = hitRef.current
    if (!hit) return
    if (hovering.current) {
      const lo = Math.min(enterZ.current, popZ)
      const hi = Math.max(enterZ.current, popZ)
      hit.position.z = (lo + hi) / 2
      hit.scale.x = scale[0] + (hi - lo)
    } else {
      hit.position.z = z.get()
      hit.scale.x = scale[0]
    }
  }

  const popIn = () => {
    animate(z, popZ, { duration: prefersReducedMotion() ? 0.15 : 0.5, ease: [0.83, 0, 0.17, 1], onUpdate: applyZ })
  }

  const popOut = () => {
    animate(z, 0, { duration: prefersReducedMotion() ? 0.1 : 0.35, ease: [0.65, 0, 0.35, 1], onUpdate: applyZ })
  }

  useEffect(() => {
    applyZ()
  }, [scale]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <group>
      {/* 보이는 카드 */}
      <mesh ref={meshRef} position={[x - 0.01, 0, 0]} rotation-y={-Math.PI / 2} scale={scale} geometry={cardGeometry}>
        <shaderMaterial
          transparent
          depthWrite={false}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms.current}
        />
      </mesh>

      {/* 포인터 이벤트만 받는 히트 영역 (applyZ 참고) */}
      <mesh
        ref={hitRef}
        position={[x, 0, 0]}
        rotation-y={-Math.PI / 2}
        scale={scale}
        visible={false}
        geometry={eventsGeometry}
        material={eventsMaterial}
        onClick={(e) => {
          e.stopPropagation()
          onSelect?.(item)
        }}
        onPointerEnter={(e) => {
          if (!canHover()) return
          e.stopPropagation()
          hovering.current = true
          enterZ.current = z.get()
          applyZ()
          document.body.style.cursor = 'pointer'
          playSound()
          popIn()
        }}
        onPointerLeave={(e) => {
          if (!canHover()) return
          e.stopPropagation()
          hovering.current = false
          applyZ()
          document.body.style.cursor = 'default'
          popOut()
        }}
      />
    </group>
  )
}
