/**
 * Tooltip Component
 *
 * Accessible tooltip using Ark UI with HKIA styling.
 * Shows additional information on hover.
 */

import { Tooltip as ArkTooltip } from "@ark-ui/solid/tooltip";
import type { JSX } from "solid-js";
import { Portal } from "solid-js/web";

export interface TooltipProps {
	/** The content to show in the tooltip */
	content: JSX.Element;
	/** The trigger element */
	children: JSX.Element;
	/** Positioning of the tooltip */
	positioning?: {
		placement?: "top" | "bottom" | "left" | "right";
	};
	/** Delay before showing (ms) */
	openDelay?: number;
	/** Delay before hiding (ms) */
	closeDelay?: number;
}

export function Tooltip(props: TooltipProps) {
	return (
		<ArkTooltip.Root
			openDelay={props.openDelay ?? 200}
			closeDelay={props.closeDelay ?? 0}
			positioning={props.positioning ?? { placement: "top" }}
		>
			<ArkTooltip.Trigger class="cursor-help">
				{props.children}
			</ArkTooltip.Trigger>
			<Portal>
				<ArkTooltip.Positioner>
					<ArkTooltip.Content class="z-50 max-w-xs rounded-lg bg-[#1A1A1B] px-3 py-2 text-sm text-white shadow-lg">
						{props.content}
					</ArkTooltip.Content>
				</ArkTooltip.Positioner>
			</Portal>
		</ArkTooltip.Root>
	);
}
