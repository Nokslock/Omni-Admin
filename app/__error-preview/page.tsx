// Dev-only preview helper — visit /__error-preview to see the 503 error UI.
// Safe to delete.
export default function ErrorPreview() {
  throw new Error("Synthetic error for previewing the 503 UI");
}
