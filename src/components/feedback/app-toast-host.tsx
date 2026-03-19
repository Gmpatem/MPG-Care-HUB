"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  getAppToastEventName,
  type AppToastPayload,
  type AppToastTone,
} from "@/lib/ui/app-toast";

type ToastItem = AppToastPayload & {
  id: string;
};

const toneStyles: Record<AppToastTone, string> = {
  success:
    "border-emerald-200 bg-white text-emerald-700 shadow-[0_16px_35px_rgba(16,185,129,0.12)] dark:border-emerald-900 dark:bg-[#0f172a] dark:text-emerald-300",
  error:
    "border-red-200 bg-white text-red-700 shadow-[0_16px_35px_rgba(239,68,68,0.12)] dark:border-red-900 dark:bg-[#0f172a] dark:text-red-300",
  info:
    "border-border bg-white text-foreground shadow-[0_16px_35px_rgba(15,23,42,0.10)] dark:bg-[#0f172a]",
};

const toneIcons: Record<AppToastTone, typeof AlertCircle> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export function AppToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);

  const eventName = useMemo(() => getAppToastEventName(), []);

  useEffect(() => {
    function handleToast(event: Event) {
      const customEvent = event as CustomEvent<AppToastPayload>;
      const payload = customEvent.detail;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      const nextItem: ToastItem = {
        id,
        title: payload.title,
        description: payload.description,
        tone: payload.tone ?? "info",
        durationMs: payload.durationMs ?? 3200,
      };

      setItems((current) => [...current, nextItem]);

      window.setTimeout(() => {
        setItems((current) => current.filter((item) => item.id !== id));
      }, nextItem.durationMs);
    }

    window.addEventListener(eventName, handleToast as EventListener);
    return () => {
      window.removeEventListener(eventName, handleToast as EventListener);
    };
  }, [eventName]);

  function dismiss(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex justify-center px-4">
      <div className="flex w-full max-w-md flex-col gap-3">
        {items.map((item) => {
          const tone = item.tone ?? "info";
          const Icon = toneIcons[tone];

          return (
            <div
              key={item.id}
              className={cn(
                "pointer-events-auto rounded-2xl border p-4 backdrop-blur transition-all",
                toneStyles[tone]
              )}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{item.title}</p>
                  {item.description ? (
                    <p className="mt-1 text-sm leading-6 opacity-85">
                      {item.description}
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => dismiss(item.id)}
                  className="shrink-0 rounded-md p-1 opacity-70 transition hover:opacity-100"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
