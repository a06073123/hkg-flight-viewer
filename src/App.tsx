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
	PastPage,
} from "./pages";

function App() {
	// Pre-load airport and airline data for sync functions
	onMount(() => {
		initAirportData();
		initAirlineData();
	});

	return (
		<Router root={Layout}>
			<Route path="/" component={LandingPage} />
			<Route path="/live" component={LivePage} />
			<Route path="/past/:date?" component={PastPage} />
			<Route path="/flight/:no" component={FlightHistoryPage} />
			<Route path="/gate/:id" component={GateAnalyticsPage} />
		</Router>
	);
}

export default App;
