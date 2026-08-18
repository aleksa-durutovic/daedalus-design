/**
 * overlayState — a module-level stack of the overlays currently on screen,
 * newest last, each paired with the callback that closes it.
 *
 * Two consumers depend on it:
 *  - Nav binds a global Esc handler that jumps to the top of the page. It
 *    skips that handler while any overlay is open, so pressing Esc to close
 *    a dialog does not ALSO scroll the visitor to the hero.
 *  - SiteHistory turns a browser Back press into "close the top overlay"
 *    instead of leaving the site, via closeTopOverlay().
 *
 * An overlay registers with pushOverlay(close) and gets back an unregister
 * function to call from its effect cleanup. Using the returned function (not
 * a bare popOverlay) means cleanup removes exactly the entry it added, with
 * no reliance on call order or argument identity.
 */

interface Overlay {
  close: () => void;
}

const stack: Overlay[] = [];

/** Register an open overlay. Returns its unregister function. */
export function pushOverlay(close: () => void): () => void {
  const entry: Overlay = { close };
  stack.push(entry);
  return () => {
    const i = stack.indexOf(entry);
    if (i !== -1) stack.splice(i, 1);
  };
}

export function isOverlayOpen(): boolean {
  return stack.length > 0;
}

/**
 * Close the most recently opened overlay. Returns true if one was closed.
 * The overlay's own effect cleanup removes it from the stack, so we do not
 * pop here — we only invoke its closer.
 */
export function closeTopOverlay(): boolean {
  const top = stack[stack.length - 1];
  if (!top) return false;
  top.close();
  return true;
}
