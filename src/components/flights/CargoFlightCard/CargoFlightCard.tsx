/**
 * Cargo Flight Card Component
 *
 * Displays cargo flight information in a HKIA-inspired card format
 * Layout: [Stand] | [Flight Number + Codeshare + Cargo Badge] | [Origin/Dest] | [Time + Status]
 * 
 * Mobile-first responsive design:
 * - Stacked layout on mobile
 * - Horizontal layout on tablet+
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
			/>

			{/* Center: Origin/Destination */}
			<DestinationBlock
				airportCode={flight.primaryAirport}
				route={flight.route}
				hasViaStops={flight.hasViaStops}
				theme="cargo"
				isArrival={isArrival()}
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
