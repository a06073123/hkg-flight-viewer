/**
 * Test utilities for SolidJS component testing
 *
 * Re-exports testing library utilities with custom configuration
 */

import { render, type RenderResult } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import type { JSX } from "solid-js";

/**
 * Custom render function with user event setup
 */
export function renderWithUser(
	ui: () => JSX.Element,
): RenderResult & { user: ReturnType<typeof userEvent.setup> } {
	const user = userEvent.setup();
	const result = render(ui);
	return { ...result, user };
}

/**
 * Wait helper for async operations
 */
export async function waitFor(
	callback: () => boolean | void,
	timeout = 1000,
): Promise<void> {
	const startTime = Date.now();
	while (Date.now() - startTime < timeout) {
		try {
			const result = callback();
			if (result !== false) return;
		} catch {
			// Continue waiting
		}
		await new Promise((resolve) => setTimeout(resolve, 50));
	}
	throw new Error(`waitFor timed out after ${timeout}ms`);
}

// Re-export common testing utilities
export { render } from "@solidjs/testing-library";
export { default as userEvent } from "@testing-library/user-event";
