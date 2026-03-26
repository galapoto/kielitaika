import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 980;

function readIsMobile(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.innerWidth < MOBILE_BREAKPOINT;
}

export function useResponsiveLayout() {
  const [isMobile, setIsMobile] = useState(readIsMobile);

  useEffect(() => {
    function handleResize() {
      setIsMobile(readIsMobile());
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    isMobile,
  };
}
