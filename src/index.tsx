/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App.tsx";
import "./index.css";

// Handle GitHub Pages SPA redirect
// When 404.html redirects to index.html, restore the intended path
const spaRedirect = sessionStorage.getItem("spa-redirect");
if (spaRedirect) {
	sessionStorage.removeItem("spa-redirect");
	// Replace the current URL with the intended path (without page reload)
	window.history.replaceState(null, "", spaRedirect);
}

const root = document.getElementById("root");

render(() => <App />, root!);
