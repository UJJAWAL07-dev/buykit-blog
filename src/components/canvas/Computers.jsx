import React, { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";
import CanvasLoader from "../Loader";

const CyberDjinn = ({ isMobile }) => {
  const { scene } = useGLTF("/models/buykit.glb");
  const modelRef = useRef();

  useEffect(() => {
    scene.traverse((child) => {
      if (!child.isMesh) return;

      child.geometry.computeBoundingBox();

      const box = child.geometry.boundingBox;
      if (!box) return;

      const size = new THREE.Vector3();
      box.getSize(size);

      const isLargeFlatMesh =
        (size.x > 10 && size.z > 10 && size.y < 0.5) ||
        (size.x > 10 && size.y > 10 && size.z < 0.5);

      if (isLargeFlatMesh) {
        child.visible = false;
      }
    });
  }, [scene]);

  useFrame(({ clock }) => {
  if (!modelRef.current) return;

  const time = clock.getElapsedTime();

  modelRef.current.position.y =
    (isMobile ? -0.5 : -1.0) + Math.sin(time * 1.2) * 0.08;

  modelRef.current.rotation.y =
    Math.sin(time * 0.35) * 0.05;
});
  return (
    <group>
      <ambientLight intensity={0.7} />
      <hemisphereLight
        skyColor="#c5d9ff"
        groundColor="#24113f"
        intensity={1}
      />
      <directionalLight
        position={[-5, 8, 5]}
        intensity={2}
        color="#ffffff"
      />
      <directionalLight
        position={[5, 2, -4]}
        intensity={1.5}
        color="#915eff"
      />
      <pointLight
        position={[2, 0, 3]}
        intensity={1.2}
        color="#6c63ff"
        distance={10}
      />

    <group
  ref={modelRef}
  position={[0, isMobile ? -0.5 : -1.0, 0]}
>
  <primitive
    object={scene}
    scale={isMobile ? 0.10 : 0.20}
    rotation={[0, (3 * Math.PI) / 2, 0]}
  />
</group>
    </group>
  );
};

const ComputersCanvas = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 500px)");

    setIsMobile(mediaQuery.matches);

    const handleMediaQueryChange = (event) => {
      setIsMobile(event.matches);
    };

    mediaQuery.addEventListener("change", handleMediaQueryChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
    };
  }, []);

  return (
    <div className="cyber-djinn-canvas">
      <Canvas
        frameloop="always"
        dpr={[1, 2]}
        camera={{ position: [0, 0, 8], fov: 35 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={<CanvasLoader />}>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={true}
            rotateSpeed={0.6}

          />
          <CyberDjinn isMobile={isMobile} />
        </Suspense>

        <Preload all />
      </Canvas>
    </div>
  );
};

export default ComputersCanvas;