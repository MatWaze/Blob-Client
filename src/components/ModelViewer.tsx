import React, { Suspense, useEffect, useState, useMemo } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, useGLTF } from "@react-three/drei"
import * as THREE from "three"
import { Group } from "three"

function Model({ url, textureUrl, scale = 1 }: { url: string, textureUrl?: string, scale?: number }) {
	// 1. Load the GLTF model (This is globally cached by default!)
	const { scene: originalScene } = useGLTF(url) as { scene: Group }

	// 2. THE FIX: Deep clone the scene and materials so each viewer gets its own isolated copy
	const scene = useMemo(() => {
		const clonedScene = originalScene.clone(true);
		
		clonedScene.traverse((child) => {
			if ((child as THREE.Mesh).isMesh) {
				const mesh = child as THREE.Mesh;
				
				// Create a brand new copy of the material for this specific component
				if (Array.isArray(mesh.material)) {
					mesh.material = mesh.material.map(m => m.clone());
				} else {
					mesh.material = mesh.material.clone();
				}
			}
		});
		
		return clonedScene;
	}, [originalScene]);

	// 3. Safely load the texture using standard THREE.js
	const [texture, setTexture] = useState<THREE.Texture | null>(null)

	useEffect(() => {
		if (!textureUrl) {
			setTexture(null);
			return;
		}

		const loader = new THREE.TextureLoader();
		loader.load(textureUrl, (loadedTex) => {
			loadedTex.flipY = false;
			loadedTex.colorSpace = THREE.SRGBColorSpace;
			setTexture(loadedTex);
		});
	}, [textureUrl]);

	// 4. Apply the texture to our isolated, cloned materials
	useEffect(() => {
		if (!scene) return;

		scene.traverse((child) => {
			if ((child as THREE.Mesh).isMesh) {
				const mesh = child as THREE.Mesh;
				
				const applyMap = (mat: THREE.MeshStandardMaterial) => {
					// If texture is null, it successfully clears the map back to the base color
					mat.map = texture;
					mat.needsUpdate = true;
				};

				if (Array.isArray(mesh.material)) {
					mesh.material.forEach(mat => applyMap(mat as THREE.MeshStandardMaterial));
				} else {
					applyMap(mesh.material as THREE.MeshStandardMaterial);
				}
			}
		});
	}, [scene, texture]);

	return <primitive object={scene} scale={scale} />
}

export default function ModelViewer({ 
	url, 
	textureUrl, 
	width = 420, 
	height = 400, 
	modelScale = 3,
	minDistance = 3, 
	maxDistance = 4 
}: { 
	url?: string, 
	textureUrl?: string, 
	width?: number, 
	height?: number, 
	modelScale?: number,
	minDistance?: number, 
	maxDistance?: number 
}) {
	// FIX 1: Don't render anything if we are waiting for an API call. 
	// This stops David from flashing while Apollo is loading.
	if (!url) return null;

	return (
		<Canvas camera={{ position: [0, 0, 3] }} style={{ height: `${height}px`, width: `${width}px` }}>
			<ambientLight intensity={1} />
			<directionalLight position={[2, 2, 2]} />

			<Suspense fallback={null}>
				{/* FIX 2: The `key` prop forces a complete unmount/remount when URLs change. No more ghost textures! */}
				<Model key={url + (textureUrl || "notex")} url={url} textureUrl={textureUrl} scale={modelScale} />
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