import { Route, Router } from "@solidjs/router";
import { onMount } from "solid-js";
import "./App.css";
import { Layout } from "./components/layout";
import { initAirlineData } from "./lib/airline-data";
import { initAirportData } from "./lib/airport-data";
import {
    FlightHistoryPage,
    GateAnalyticsPage,
    LandingPage,
    LivePage,
    MapPage,
    PastPage,
} from "./pages";

function App() {
	// Pre-load airport and airline data in parallel for sync functions
	onMount(() => {
		Promise.all([initAirportData(), initAirlineData()]);
	});

	return (
		<Router base="/hkg-flight-viewer" root={Layout}>
			<Route path="/" component={LandingPage} />
			<Route path="/live" component={LivePage} />
			<Route path="/map" component={MapPage} />
			<Route path="/past/:date?" component={PastPage} />
			<Route path="/flight/:no" component={FlightHistoryPage} />
			<Route path="/gate/:id" component={GateAnalyticsPage} />
		</Router>
	);
}

export default App;
