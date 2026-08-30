// ==UserScript==
// @name         GitBook Slash Debounce
// @namespace    https://github.com/Discord-Account-Support-Corp/GitBook-PWA
// @version      0.2
// @description  Debounce slash-command firing & block rapid repeats in GitBook editor UI.
// @match        https://app.gitbook.com/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // Debounce window (ms). Adjust up if needed (300 is usually fine).
  const DEBOUNCE_MS = 300;
  let lastSlashTime = 0;

  // Helper: check if active element is an editor block (contenteditable or textarea/input)
  function activeElementIsEditable() {
    const el = document.activeElement;
    if (!el) return false;
    if (el.isContentEditable) return true;
    const tag = (el.tagName || '').toUpperCase();
    return tag === 'INPUT' || tag === 'TEXTAREA';
  }

  // Optional: basic caret-at-start check. Returns true if caret offset === 0.
  function caretIsAtStart() {
    try {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return false;
      const range = sel.getRangeAt(0);
      // if selection is not collapsed, we don't consider it start-only
      if (!sel.isCollapsed) return false;
      return range.startOffset === 0;
    } catch (err) {
      return false;
    }
  }

  // Global capture listener (capture phase to see events before page handlers)
  document.addEventListener('keydown', function (e) {
    // Only handle the slash key
    if (e.key !== '/') return;

    // Ignore IME composition and OS-level repeats (auto-repeat)
    if (e.isComposing || e.repeat) {
      // Block duplicate listeners from seeing it repeatedly
      e.stopImmediatePropagation();
      return;
    }

    // Only act when typing in editable areas
    if (!activeElementIsEditable()) return;

    // Optional: require caret at start of block for slash-command activation
    // If GitBook expects slash anywhere, set requireCaretStart = false.
    const requireCaretStart = true;
    if (requireCaretStart && !caretIsAtStart()) return;

    const now = Date.now();

    if (now - lastSlashTime < DEBOUNCE_MS) {
      // Too fast: block the event from reaching page handlers
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }

    // Allow the first event to go through; record its timestamp
    lastSlashTime = now;

    // Give the page handlers time to run; we still block immediate duplicates by stopImmediatePropagation above when repeat/isComposing true
  }, true); // capture = true
})();
