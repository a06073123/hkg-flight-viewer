/**
 * FlightCardLayout - Shared Layout Component
 *
 * Provides consistent card structure for all flight types:
 * - Main content area with left panel + center content
 * - Optional bottom bar for metadata
 *
 * Theme variants:
 * - departure: Blue/yellow HKIA style
 * - arrival: Emerald green
 * - cargo: Orange
 */

import type { JSX, ParentComponent } from "solid-js";
import { Show } from "solid-js";

export type FlightCardTheme = "departure" | "arrival" | "cargo";

export interface FlightCardLayoutProps {
	/** Theme variant */
	theme: FlightCardTheme;
	/** Left panel content (gate/belt/stand) */
	leftPanel: JSX.Element;
	/** Main center content */
	children: JSX.Element;
	/** Optional bottom bar content */
	bottomBar?: JSX.Element;
}

const themeStyles: Record<FlightCardTheme, string> = {
	departure: "bg-[#003580]",
	arrival: "bg-emerald-600",
	cargo: "bg-orange-500",
};

export const FlightCardLayout: ParentComponent<FlightCardLayoutProps> = (
	props,
) => {
	return (
		<div class="flight-row group overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg">
			{/* Main Content Area */}
			<div class="flex">
				{/* Left: Panel Display - Fixed width */}
				<div
					class={`flex w-32 shrink-0 flex-col items-center justify-center p-4 ${themeStyles[props.theme]}`}
				>
					{props.leftPanel}
				</div>

				{/* Center: Flight Info - Fixed layout */}
				<div class="flex min-w-0 flex-1 gap-4 p-5">
					{props.children}
				</div>
			</div>

			{/* Bottom Bar */}
			<Show when={props.bottomBar}>
				<div class="flex items-center gap-6 border-t border-gray-100 bg-gray-50/50 px-5 py-3">
					{props.bottomBar}
				</div>
			</Show>
		</div>
	);
};
