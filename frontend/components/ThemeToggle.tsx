"use client";
import { useTheme } from "./ThemeProvider";
import { SunIcon, MoonIcon } from "./Icons";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900
                 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white
                 transition-colors"
    >
      {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
    </button>
  );
}