export type ToastLevel = "error" | "success" | "info";

type Handler = (msg: string, level: ToastLevel) => void;

let handler: Handler | null = null;

export function registerToastHandler(h: Handler) {
  handler = h;
}

export function toast(msg: string, level: ToastLevel = "info") {
  handler?.(msg, level);
}
