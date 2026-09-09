import { useEffect, useRef } from "react";
import { h, render } from "preact";
import { Goban } from "@sabaki/shudan";

export default function useBoardRenderer({
  signMap,
  vertexSize,
  onVertexClick
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    render(
      h(Goban, {
        signMap,
        vertexSize,
        onVertexClick,
        showCoordinates: false
      }),
      containerRef.current
    );

    return () => {
      if (containerRef.current) {
        render(null, containerRef.current);
      }
    };
  }, [
    signMap,
    vertexSize,
    onVertexClick
  ]);

  return containerRef;
}
