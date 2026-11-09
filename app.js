(() => {
  "use strict";

  const display = document.getElementById("clock");
  const SECOND = 1000;
  const MINUTE = 60 * SECOND;

  let mode = "stopwatch";
  let running = false;
  let elapsed = 0;
  let remaining = 5 * MINUTE;
  let startedAt = 0;
  let intervalId = null;

  const pad = (value) => String(value).padStart(2, "0");

  function format(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / SECOND));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  function currentValue() {
    if (!running) return mode === "stopwatch" ? elapsed : remaining;
    const delta = Date.now() - startedAt;
    return mode === "stopwatch"
      ? elapsed + delta
      : Math.max(0, remaining - delta);
  }

  function render() {
    const value = currentValue();
    display.value = format(value);
    display.textContent = format(value);
    display.classList.toggle("finished", mode === "countdown" && value <= 0);
    if (running && mode === "countdown" && value <= 0) {
      remaining = 0;
      running = false;
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function start() {
    if (running) return;
    if (mode === "countdown" && remaining <= 0) return;
    startedAt = Date.now();
    running = true;
    intervalId = window.setInterval(render, 100);
    render();
  }

  function pause() {
    if (!running) return;
    const value = currentValue();
    if (mode === "stopwatch") elapsed = value;
    else remaining = value;
    running = false;
    clearInterval(intervalId);
    intervalId = null;
    render();
  }

  function reset() {
    pause();
    if (mode === "stopwatch") elapsed = 0;
    else remaining = 5 * MINUTE;
    render();
  }

  function changeMode() {
    pause();
    mode = mode === "stopwatch" ? "countdown" : "stopwatch";
    elapsed = 0;
    remaining = 5 * MINUTE;
    render();
  }

  function adjustCountdown(amount) {
    if (mode !== "countdown") return;
    const wasRunning = running;
    pause();
    remaining = Math.max(0, Math.min(99 * 60 * MINUTE, remaining + amount));
    render();
    if (wasRunning && remaining > 0) start();
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch (_) {
      // Fullscreen may be unavailable in embedded or restricted browser contexts.
    }
  }

  document.addEventListener("keydown", (event) => {
    if (event.repeat) return;

    switch (event.key.toLowerCase()) {
      case " ":
        event.preventDefault();
        running ? pause() : start();
        break;
      case "r":
        reset();
        break;
      case "s":
        changeMode();
        break;
      case "f":
        toggleFullscreen();
        break;
      case "arrowup":
        event.preventDefault();
        adjustCountdown(MINUTE);
        break;
      case "arrowdown":
        event.preventDefault();
        adjustCountdown(-MINUTE);
        break;
      case "arrowright":
        event.preventDefault();
        adjustCountdown(10 * SECOND);
        break;
      case "arrowleft":
        event.preventDefault();
        adjustCountdown(-10 * SECOND);
        break;
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) render();
  });

  render();
})();