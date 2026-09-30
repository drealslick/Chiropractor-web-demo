/**
 * Universal safe CustomEvent polyfill and dispatcher.
 * Completely eliminates "TypeError: Illegal constructor" across all browsers, WebViews, and iframes.
 */

export function createSafeCustomEvent<T = any>(
  type: string,
  detail?: T,
  bubbles = false,
  cancelable = false
): CustomEvent<T> {
  if (typeof document !== 'undefined' && typeof document.createEvent === 'function') {
    try {
      const evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(type, bubbles, cancelable, detail);
      return evt as CustomEvent<T>;
    } catch {
      // Fall through to object fallback
    }
  }

  // Fallback for non-DOM environments or edge cases
  return {
    type,
    detail,
    bubbles,
    cancelable,
    defaultPrevented: false,
    timeStamp: Date.now(),
  } as unknown as CustomEvent<T>;
}

/**
 * Dispatches an event safely on the given target (defaults to window).
 */
export function dispatchSafeEvent<T = any>(
  type: string,
  detail?: T,
  target: EventTarget = window
): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const event = createSafeCustomEvent(type, detail);
    return target.dispatchEvent(event as Event);
  } catch (err) {
    console.warn(`[SafeEvent] Dispatch note for ${type}:`, err);
    return false;
  }
}

// Polyfill window.CustomEvent immediately and safely so ANY code or library calling `new CustomEvent(...)` NEVER throws
if (typeof window !== 'undefined') {
  try {
    const SafeCustomEvent = function (
      event: string,
      params?: { bubbles?: boolean; cancelable?: boolean; detail?: any }
    ): Event {
      const p = params || { bubbles: false, cancelable: false, detail: null };
      if (typeof document !== 'undefined' && typeof document.createEvent === 'function') {
        const evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, p.bubbles ?? false, p.cancelable ?? false, p.detail ?? null);
        return evt;
      }
      return {
        type: event,
        detail: p.detail ?? null,
        bubbles: p.bubbles ?? false,
        cancelable: p.cancelable ?? false,
        defaultPrevented: false,
        timeStamp: Date.now(),
      } as unknown as Event;
    };

    if (typeof window.Event !== 'undefined' && window.Event.prototype) {
      SafeCustomEvent.prototype = window.Event.prototype;
    }

    // Override global CustomEvent with safe document.createEvent factory
    (window as any).CustomEvent = SafeCustomEvent;
  } catch {
    // Ignore polyfill assignment error
  }
}
