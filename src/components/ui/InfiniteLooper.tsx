import React, { useEffect, useRef, useState, useCallback } from "react";

interface InfiniteLooperProps {
  speed: number; // pixels per second
  direction: "right" | "left";
  children: React.ReactNode;
}

const InfiniteLooper: React.FC<InfiniteLooperProps> = ({
  speed,
  direction,
  children,
}) => {
  const [looperInstances, setLooperInstances] = useState(1);
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [animationDuration, setAnimationDuration] = useState(0);

  const setupInstances = useCallback(() => {
    if (!innerRef?.current || !outerRef?.current) return;

    const { width } = innerRef.current.getBoundingClientRect();
    const { width: parentWidth } = outerRef.current.getBoundingClientRect();
    const instanceWidth = width / innerRef.current.children.length;

    if (width < parentWidth + instanceWidth) {
      const instancesRequired = Math.ceil(
        (parentWidth + instanceWidth) / width
      );
      setLooperInstances(Math.max(1, instancesRequired));
    }

    // Calculate animation duration based on speed
    const newDuration = width / speed;
    setAnimationDuration(newDuration);
  }, [speed]);

  useEffect(() => {
    setupInstances();
    window.addEventListener("resize", setupInstances);
    return () => {
      window.removeEventListener("resize", setupInstances);
    };
  }, [setupInstances]);

  return (
    <div className="looper" ref={outerRef}>
      <div className="looper__innerList" ref={innerRef} data-animate="true">
        {[...Array(looperInstances)].map((_, ind) => (
          <div
            key={ind}
            className="looper__listInstance"
            style={{
              animationDuration: `${animationDuration}s`,
              animationDirection: direction === "right" ? "reverse" : "normal",
            }}
          >
            {children}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfiniteLooper;
