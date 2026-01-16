/**
 * Search Bar Component
 *
 * Quick filter for flight number, destination, or airline
 * Fixed height to prevent layout shifts
 */

import { Search, X } from "lucide-solid";
import { Show } from "solid-js";

export interface SearchBarProps {
	value: string;
	onInput: (value: string) => void;
	placeholder?: string;
	resultCount?: number;
}

export function SearchBar(props: SearchBarProps) {
	return (
		<div class="flex items-center gap-4">
			{/* Search Input - Fixed width */}
			<div class="relative flex-1">
				<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
					<Search class="h-5 w-5 text-gray-400" />
				</div>
				<input
					type="text"
					value={props.value}
					onInput={(e) => props.onInput(e.currentTarget.value)}
					placeholder={props.placeholder ?? "Search flights..."}
					class="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-500 focus:border-[#003580] focus:outline-none focus:ring-1 focus:ring-[#003580]"
				/>
				<Show when={props.value}>
					<button
						type="button"
						onClick={() => props.onInput("")}
						class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
					>
						<X class="h-5 w-5" />
					</button>
				</Show>
			</div>

			{/* Result Count - Fixed width container to prevent layout shift */}
			<div class="w-25 text-right">
				<Show when={props.resultCount !== undefined}>
					<span class="whitespace-nowrap rounded-full bg-[#003580]/10 px-2.5 py-1 text-xs font-medium text-[#003580]">
						{props.resultCount} found
					</span>
				</Show>
			</div>
		</div>
	);
}
