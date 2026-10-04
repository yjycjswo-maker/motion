import Scene from './components/Scene.jsx'
import { items } from './data/items.js'

// 캐러셀만 띄우는 최소 페이지: 상하단 그라디언트 + 풀스크린 3D 캐러셀
export default function App() {
  return (
    <>
      <div className="Overlay Overlay--top" />
      <div className="Overlay Overlay--bottom" />
      <main className="Stage">
        <Scene
          items={items}
          // 카드 클릭 시 호출됩니다. link 가 있으면 이동, 없으면 콘솔에 출력.
          onSelect={(item) => (item.link ? window.location.assign(item.link) : console.log('select', item))}
        />
      </main>
    </>
  )
}
