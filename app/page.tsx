"use client";
// src/ResizableDivs.tsx
import React, {
  useState,
  useRef,
  useCallback,
  MouseEvent as ReactMouseEvent,
  useEffect,
} from "react";
import { useSprings, animated } from "react-spring";

interface Div {
  id: number;
  flex: number;
  color: string;
}

const colors = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-gray-500",
];

const ResizableDivs: React.FC = () => {
  const [divs, setDivs] = useState<Div[]>([
    { id: 1, flex: 1, color: colors[0] },
  ]);
  const parentRef = useRef<HTMLDivElement>(null);

  const [springs, api] = useSprings(divs.length, (index) => ({
    flex: divs[index].flex,
    config: { tension: 300, friction: 30 },
  }));

  useEffect(() => {
    api.start((index) => ({
      flex: divs[index].flex,
    }));
  }, [divs, api]);

  const addDiv = useCallback(() => {
    const nextColor = colors[divs.length % colors.length];
    setDivs([...divs, { id: divs.length + 1, flex: 1, color: nextColor }]);
  }, [divs]);

  const handleMouseDown = (
    index: number,
    e: ReactMouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const startX = e.clientX;
    const startFlex = divs.map((div) => div.flex);
    const parentWidth = parentRef.current!.offsetWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const newFlex = [...startFlex];
      const deltaFlex = (deltaX / parentWidth) * divs.length;

      newFlex[index] += deltaFlex;
      newFlex[index + 1] -= deltaFlex;

      setDivs(newFlex.map((flex, i) => ({ ...divs[i], flex })));
    };

    const handleMouseUp = () => {
      document.removeEventListener(
        "mousemove",
        handleMouseMove as EventListener
      );
      document.removeEventListener("mouseup", handleMouseUp as EventListener);
    };

    document.addEventListener("mousemove", handleMouseMove as EventListener);
    document.addEventListener("mouseup", handleMouseUp as EventListener);
  };

  const getRelativeWidth = (flex: number) => {
    const totalFlex = divs.reduce((sum, div) => sum + div.flex, 0);
    return ((flex / totalFlex) * 100).toFixed(2);
  };

  return (
    <div className="container mx-auto mt-10">
      <button
        onClick={addDiv}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Add Div
      </button>
      <div ref={parentRef} className="flex border border-gray-300 w-full h-64">
        {springs.map((spring, index) => (
          <animated.div
            key={divs[index].id}
            className={`resizable ${divs[index].color} p-4 text-center relative`}
            style={spring}
          >
            <div>Div {divs[index].id}</div>
            <div className="absolute bottom-0 left-0 w-full text-white text-xs">
              {getRelativeWidth(divs[index].flex)}%
            </div>
            {index < divs.length - 1 && (
              <div
                className="resizer absolute right-0 top-0 h-full w-2 cursor-ew-resize"
                onMouseDown={(e) => handleMouseDown(index, e)}
              />
            )}
          </animated.div>
        ))}
      </div>
    </div>
  );
};

export default ResizableDivs;
