import { useEffect } from "react";
import Lenis from "lenis";

export function useLenis({ enabled = true } = {}) {
  useEffect(() => {
    if (typeof window === "undefined" || !enabled) {
      return undefined;
    }

    const lenis = new Lenis({
      smoothWheel: true,
      lerp: 0.085,
    });

    let rafId;

    const animate = (time) => {
      lenis.raf(time);
      rafId = window.requestAnimationFrame(animate);
    };

    rafId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [enabled]);
}
