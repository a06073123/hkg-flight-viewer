/**
 * FlightCardSkeleton - Loading Skeleton for Flight Cards
 *
 * Displays a placeholder while flight data is loading.
 * Matches the layout structure of actual flight cards.
 */

export function FlightCardSkeleton() {
	return (
		<div class="animate-pulse overflow-hidden rounded-xl bg-white shadow-md">
			<div class="flex">
				{/* Left side panel skeleton */}
				<div class="w-32 shrink-0 bg-gray-200 p-4">
					<div class="mx-auto h-10 w-16 rounded bg-gray-300" />
					<div class="mx-auto mt-1 h-3 w-10 rounded bg-gray-300" />
				</div>
				{/* Content area skeleton */}
				<div class="flex flex-1 gap-4 p-5">
					{/* Flight info block */}
					<div class="flex w-48 shrink-0 flex-col">
						<div class="h-7 w-24 rounded bg-gray-200" />
						<div class="mt-1 h-4 w-32 rounded bg-gray-200" />
						<div class="mt-4 h-8 w-16 rounded bg-gray-200" />
						<div class="mt-1 h-4 w-28 rounded bg-gray-200" />
					</div>
					{/* Codeshare area */}
					<div class="w-32 shrink-0 space-y-1">
						<div class="h-3 w-16 rounded bg-gray-200" />
						<div class="h-3 w-14 rounded bg-gray-200" />
					</div>
					{/* Time area - right aligned */}
					<div class="ml-auto flex w-44 flex-col items-end">
						<div class="h-3 w-16 rounded bg-gray-200" />
						<div class="mt-1 h-10 w-24 rounded bg-gray-200" />
						<div class="mt-2 h-6 w-20 rounded bg-gray-200" />
					</div>
				</div>
			</div>
			{/* Bottom bar skeleton */}
			<div class="flex gap-6 border-t border-gray-100 bg-gray-50/50 px-5 py-3">
				<div class="h-5 w-24 rounded bg-gray-200" />
				<div class="h-5 w-28 rounded bg-gray-200" />
			</div>
		</div>
	);
}
