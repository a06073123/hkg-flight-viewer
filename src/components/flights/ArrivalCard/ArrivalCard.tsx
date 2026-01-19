/**
 * Arrival Card Component
 *
 * Displays passenger arrival flight information in a HKIA-inspired card format
 * Layout: [Belt] | [Flight Number + Codeshare] | [Origin] | [Time + Status]
 * 
 * Mobile-first responsive design:
 * - Stacked layout on mobile
 * - Horizontal layout on tablet+
 */

import {
	ArrivalBottomBar,
	BeltPanel,
	DestinationBlock,
	FlightCardLayout,
	FlightNumberBlock,
	FlightTimeStatus,
} from "@/components/flights/shared";
import type { FlightRecord } from "@/types/flight";

export interface ArrivalCardProps {
	flight: FlightRecord;
}

export function ArrivalCard(props: ArrivalCardProps) {
	const { flight } = props;

	return (
		<FlightCardLayout
			theme="arrival"
			leftPanel={<BeltPanel belt={flight.baggageClaim} />}
			bottomBar={
				<ArrivalBottomBar
					terminal={flight.terminal}
					hall={flight.hall}
				/>
			}
		>
			{/* Left: Flight Number + Codeshare */}
			<FlightNumberBlock
				operatingCarrier={flight.operatingCarrier}
				flights={flight.flights}
				codeshareCount={flight.codeshareCount}
				theme="arrival"
				isArrival={true}
			/>

			{/* Center: Origin */}
			<DestinationBlock
				airportCode={flight.primaryAirport}
				route={flight.route}
				hasViaStops={flight.hasViaStops}
				theme="arrival"
				isArrival={true}
			/>

			{/* Right: Time + Status - Responsive width */}
			<div class="flex w-full shrink-0 flex-col items-center justify-center xs:w-auto xs:items-end sm:w-36 md:w-44">
				<FlightTimeStatus
					scheduledTime={flight.time}
					status={flight.status}
				/>
			</div>
		</FlightCardLayout>
	);
}
