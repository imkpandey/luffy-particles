import { Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";

export function Underlay() {
  const ref = useRef();
  const { viewport, camera } = useThree();
  const depth = -20;
  const { width } = viewport.getCurrentViewport(camera, [0, 0, depth ])

  useFrame(() => {
    ref.current.position.x -= 0.5;
    if (ref.current.position.x < - width * 1.75) {
      ref.current.position.x = width * 1.75;
    }
  }, []);
  return (
    <>
      <Text
        ref={ref}
        fillOpacity={0}
        strokeWidth={0.03}
        strokeOpacity={1}
        font="DelaGothicOne-Regular.woff"
        position={[0, 0, depth]}
        scale={width / 6}
        color="white"
      >
        KING OF THE PIRATES
      </Text>
    </>
  );
}
