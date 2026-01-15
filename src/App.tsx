import { Route, Router } from "@solidjs/router";
import "./App.css";
import { Layout } from "./components/layout";
import {
	FlightHistoryPage,
	GateAnalyticsPage,
	LandingPage,
	LivePage,
	PastPage,
} from "./pages";

function App() {
	return (
		<Router root={Layout}>
			<Route path="/" component={LandingPage} />
			<Route path="/live" component={LivePage} />
			<Route path="/past" component={PastPage} />
			<Route path="/flight/:no" component={FlightHistoryPage} />
			<Route path="/gate/:id" component={GateAnalyticsPage} />
		</Router>
	);
}

export default App;
