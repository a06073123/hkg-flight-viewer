/**
 * Unified Flight Search Component
 *
 * A versatile search component that supports two modes:
 * - Navigation mode: Navigate to flight history page on selection
 * - Filter mode: Filter current list based on input (callback with value)
 *
 * Uses Ark UI Combobox with HKIA styling.
 *
 * Features:
 * - Case-insensitive search (uo192 = UO192 = UO 192)
 * - Regex validation for flight number format
 * - Search suggestions when options provided
 * - Result count display in filter mode
 */

import { Combobox, useListCollection } from "@ark-ui/solid/combobox";
import { useNavigate } from "@solidjs/router";
import { Check, Plane, Search, X } from "lucide-solid";
import { createMemo, createSignal, For, Show } from "solid-js";
import { Portal } from "solid-js/web";

export interface FlightSearchOption {
	/** Display value (e.g., "CX 888") */
	label: string;
	/** URL-friendly value (e.g., "CX888") */
	value: string;
	/** Airline name for display */
	airline?: string;
}

export interface FlightSearchProps {
	/** Search mode: "navigate" goes to flight page, "filter" calls onFilter */
	mode: "navigate" | "filter";
	/** Available flight options for autocomplete */
	options?: FlightSearchOption[];
	/** Placeholder text */
	placeholder?: string;
	/** Additional class for the root element */
	class?: string;
	/** Current filter value (filter mode only) */
	value?: string;
	/** Callback when filter value changes (filter mode only) */
	onFilter?: (value: string) => void;
	/** Number of results (filter mode only) */
	resultCount?: number;
}

/**
 * Normalize flight number by removing spaces and converting to uppercase
 */
export function normalizeFlightNumber(input: string): string {
	return input.replace(/\s+/g, "").toUpperCase();
}

/**
 * Partial flight number regex for filtering
 * Matches: CX, CX8, 888, UO1, etc.
 */
const PARTIAL_FLIGHT_REGEX = /^([A-Za-z]{0,3}\s*\d{0,4}|\d{1,4})$/;

/**
 * Check if input could be a partial flight number
 */
function isPartialFlightNumber(input: string): boolean {
	return PARTIAL_FLIGHT_REGEX.test(input.trim());
}

/**
 * Filter function that matches flight numbers ignoring spaces and case
 */
function matchFlightNumber(option: FlightSearchOption, query: string): boolean {
	if (!query.trim()) return true;

	const normalizedQuery = normalizeFlightNumber(query);
	const normalizedValue = normalizeFlightNumber(option.value);
	const normalizedLabel = normalizeFlightNumber(option.label);

	return (
		normalizedValue.includes(normalizedQuery) ||
		normalizedLabel.includes(normalizedQuery)
	);
}

export function FlightSearch(props: FlightSearchProps) {
	const navigate = useNavigate();
	const [inputValue, setInputValue] = createSignal(props.value ?? "");

	// Filter options based on input
	const filteredOptions = createMemo(() => {
		const query = inputValue();
		if (!query.trim()) return props.options ?? [];
		return (props.options ?? []).filter((opt) =>
			matchFlightNumber(opt, query),
		);
	});

	// Create collection for Combobox
	const { collection, filter } = useListCollection({
		initialItems: props.options ?? [],
		itemToString: (item: FlightSearchOption) => item.label,
		itemToValue: (item: FlightSearchOption) => item.value,
	});

	// Check if search is valid (for navigation mode)
	const isValid = createMemo(() => {
		if (props.mode === "filter") return true; // Always valid in filter mode
		const value = inputValue().trim();
		if (!value) return true;
		return isPartialFlightNumber(value);
	});

	// Handle input change with filtering
	const handleInputChange = (details: { inputValue: string }) => {
		setInputValue(details.inputValue);

		// In filter mode, call the onFilter callback
		if (props.mode === "filter" && props.onFilter) {
			props.onFilter(details.inputValue);
		}

		// Filter collection based on input value (space-insensitive)
		const normalizedQuery = normalizeFlightNumber(details.inputValue);
		filter(normalizedQuery);
	};

	// Handle selection (navigation mode)
	const handleValueChange = (details: { value: string[] }) => {
		if (props.mode === "navigate" && details.value.length > 0) {
			const selectedValue = details.value[0];
			navigate(`/flight/${selectedValue}`);
		}
	};

	// Handle clear
	const handleClear = () => {
		setInputValue("");
		if (props.mode === "filter" && props.onFilter) {
			props.onFilter("");
		}
	};

	return (
		<div class={`flex items-center gap-3 ${props.class ?? ""}`}>
			<Combobox.Root
				collection={collection()}
				inputValue={inputValue()}
				onInputValueChange={handleInputChange}
				onValueChange={handleValueChange}
				openOnClick={props.mode === "navigate"}
				class="flex-1"
			>
				<Combobox.Label class="sr-only">Search Flights</Combobox.Label>
				<Combobox.Control class="relative flex items-center">
					{/* Search Icon */}
					<div class="pointer-events-none absolute left-3 flex items-center">
						<Search class="h-5 w-5 text-gray-400" />
					</div>

					{/* Input */}
					<Combobox.Input
						placeholder={
							props.placeholder ??
							(props.mode === "navigate"
								? "Enter flight number (e.g., CX888)"
								: "Search by flight number, destination, or airline...")
						}
						class={`block w-full rounded-lg border bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 ${
							!isValid()
								? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
								: "border-gray-300 focus:border-[#003580] focus:ring-[#003580]/20"
						}`}
					/>

					{/* Clear Button */}
					<Show when={inputValue()}>
						<Combobox.ClearTrigger
							class="absolute right-3 flex items-center text-gray-400 hover:text-gray-600"
							onClick={handleClear}
						>
							<X class="h-4 w-4" />
						</Combobox.ClearTrigger>
					</Show>
				</Combobox.Control>

				{/* Error Message (navigation mode only) */}
				<Show when={!isValid() && inputValue().trim()}>
					<p class="mt-1 text-sm text-red-500">
						Please enter a valid flight number (e.g., CX888, UO 192)
					</p>
				</Show>

				{/* Dropdown (only for navigation mode with options) */}
				<Show when={props.mode === "navigate" && props.options?.length}>
					<Portal>
						<Combobox.Positioner>
							<Combobox.Content class="z-50 max-h-60 w-(--reference-width) overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
								<Show
									when={filteredOptions().length > 0}
									fallback={
										<div class="px-4 py-3 text-sm text-gray-500">
											<Show
												when={inputValue().trim()}
												fallback="Start typing to search flights"
											>
												No matching flights found
											</Show>
										</div>
									}
								>
									<Combobox.ItemGroup>
										<Combobox.ItemGroupLabel class="sticky top-0 bg-gray-50 px-3 py-2 text-xs font-medium uppercase text-gray-500">
											Matching Flights (
											{filteredOptions().length})
										</Combobox.ItemGroupLabel>
										<For each={collection().items}>
											{(item) => (
												<Combobox.Item
													item={item}
													class="flex cursor-pointer items-center justify-between px-3 py-2 hover:bg-[#003580]/5 data-highlighted:bg-[#003580]/10"
												>
													<div class="flex items-center gap-2">
														<Plane class="h-4 w-4 text-[#003580]" />
														<Combobox.ItemText class="font-medium">
															{item.label}
														</Combobox.ItemText>
														<Show
															when={item.airline}
														>
															<span class="text-sm text-gray-500">
																{item.airline}
															</span>
														</Show>
													</div>
													<Combobox.ItemIndicator>
														<Check class="h-4 w-4 text-[#003580]" />
													</Combobox.ItemIndicator>
												</Combobox.Item>
											)}
										</For>
									</Combobox.ItemGroup>
								</Show>
							</Combobox.Content>
						</Combobox.Positioner>
					</Portal>
				</Show>
			</Combobox.Root>

			{/* Result Count (filter mode only) */}
			<Show
				when={
					props.mode === "filter" && props.resultCount !== undefined
				}
			>
				<div class="w-20 shrink-0 text-right">
					<span class="whitespace-nowrap rounded-full bg-[#003580]/10 px-2.5 py-1 text-xs font-medium text-[#003580]">
						{props.resultCount} found
					</span>
				</div>
			</Show>
		</div>
	);
}
