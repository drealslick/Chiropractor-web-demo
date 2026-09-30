/**
 * Universal safe CustomEvent polyfill and dispatcher.
 * Fixes "TypeError: Illegal constructor" in Android WebView, older WebKit, and iframe contexts.
 */

// Install global polyfill immediately upon module evaluation
if (typeof window !== 'undefined') {
  try {
    const testEvt = new window.CustomEvent('__polyfill_test__', { cancelable: true });
    if (testEvt.cancelable !== true) {
      throw new Error('Broken CustomEvent');
    }
  } catch {
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
    // Override global CustomEvent with safe constructor
    (window as any).CustomEvent = SafeCustomEvent;
  }
}

/**
 * Creates a CustomEvent safely without throwing "TypeError: Illegal constructor".
 */
export function createSafeCustomEvent<T = any>(
  type: string,
  detail?: T,
  bubbles = false,
  cancelable = false
): CustomEvent<T> {
  try {
    if (typeof window !== 'undefined' && typeof window.CustomEvent === 'function') {
      return new window.CustomEvent<T>(type, { detail, bubbles, cancelable });
    }
  } catch {
    // Fall back to document.createEvent
  }

  if (typeof document !== 'undefined' && typeof document.createEvent === 'function') {
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(type, bubbles, cancelable, detail);
    return evt as CustomEvent<T>;
  }

  return {
    type,
    detail,
    bubbles,
    cancelable,
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
    return target.dispatchEvent(event);
  } catch (err) {
    console.warn(`[SafeEvent] Dispatch failed for ${type}:`, err);
    return false;
  }
}
