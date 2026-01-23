/**
 * Shared Breakpoint Hook
 *
 * Deduplicates resize event listeners across components.
 * Only one global listener is registered regardless of how many
 * components use this hook.
 *
 * @see https://vercel.com/blog/how-we-optimized-package-imports-in-next-js
 */

import { createSignal, onCleanup, onMount } from "solid-js";

// ============================================================================
// BREAKPOINT CONSTANTS
// ============================================================================

export const Breakpoints = {
	xs: 480,
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280,
	"2xl": 1536,
} as const;

export type BreakpointKey = keyof typeof Breakpoints;

// ============================================================================
// SHARED STATE (Module-level singleton)
// ============================================================================

/** Number of active listeners - used for cleanup */
let listenerCount = 0;

/** Shared signal for XL breakpoint (1280px+) */
const [isXL, setIsXL] = createSignal(
	typeof window !== "undefined" ? window.innerWidth >= Breakpoints.xl : false
);

/** Shared signal for MD breakpoint (768px+) */
const [isMD, setIsMD] = createSignal(
	typeof window !== "undefined" ? window.innerWidth >= Breakpoints.md : false
);

/** Shared signal for SM breakpoint (640px+) */
const [isSM, setIsSM] = createSignal(
	typeof window !== "undefined" ? window.innerWidth >= Breakpoints.sm : false
);

/** Update all breakpoint signals */
function updateBreakpoints() {
	const width = window.innerWidth;
	setIsXL(width >= Breakpoints.xl);
	setIsMD(width >= Breakpoints.md);
	setIsSM(width >= Breakpoints.sm);
}

/** Throttled resize handler */
let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
function throttledUpdate() {
	if (resizeTimeout) return;
	resizeTimeout = setTimeout(() => {
		updateBreakpoints();
		resizeTimeout = null;
	}, 100); // 100ms throttle
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to track if viewport is XL or larger (1280px+)
 * Used for 2-column layouts in VirtualFlightCardList
 *
 * @returns Accessor<boolean> - true if viewport >= 1280px
 */
export function useIsXL() {
	onMount(() => {
		if (listenerCount === 0) {
			updateBreakpoints();
			window.addEventListener("resize", throttledUpdate);
		}
		listenerCount++;

		onCleanup(() => {
			listenerCount--;
			if (listenerCount === 0) {
				window.removeEventListener("resize", throttledUpdate);
				if (resizeTimeout) {
					clearTimeout(resizeTimeout);
					resizeTimeout = null;
				}
			}
		});
	});

	return isXL;
}

/**
 * Hook to track if viewport is MD or larger (768px+)
 * Used for tablet layouts
 *
 * @returns Accessor<boolean> - true if viewport >= 768px
 */
export function useIsMD() {
	onMount(() => {
		if (listenerCount === 0) {
			updateBreakpoints();
			window.addEventListener("resize", throttledUpdate);
		}
		listenerCount++;

		onCleanup(() => {
			listenerCount--;
			if (listenerCount === 0) {
				window.removeEventListener("resize", throttledUpdate);
				if (resizeTimeout) {
					clearTimeout(resizeTimeout);
					resizeTimeout = null;
				}
			}
		});
	});

	return isMD;
}

/**
 * Hook to track if viewport is SM or larger (640px+)
 * Used for mobile/tablet breakpoint
 *
 * @returns Accessor<boolean> - true if viewport >= 640px
 */
export function useIsSM() {
	onMount(() => {
		if (listenerCount === 0) {
			updateBreakpoints();
			window.addEventListener("resize", throttledUpdate);
		}
		listenerCount++;

		onCleanup(() => {
			listenerCount--;
			if (listenerCount === 0) {
				window.removeEventListener("resize", throttledUpdate);
				if (resizeTimeout) {
					clearTimeout(resizeTimeout);
					resizeTimeout = null;
				}
			}
		});
	});

	return isSM;
}
