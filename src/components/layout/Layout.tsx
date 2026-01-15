/**
 * Layout Component
 *
 * Provides consistent navigation and page structure
 */

import { A } from "@solidjs/router";
import { History, Home, Plane, Radio } from "lucide-solid";
import type { ParentComponent } from "solid-js";

export const Layout: ParentComponent = (props) => {
	return (
		<div class="min-h-screen bg-gray-50">
			{/* Navigation Header */}
			<header class="sticky top-0 z-50 border-b bg-white shadow-sm">
				<nav class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
					{/* Logo */}
					<A
						href="/"
						class="flex items-center gap-2 text-xl font-bold text-gray-900"
					>
						<Plane class="h-6 w-6 text-blue-600" />
						<span>HKG Flights</span>
					</A>

					{/* Navigation Links */}
					<div class="flex items-center gap-1">
						<NavLink href="/" icon={Home}>
							Home
						</NavLink>
						<NavLink href="/live" icon={Radio}>
							Live
						</NavLink>
						<NavLink href="/past" icon={History}>
							History
						</NavLink>
					</div>
				</nav>
			</header>

			{/* Main Content */}
			<main class="mx-auto max-w-7xl px-4 py-6">{props.children}</main>

			{/* Footer */}
			<footer class="border-t bg-white py-4 text-center text-sm text-gray-500">
				<p>
					Data from{" "}
					<a
						href="https://www.hongkongairport.com"
						target="_blank"
						rel="noopener noreferrer"
						class="text-blue-600 hover:underline"
					>
						Hong Kong International Airport
					</a>
				</p>
			</footer>
		</div>
	);
};

interface NavLinkProps {
	href: string;
	icon: typeof Plane;
	children: string;
}

function NavLink(props: NavLinkProps) {
	return (
		<A
			href={props.href}
			class="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
			activeClass="bg-blue-50 text-blue-700"
			end={props.href === "/"}
		>
			<props.icon class="h-4 w-4" />
			{props.children}
		</A>
	);
}
