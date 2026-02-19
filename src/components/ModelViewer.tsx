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

export default function ModelViewer() {
  return (
    <Canvas camera={{ position: [0, 0, 3] }} style={{ height: "400px", width: "420px" }}>
      <ambientLight intensity={1} />
      <directionalLight position={[2, 2, 2]} />

      <Suspense fallback={null}>
        <Model url="../../DavidLow.glb" scale={3} />
      </Suspense>

      <OrbitControls
        enableZoom={true}
        maxDistance={4}
        minDistance={3}
        enablePan={false}
        enableRotate={true}
      />
    </Canvas>
  )
}