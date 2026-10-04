import { useRef } from 'react'

// Audio 객체를 lazy 생성하고 매번 currentTime 을 0으로 되감아 재생
export function useSound(src, { volume = 1 } = {}) {
  const audioRef = useRef(null)

  return () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src)
      audioRef.current.volume = volume
    }
    audioRef.current.currentTime = 0
    audioRef.current.play()?.catch(() => {}) // 사용자 제스처 전 autoplay 차단은 무시
  }
}
