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
 * 
 * Mobile-first responsive design:
 * - Stacked layout on mobile (top panel + vertical content)
 * - Horizontal layout on tablet+ (side panel + horizontal content)
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
			{/* Main Content Area - Stacked on mobile, horizontal on tablet+ */}
			<div class="flex flex-col sm:flex-row">
				{/* Left/Top: Panel Display - Full width top bar on mobile, side panel on tablet+ */}
				<div
					class={`flex shrink-0 items-center justify-center px-4 py-2 sm:w-24 sm:flex-col sm:p-4 md:w-28 ${themeStyles[props.theme]}`}
				>
					{props.leftPanel}
				</div>

				{/* Center: Flight Info - Responsive layout */}
				<div class="flex min-w-0 flex-1 flex-col gap-3 p-3 xs:flex-row xs:flex-wrap xs:items-center xs:gap-2 sm:gap-4 sm:p-4">
					{props.children}
				</div>
			</div>

			{/* Bottom Bar - Scrollable on mobile */}
			<Show when={props.bottomBar}>
				<div class="flex items-center gap-3 overflow-x-auto border-t border-gray-100 bg-gray-50/50 px-3 py-2 text-sm sm:gap-6 sm:px-5 sm:py-3">
					{props.bottomBar}
				</div>
			</Show>
		</div>
	);
};
