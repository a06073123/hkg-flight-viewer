import "@testing-library/jest-dom/vitest";

// Global test setup for SolidJS testing
// This file runs before each test file

// Mock matchMedia for components that use media queries
Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: (query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false,
	}),
});

// Mock IntersectionObserver for components that use it
class MockIntersectionObserver {
	observe = () => {};
	unobserve = () => {};
	disconnect = () => {};
	takeRecords = () => [];
}

Object.defineProperty(window, "IntersectionObserver", {
	writable: true,
	value: MockIntersectionObserver,
});

// Mock ResizeObserver for components that use it
class MockResizeObserver {
	observe = () => {};
	unobserve = () => {};
	disconnect = () => {};
}

Object.defineProperty(window, "ResizeObserver", {
	writable: true,
	value: MockResizeObserver,
});
