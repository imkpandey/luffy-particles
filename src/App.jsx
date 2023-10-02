import { Canvas, useThree } from "@react-three/fiber";
import "./App.css";
import Particles from "./components/Particles";
import { Suspense, useRef } from "react";
import { Text } from "@react-three/drei";
import { Underlay } from "./components/Underlay";

export default function App() {
  const ref = useRef();

  const cameraProps = {
    fov: 75,
    near: 1,
    far: 2000,
    position: [0, 0, 300],
  };

  return (
    <>
      <div ref={ref} id="container">
        <img className="logo" src="logo.png" />
        <h1 className="title">Monkey D. Luffy</h1>
        <Canvas
          gl={{ alpha: false }}
          dpr={[window.devicePixelRatio, 2]}
          camera={cameraProps}
          legacy={true}
          eventSource={ref}
        >
          <color attach="background" args={["#040D12"]} />
          <Suspense fallback={null}>
            <Particles />
            <Underlay />
          </Suspense>
        </Canvas>
      </div>
    </>
  );
}
