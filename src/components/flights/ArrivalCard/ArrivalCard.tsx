/**
 * Arrival Card Component
 *
 * Displays passenger arrival flight information in a HKIA-inspired card format
 * Layout: [Belt] | [Flight Number + Codeshare] | [Origin] | [Time + Status]
 */

import type { FlightRecord } from "../../../types/flight";
import {
	ArrivalBottomBar,
	BeltPanel,
	DestinationBlock,
	FlightCardLayout,
	FlightNumberBlock,
	FlightTimeStatus,
} from "../shared";

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

			{/* Right: Time + Status */}
			<div class="flex w-44 shrink-0 flex-col items-end justify-center">
				<FlightTimeStatus
					scheduledTime={flight.time}
					status={flight.status}
				/>
			</div>
		</FlightCardLayout>
	);
}
