export type AppToastTone = "success" | "error" | "info";

export type AppToastPayload = {
  title: string;
  description?: string;
  tone?: AppToastTone;
  durationMs?: number;
};

const EVENT_NAME = "mpg-care-hub:toast";

export function emitAppToast(payload: AppToastPayload) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<AppToastPayload>(EVENT_NAME, {
      detail: payload,
    })
  );
}

export function getAppToastEventName() {
  return EVENT_NAME;
}
