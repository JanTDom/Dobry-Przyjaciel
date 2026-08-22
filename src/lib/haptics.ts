export function triggerHaptic(type: "light" | "medium" | "heavy" | "breath_in" | "breath_out" | "heartbeat") {
  if (typeof window === "undefined" || !("vibrate" in navigator)) return;

  try {
    switch (type) {
      case "light":
        navigator.vibrate(15);
        break;
      case "medium":
        navigator.vibrate(30);
        break;
      case "heavy":
        navigator.vibrate(50);
        break;
      case "heartbeat":
        navigator.vibrate([25, 60, 25]);
        break;
      case "breath_in":
        navigator.vibrate([10, 30, 15, 30, 20]);
        break;
      case "breath_out":
        navigator.vibrate([20, 30, 15, 30, 10]);
        break;
    }
  } catch {
    // Ignored on unsupported devices
  }
}
