"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function RouteFeedbackBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const [width, setWidth] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a") as HTMLAnchorElement | null;

      if (!anchor) return;
      if (!anchor.href) return;
      if (anchor.target === "_blank") return;
      if (anchor.hasAttribute("download")) return;

      const currentUrl = new URL(window.location.href);
      const nextUrl = new URL(anchor.href, window.location.href);

      const isSameOrigin = nextUrl.origin === currentUrl.origin;
      const isInternalRoute = isSameOrigin && nextUrl.pathname !== currentUrl.pathname || nextUrl.search !== currentUrl.search;

      if (!isInternalRoute) return;

      setActive(true);
      setWidth(18);

      if (timerRef.current) window.clearTimeout(timerRef.current);

      timerRef.current = window.setTimeout(() => {
        setWidth(62);
      }, 90);

      window.setTimeout(() => {
        setWidth(82);
      }, 240);
    }

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!active) return;

    setWidth(100);

    const doneTimer = window.setTimeout(() => {
      setActive(false);
      setWidth(0);
    }, 180);

    return () => window.clearTimeout(doneTimer);
  }, [pathname, searchParams, active]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[110] h-[3px]">
      <div
        className="h-full bg-[linear-gradient(90deg,rgba(14,122,145,1),rgba(42,179,204,1))] transition-[width,opacity] duration-200 ease-out"
        style={{
          width: `${width}%`,
          opacity: active ? 1 : 0,
        }}
      />
    </div>
  );
}
