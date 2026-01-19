/**
 * Layout Component
 *
 * Provides consistent navigation and page structure
 * Uses HKIA Visual DNA color palette
 * 
 * Mobile-first responsive design:
 * - Compact header on mobile with icon-only nav
 * - Bottom navigation for mobile devices
 * - Full navigation on tablet/desktop
 */

import { A } from "@solidjs/router";
import { History, House, Plane, Radio } from "lucide-solid";
import type { ParentComponent } from "solid-js";

export const Layout: ParentComponent = (props) => {
	return (
		<div class="flex min-h-screen flex-col bg-[#F2F4F7]">
			{/* Navigation Header - HKIA Deep Blue */}
			<header class="sticky top-0 z-50 bg-[#003580] shadow-lg">
				<nav class="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:h-16 sm:px-4">
					{/* Logo */}
					<A
						href="/"
						class="flex items-center gap-1.5 text-lg font-bold text-white sm:gap-2 sm:text-xl"
					>
						<Plane class="h-5 w-5 text-[#FFD700] sm:h-6 sm:w-6" />
						<span class="hidden xs:inline">HKG Flights</span>
						<span class="xs:hidden">HKG</span>
					</A>

					{/* Desktop Navigation Links - Hidden on mobile */}
					<div class="hidden items-center gap-1 sm:flex">
						<NavLink href="/" icon={House}>
							Home
						</NavLink>
						<NavLink href="/live" icon={Radio}>
							Live
						</NavLink>
						<NavLink href="/past" icon={History}>
							History
						</NavLink>
					</div>

					{/* Mobile Navigation - Icon only, visible on mobile */}
					<div class="flex items-center gap-0.5 sm:hidden">
						<MobileNavLink href="/" icon={House} label="Home" />
						<MobileNavLink href="/live" icon={Radio} label="Live" />
						<MobileNavLink href="/past" icon={History} label="History" />
					</div>
				</nav>
			</header>

			{/* Main Content - Add padding bottom for mobile nav space */}
			<main class="mx-auto w-full max-w-7xl flex-1 px-3 py-4 sm:px-4 sm:py-6">
				{props.children}
			</main>

			{/* Footer - Hidden on mobile, visible on tablet+ */}
			<footer class="hidden border-t border-[#003580]/20 bg-white py-4 text-center text-sm text-gray-500 sm:block">
				<p class="text-center text-xs text-gray-400">
					Data sourced from{" "}
					<a
						href="https://data.gov.hk/en-data/dataset/aahk-team1-flight-info"
						class="hover:text-[#003580] hover:underline"
					>
						Hong Kong International Airport
					</a>{" "}
					•{" "}
					<a
						href="https://github.com/a06073123/hkg-flight-viewer"
						class="hover:text-[#003580] hover:underline"
					>
						View on GitHub
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
			class="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
			activeClass="bg-white/20 text-white"
			end={props.href === "/"}
		>
			<props.icon class="h-4 w-4" />
			{props.children}
		</A>
	);
}

interface MobileNavLinkProps {
	href: string;
	icon: typeof Plane;
	label: string;
}

function MobileNavLink(props: MobileNavLinkProps) {
	return (
		<A
			href={props.href}
			class="flex flex-col items-center justify-center rounded-lg px-3 py-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
			activeClass="bg-white/20 text-white"
			end={props.href === "/"}
			title={props.label}
		>
			<props.icon class="h-5 w-5" />
			<span class="mt-0.5 text-[10px] font-medium">{props.label}</span>
		</A>
	);
}
