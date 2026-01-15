/**
 * Search Bar Component
 *
 * Quick filter for flight number, destination, or airline
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
		<div class="relative">
			<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
				<Search class="h-5 w-5 text-gray-400" />
			</div>
			<input
				type="text"
				value={props.value}
				onInput={(e) => props.onInput(e.currentTarget.value)}
				placeholder={props.placeholder ?? "Search flights..."}
				class="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
			<Show when={props.resultCount !== undefined}>
				<div class="mt-1 text-xs text-gray-500">
					{props.resultCount} flight
					{props.resultCount !== 1 ? "s" : ""} found
				</div>
			</Show>
		</div>
	);
}
