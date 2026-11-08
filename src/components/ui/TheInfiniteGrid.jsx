import React, { useState, useEffect, useRef } from "react";

/**
 * TheInfiniteGrid Component
 * Replicates the interactive 21st.dev / Aceternity cursor-reactive infinite scrolling grid.
 *
 * Features:
 * - Ambient warm-orange (top-right) and cool-blue (bottom-left) floating radial glow orbs.
 * - Layer 1: Base subtle scrolling grid lines moving infinitely in diagonal motion.
 * - Layer 2: Active high-contrast grid lines revealed exclusively under the cursor spotlight.
 * - Fluid mouse spring interpolation via requestAnimationFrame (no heavy dependencies required).
 */
export function TheInfiniteGrid({
  children,
  className = "",
  gridSize = 44,
  scrollDuration = 22,
  spotlightRadius = 320,
}) {
  const containerRef = useRef(null);
  const targetPos = useRef({ x: 500, y: 350 });
  const currentPos = useRef({ x: 500, y: 350 });
  const [opacity, setOpacity] = useState(0.85);

  useEffect(() => {
    let animId;

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      targetPos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      setOpacity(1);
    };

    const handleMouseLeave = () => {
      setOpacity(0.3);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    // Smooth spring interpolation loop
    const tick = () => {
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * 0.12;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * 0.12;

      if (container) {
        container.style.setProperty("--grid-mouse-x", `${currentPos.current.x.toFixed(1)}px`);
        container.style.setProperty("--grid-mouse-y", `${currentPos.current.y.toFixed(1)}px`);
      }
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative min-h-[600px] w-full overflow-hidden bg-white dark:bg-[#090d16] text-neutral-900 dark:text-neutral-50 transition-colors duration-300 ${className}`}
      style={{
        "--grid-size": `${gridSize}px`,
        "--scroll-duration": `${scrollDuration}s`,
        "--spotlight-radius": `${spotlightRadius}px`,
      }}
    >
      <style>{`
        @keyframes infiniteGridScroll {
          0% { background-position: 0px 0px; }
          100% { background-position: calc(var(--grid-size) * 10) calc(var(--grid-size) * 10); }
        }
        @keyframes floatGlowOrb {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-30px, 35px, 0) scale(1.08); }
          100% { transform: translate3d(25px, -20px, 0) scale(0.96); }
        }
      `}</style>

      {/* 1. Ambient Floating Corner Glow Orbs */}
      <div
        className="pointer-events-none absolute -top-[12vw] -right-[12vw] w-[50vw] h-[50vw] max-w-[650px] max-h-[650px] rounded-full blur-[80px]"
        style={{
          background:
            "radial-gradient(circle, rgba(254, 215, 170, 0.65) 0%, rgba(251, 146, 60, 0.28) 45%, transparent 70%)",
          animation: "floatGlowOrb 14s ease-in-out infinite alternate",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-[12vw] -left-[12vw] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full blur-[80px]"
        style={{
          background:
            "radial-gradient(circle, rgba(219, 234, 254, 0.75) 0%, rgba(96, 165, 250, 0.3) 45%, transparent 70%)",
          animation: "floatGlowOrb 14s ease-in-out infinite alternate",
          animationDelay: "-7s",
        }}
      />

      {/* 2. Base Grid Layer (Subtle Continuous Diagonal Scroll) */}
      <div
        className="pointer-events-none absolute -inset-[100px] will-change-[background-position]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "var(--grid-size) var(--grid-size)",
          animation: "infiniteGridScroll var(--scroll-duration) linear infinite",
        }}
      />

      {/* 3. Active Grid Layer (High-Contrast Revealed by Spotlight) */}
      <div
        className="pointer-events-none absolute -inset-[100px] will-change-[background-position,mask-image] transition-opacity duration-300"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.35) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.35) 1px, transparent 1px)
          `,
          backgroundSize: "var(--grid-size) var(--grid-size)",
          animation: "infiniteGridScroll var(--scroll-duration) linear infinite",
          WebkitMaskImage:
            "radial-gradient(var(--spotlight-radius) circle at var(--grid-mouse-x, 50%) var(--grid-mouse-y, 50%), black 0%, rgba(0,0,0,0.4) 45%, transparent 80%)",
          maskImage:
            "radial-gradient(var(--spotlight-radius) circle at var(--grid-mouse-x, 50%) var(--grid-mouse-y, 50%), black 0%, rgba(0,0,0,0.4) 45%, transparent 80%)",
          opacity,
        }}
      />

      {/* 4. Children / Hero Slot */}
      <div className="relative z-10 flex min-h-full w-full flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export default TheInfiniteGrid;
