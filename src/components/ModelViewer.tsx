import React, { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, useGLTF } from "@react-three/drei"
import { Group } from "three"

type ModelProps = {
  url: string
  scale?: number
}

function Model({ url, scale = 1 }: ModelProps) {
  const { scene } = useGLTF(url) as { scene: Group }

  return <primitive object={scene} scale={scale} />
}

export default function ModelViewer({ width = 420, height = 400, minDistance = 3, maxDistance = 4 }) {
  return (
    <Canvas camera={{ position: [0, 0, 3] }} style={{ height: `${height}px`, width: `${width}px` }}>
      <ambientLight intensity={1} />
      <directionalLight position={[2, 2, 2]} />

      <Suspense fallback={null}>
        <Model url="../../DavidLow.glb" scale={3} />
      </Suspense>

      <OrbitControls
        enableZoom={true}
        maxDistance={maxDistance}
        minDistance={minDistance}
        enablePan={false}
        enableRotate={true}
      />
    </Canvas>
  )
}