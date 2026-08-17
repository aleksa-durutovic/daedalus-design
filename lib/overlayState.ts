/**
 * overlayState — a tiny module-level registry of open overlays.
 *
 * Nav binds a global Esc handler that jumps back to the top of the page.
 * Without a shared signal, pressing Esc to close a dialog would ALSO fire
 * that handler and scroll the visitor to the hero. Overlays register while
 * they are open; Nav skips its handler whenever the count is non-zero.
 *
 * The count is released in a React effect cleanup — i.e. after the current
 * keydown dispatch has finished — so the flag is still set when Nav's
 * listener runs on the very keypress that closed the overlay, regardless
 * of listener registration order.
 */

let openCount = 0;

export function pushOverlay(): void {
  openCount += 1;
}

export function popOverlay(): void {
  openCount = Math.max(0, openCount - 1);
}

export function isOverlayOpen(): boolean {
  return openCount > 0;
}
