import { Suspense, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import VirtualScroll from 'virtual-scroll'
import Carousel from './Carousel.jsx'
import { useSound } from '../useSound.js'
import { useWindowSize } from '../useWindowSize.js'

// virtual-scroll 로 휠/터치/방향키 델타를 받고 R3F Canvas 를 띄웁니다.
export default function Scene({ items, onSelect }) {
  const containerRef = useRef(null)
  const scroll = useRef(0)
  const { width } = useWindowSize()
  const playSound = useSound('/sounds/click.wav', { volume: 0.8 })

  useEffect(() => {
    const vs = new VirtualScroll({
      el: containerRef.current,
      touchMultiplier: 20,
      keyStep: 810,
    })
    const onScroll = (e) => {
      scroll.current += e.deltaY
    }
    vs.on(onScroll)
    return () => {
      vs.off(onScroll)
      vs.destroy()
    }
  }, [])

  return (
    <div className="Scene" ref={containerRef}>
      <Canvas camera={{ fov: 15, near: 0.1, far: 20, position: [-5.9, 3, 3.4] }}>
        <directionalLight position={[0, 25, 50]} intensity={1} color="white" />
        <ambientLight intensity={1.5} color="white" />
        <Suspense fallback={null}>
          <Carousel
            scroll={scroll}
            items={items}
            playSound={playSound}
            isMobile={width < 1024}
            onSelect={onSelect}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
