import { useEffect, useState } from "react";

export function useAnimatedCounter(target) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frameId;
    let startTime;
    const duration = 900;

    const animate = (timestamp) => {
      if (!startTime) {
        startTime = timestamp;
      }

      const progress = Math.min((timestamp - startTime) / duration, 1);
      setValue(Math.round(target * progress));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [target]);

  return value;
}
