import { useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";

const TopLoader = () => {
  const location = useLocation();
  const previousLocation = useRef(location.pathname);
  const progressRef = useRef<HTMLDivElement>(null);
  const spinnerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const animateProgress = useCallback(() => {
    const progressBar = progressRef.current;
    const spinner = spinnerRef.current;
    const container = containerRef.current;

    if (!progressBar || !container) return;

    // Show container
    container.style.opacity = "1";
    if (spinner) spinner.style.opacity = "1";

    // Animate progress
    progressBar.style.transition = "width 100ms ease-out";
    progressBar.style.width = "30%";

    setTimeout(() => {
      progressBar.style.width = "50%";
    }, 100);

    setTimeout(() => {
      progressBar.style.width = "70%";
    }, 200);

    setTimeout(() => {
      progressBar.style.width = "90%";
    }, 300);

    setTimeout(() => {
      progressBar.style.width = "100%";
      if (spinner) spinner.style.opacity = "0";

      setTimeout(() => {
        container.style.opacity = "0";
        setTimeout(() => {
          progressBar.style.width = "0%";
          progressBar.style.transition = "none";
        }, 200);
      }, 200);
    }, 400);
  }, []);

  useEffect(() => {
    // Check if location actually changed
    if (previousLocation.current === location.pathname) {
      return;
    }

    previousLocation.current = location.pathname;
    animateProgress();
  }, [location.pathname, animateProgress]);

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 right-0 z-9999 h-[3px] opacity-0 transition-opacity duration-200"
      style={{ direction: "ltr" }}
    >
      {/* Progress bar */}
      <div
        ref={progressRef}
        className="h-full"
        style={{
          width: "0%",
          background: "linear-gradient(90deg, #3a4b95, #c4886a)",
          boxShadow: "0 0 10px #3a4b95, 0 0 5px #c4886a",
        }}
      />

      {/* Spinner at the end */}
      <div
        ref={spinnerRef}
        className="absolute top-1.5 right-4 opacity-0 transition-opacity duration-200"
      >
        <div
          className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#3a4b95", borderTopColor: "transparent" }}
        />
      </div>
    </div>
  );
};

export default TopLoader;
