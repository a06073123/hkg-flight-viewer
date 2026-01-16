/**
 * Cargo Flight Card Component
 *
 * Displays cargo flight information in a HKIA-inspired card format
 * Layout: [Stand] | [Flight Number + Codeshare + Cargo Badge] | [Origin/Dest] | [Time + Status]
 */

import {
	CargoBottomBar,
	DestinationBlock,
	FlightCardLayout,
	FlightNumberBlock,
	FlightTimeStatus,
	StandPanel,
} from "@/components/flights/shared";
import type { FlightRecord } from "@/types/flight";

export interface CargoFlightCardProps {
	flight: FlightRecord;
}

export function CargoFlightCard(props: CargoFlightCardProps) {
	const { flight } = props;
	const isArrival = () => flight.isArrival;

	return (
		<FlightCardLayout
			theme="cargo"
			leftPanel={<StandPanel stand={flight.stand} />}
			bottomBar={
				<CargoBottomBar
					terminal={flight.terminal}
					gate={flight.gate}
					belt={flight.baggageClaim}
					isArrival={isArrival()}
				/>
			}
		>
			{/* Left: Flight Number + Codeshare + Cargo Badge */}
			<FlightNumberBlock
				operatingCarrier={flight.operatingCarrier}
				flights={flight.flights}
				codeshareCount={flight.codeshareCount}
				theme="cargo"
				isArrival={isArrival()}
				isCargo={true}
			/>

			{/* Center: Origin/Destination */}
			<DestinationBlock
				airportCode={flight.primaryAirport}
				route={flight.route}
				hasViaStops={flight.hasViaStops}
				theme="cargo"
				isArrival={isArrival()}
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
