/**
 * DatePicker Component
 *
 * Custom date picker using Ark UI with HKIA Visual DNA styling.
 * Supports single date selection with min/max date constraints.
 */

import {
	DatePicker as ArkDatePicker,
	parseDate,
} from "@ark-ui/solid/date-picker";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-solid";
import { createMemo, Index } from "solid-js";
import { Portal } from "solid-js/web";

interface DatePickerProps {
	/** Current selected date in YYYY-MM-DD format */
	value: string;
	/** Callback when date changes */
	onChange: (date: string) => void;
	/** Minimum selectable date in YYYY-MM-DD format */
	min?: string;
	/** Maximum selectable date in YYYY-MM-DD format */
	max?: string;
	/** Optional label for the date picker */
	label?: string;
	/** Disabled state */
	disabled?: boolean;
}

export function DatePicker(props: DatePickerProps) {
	// Convert YYYY-MM-DD string to DateValue for Ark UI
	const dateValue = createMemo(() => {
		try {
			return props.value ? [parseDate(props.value)] : [];
		} catch {
			return [];
		}
	});

	// Convert min/max to DateValue
	const minDate = createMemo(() => {
		try {
			return props.min ? parseDate(props.min) : undefined;
		} catch {
			return undefined;
		}
	});

	const maxDate = createMemo(() => {
		try {
			return props.max ? parseDate(props.max) : undefined;
		} catch {
			return undefined;
		}
	});

	const handleValueChange = (details: {
		value: Array<{ year: number; month: number; day: number }>;
	}) => {
		if (details.value.length > 0) {
			const date = details.value[0];
			const formatted = `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
			props.onChange(formatted);
		}
	};

	return (
		<ArkDatePicker.Root
			value={dateValue()}
			onValueChange={handleValueChange}
			min={minDate()}
			max={maxDate()}
			disabled={props.disabled}
			closeOnSelect
			locale="en-HK"
		>
			{props.label && (
				<ArkDatePicker.Label class="sr-only">
					{props.label}
				</ArkDatePicker.Label>
			)}

			<ArkDatePicker.Control class="flex items-center gap-2">
				<ArkDatePicker.Input
					class="w-36 rounded-lg border-2 border-[#003580]/30 bg-white px-3 py-2 text-sm text-[#1A1A1B] placeholder:text-gray-400 focus:border-[#003580] focus:outline-none focus:ring-1 focus:ring-[#003580] disabled:cursor-not-allowed disabled:opacity-50"
					placeholder="Select date"
				/>
				<ArkDatePicker.Trigger class="rounded-lg border-2 border-[#003580]/30 bg-white p-2 text-[#003580] transition-colors hover:border-[#003580] hover:bg-[#003580]/5 focus:outline-none focus:ring-2 focus:ring-[#003580] disabled:cursor-not-allowed disabled:opacity-50">
					<Calendar class="h-4 w-4" />
				</ArkDatePicker.Trigger>
			</ArkDatePicker.Control>

			<Portal>
				<ArkDatePicker.Positioner>
					<ArkDatePicker.Content class="z-50 rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
						<ArkDatePicker.View view="day">
							<ArkDatePicker.Context>
								{(context) => (
									<>
										<ArkDatePicker.ViewControl class="mb-4 flex items-center justify-between">
											<ArkDatePicker.PrevTrigger class="rounded-lg p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-[#003580]">
												<ChevronLeft class="h-5 w-5" />
											</ArkDatePicker.PrevTrigger>
											<ArkDatePicker.ViewTrigger class="rounded-lg px-3 py-1.5 text-sm font-semibold text-[#003580] transition-colors hover:bg-[#003580]/5">
												<ArkDatePicker.RangeText />
											</ArkDatePicker.ViewTrigger>
											<ArkDatePicker.NextTrigger class="rounded-lg p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-[#003580]">
												<ChevronRight class="h-5 w-5" />
											</ArkDatePicker.NextTrigger>
										</ArkDatePicker.ViewControl>

										<ArkDatePicker.Table class="w-full border-collapse">
											<ArkDatePicker.TableHead>
												<ArkDatePicker.TableRow class="flex">
													<Index
														each={
															context().weekDays
														}
													>
														{(weekDay) => (
															<ArkDatePicker.TableHeader class="flex h-9 w-9 items-center justify-center text-xs font-medium text-gray-500">
																{
																	weekDay()
																		.short
																}
															</ArkDatePicker.TableHeader>
														)}
													</Index>
												</ArkDatePicker.TableRow>
											</ArkDatePicker.TableHead>
											<ArkDatePicker.TableBody>
												<Index each={context().weeks}>
													{(week) => (
														<ArkDatePicker.TableRow class="flex">
															<Index
																each={week()}
															>
																{(day) => (
																	<ArkDatePicker.TableCell
																		value={day()}
																		class="p-0.5"
																	>
																		<ArkDatePicker.TableCellTrigger class="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors hover:bg-[#003580]/10 hover:text-[#003580] data-disabled:pointer-events-none data-disabled:text-gray-300 data-outside-range:text-gray-300 data-selected:bg-[#003580] data-selected:text-white data-selected:hover:bg-[#003580]/90 data-today:font-bold data-today:text-[#003580]">
																			{
																				day()
																					.day
																			}
																		</ArkDatePicker.TableCellTrigger>
																	</ArkDatePicker.TableCell>
																)}
															</Index>
														</ArkDatePicker.TableRow>
													)}
												</Index>
											</ArkDatePicker.TableBody>
										</ArkDatePicker.Table>
									</>
								)}
							</ArkDatePicker.Context>
						</ArkDatePicker.View>

						<ArkDatePicker.View view="month">
							<ArkDatePicker.Context>
								{(context) => (
									<>
										<ArkDatePicker.ViewControl class="mb-4 flex items-center justify-between">
											<ArkDatePicker.PrevTrigger class="rounded-lg p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-[#003580]">
												<ChevronLeft class="h-5 w-5" />
											</ArkDatePicker.PrevTrigger>
											<ArkDatePicker.ViewTrigger class="rounded-lg px-3 py-1.5 text-sm font-semibold text-[#003580] transition-colors hover:bg-[#003580]/5">
												<ArkDatePicker.RangeText />
											</ArkDatePicker.ViewTrigger>
											<ArkDatePicker.NextTrigger class="rounded-lg p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-[#003580]">
												<ChevronRight class="h-5 w-5" />
											</ArkDatePicker.NextTrigger>
										</ArkDatePicker.ViewControl>

										<ArkDatePicker.Table class="w-full border-collapse">
											<ArkDatePicker.TableBody>
												<Index
													each={context().getMonthsGrid(
														{
															columns: 4,
															format: "short",
														},
													)}
												>
													{(months) => (
														<ArkDatePicker.TableRow class="flex">
															<Index
																each={months()}
															>
																{(month) => (
																	<ArkDatePicker.TableCell
																		value={
																			month()
																				.value
																		}
																		class="p-1"
																	>
																		<ArkDatePicker.TableCellTrigger class="flex h-10 w-14 items-center justify-center rounded-lg text-sm font-medium transition-colors hover:bg-[#003580]/10 hover:text-[#003580] data-disabled:pointer-events-none data-disabled:text-gray-300 data-selected:bg-[#003580] data-selected:text-white">
																			{
																				month()
																					.label
																			}
																		</ArkDatePicker.TableCellTrigger>
																	</ArkDatePicker.TableCell>
																)}
															</Index>
														</ArkDatePicker.TableRow>
													)}
												</Index>
											</ArkDatePicker.TableBody>
										</ArkDatePicker.Table>
									</>
								)}
							</ArkDatePicker.Context>
						</ArkDatePicker.View>

						<ArkDatePicker.View view="year">
							<ArkDatePicker.Context>
								{(context) => (
									<>
										<ArkDatePicker.ViewControl class="mb-4 flex items-center justify-between">
											<ArkDatePicker.PrevTrigger class="rounded-lg p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-[#003580]">
												<ChevronLeft class="h-5 w-5" />
											</ArkDatePicker.PrevTrigger>
											<ArkDatePicker.ViewTrigger class="rounded-lg px-3 py-1.5 text-sm font-semibold text-[#003580] transition-colors hover:bg-[#003580]/5">
												<ArkDatePicker.RangeText />
											</ArkDatePicker.ViewTrigger>
											<ArkDatePicker.NextTrigger class="rounded-lg p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-[#003580]">
												<ChevronRight class="h-5 w-5" />
											</ArkDatePicker.NextTrigger>
										</ArkDatePicker.ViewControl>

										<ArkDatePicker.Table class="w-full border-collapse">
											<ArkDatePicker.TableBody>
												<Index
													each={context().getYearsGrid(
														{ columns: 4 },
													)}
												>
													{(years) => (
														<ArkDatePicker.TableRow class="flex">
															<Index
																each={years()}
															>
																{(year) => (
																	<ArkDatePicker.TableCell
																		value={
																			year()
																				.value
																		}
																		class="p-1"
																	>
																		<ArkDatePicker.TableCellTrigger class="flex h-10 w-14 items-center justify-center rounded-lg text-sm font-medium transition-colors hover:bg-[#003580]/10 hover:text-[#003580] data-disabled:pointer-events-none data-disabled:text-gray-300 data-selected:bg-[#003580] data-selected:text-white">
																			{
																				year()
																					.label
																			}
																		</ArkDatePicker.TableCellTrigger>
																	</ArkDatePicker.TableCell>
																)}
															</Index>
														</ArkDatePicker.TableRow>
													)}
												</Index>
											</ArkDatePicker.TableBody>
										</ArkDatePicker.Table>
									</>
								)}
							</ArkDatePicker.Context>
						</ArkDatePicker.View>
					</ArkDatePicker.Content>
				</ArkDatePicker.Positioner>
			</Portal>
		</ArkDatePicker.Root>
	);
}
