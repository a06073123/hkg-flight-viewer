/**
 * Departure Card Component
 *
 * Displays passenger departure flight information in a HKIA-inspired card format
 * Layout: [Gate] | [Flight Number + Codeshare] | [Destination] | [Time + Status]
 */

import type { FlightRecord } from "../../../types/flight";
import {
	DepartureBottomBar,
	DestinationBlock,
	FlightCardLayout,
	FlightNumberBlock,
	FlightTimeStatus,
	GatePanel,
} from "../shared";

export interface DepartureCardProps {
	flight: FlightRecord;
}

export function DepartureCard(props: DepartureCardProps) {
	const { flight } = props;

	return (
		<FlightCardLayout
			theme="departure"
			leftPanel={<GatePanel gate={flight.gate} />}
			bottomBar={
				<DepartureBottomBar
					terminal={flight.terminal}
					aisle={flight.aisle}
				/>
			}
		>
			{/* Left: Flight Number + Codeshare */}
			<FlightNumberBlock
				operatingCarrier={flight.operatingCarrier}
				flights={flight.flights}
				codeshareCount={flight.codeshareCount}
				theme="departure"
				isArrival={false}
			/>

			{/* Center: Destination */}
			<DestinationBlock
				airportCode={flight.primaryAirport}
				route={flight.route}
				hasViaStops={flight.hasViaStops}
				theme="departure"
				isArrival={false}
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
