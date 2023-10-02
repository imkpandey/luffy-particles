import React, { useRef, useLayoutEffect, useMemo, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import {
  LinearFilter,
  RGBAFormat,
  Vector2,
  Object3D,
} from "three";
import { gsap } from "gsap";
import { vertex, fragment } from "../shaders";
import Interactivity, { texture } from "../Interactivity";
import img1 from '../assets/luffy.png'
import { useTexture } from "@react-three/drei";

const Particles = () => {
  const instanceMeshRef = useRef();

  // Define size and depth properties
  let { uSize, uDepth } = useMemo(() => {
    let uSize = { value: 0.0 };
    let uDepth = { value: -30.0 };

    return { uSize, uDepth };
  }, []);

  // Load texture and apply filters
  const ts = useTexture(img1);
  ts.minFilter = LinearFilter;
  ts.magFilter = LinearFilter;
  ts.format = RGBAFormat;

  // Extract width, height, and the number of particles (dots) from the loaded texture
  const width = ts.image.width;
  const height = ts.image.height;
  const dots = width * height * 4;

  // Function for showing particles with animations
  const showParticles = useCallback((dValue, sValue, callback) => {
    gsap.timeline({ onComplete: callback })
      .to(uDepth, { duration: 1.0, value: dValue })
      .to(uSize, { duration: 2.0, value: sValue }, '-=1.0');
  }, [uDepth, uSize])

  // Create arrays for indices and positions of particles using useMemo
  const { sIndices, sPositions } = useMemo(() => {
    const sIndices = new Uint16Array(dots);
    const sPositions = new Float32Array(dots);

    for (let i = 0; i < dots; i++) {
      sIndices[i] = i;

      sPositions[i * 3 + 0] = i % width;
      sPositions[i * 3 + 1] = Math.floor(i / width);
    }

    return { sIndices, sPositions };
  }, [dots, width]);

  // UseLayoutEffect to position particles and initialize animations
  useLayoutEffect(() => {
    const tempObject = new Object3D();

    for (let i = 0; i < dots; i++) {
      tempObject.position.set(
        sPositions[i * 3 + 0],
        sPositions[i * 3 + 1],
        sPositions[i * 3 + 2]
      );

      tempObject.updateMatrix();
      instanceMeshRef.current.setMatrixAt(i, tempObject.matrix);
    }

    instanceMeshRef.current.instanceMatrix.needsUpdate = true;
    showParticles(1.0, 1.0); // Initial animation
  }, [dots, sPositions, showParticles]);

  // UseFrame for continuous animation updates
  useFrame(({ clock }) => {
    instanceMeshRef.current.material.uniforms.uTime.value = clock.elapsedTime;
  });

  // Define uniforms for shaders
  const uniforms = {
    uSize,
    uDepth,
    uTime: { value: 0.0 },
    uRayTexture: { value: texture },
    uTexture: { value: ts }, // Initial texture
    uTextureSize: { value: new Vector2(width, height) },
  };

  return (
    <>
      <instancedMesh ref={instanceMeshRef} args={[null, null, dots]}>
        <planeGeometry attach="geometry" args={[2, 2]}>
          <instancedBufferAttribute
            attach="attributes-offset"
            args={[sPositions, 3, false]}
          />
          <instancedBufferAttribute
            attach="attributes-index"
            args={[sIndices, 1, false]}
          />
        </planeGeometry>
        <shaderMaterial
          attach="material"
          uniforms={uniforms}
          fragmentShader={fragment}
          vertexShader={vertex}
          transparent={true}
          depthTest={false}
        />
      </instancedMesh>
      <Interactivity width={width} height={height} />
    </>
  );
};

export default Particles;
