/**
 * Collapsible Component
 *
 * Accessible collapsible panel using Ark UI with HKIA styling.
 * Used for expandable sections like date groups in history pages.
 */

import { Collapsible as ArkCollapsible } from "@ark-ui/solid/collapsible";
import { ChevronRight } from "lucide-solid";
import type { JSX } from "solid-js";

export interface CollapsibleProps {
	/** Trigger/header content */
	trigger: JSX.Element;
	/** Collapsible body content */
	children: JSX.Element;
	/** Whether initially open */
	defaultOpen?: boolean;
	/** Custom class for the root */
	class?: string;
	/** Custom class for the trigger */
	triggerClass?: string;
	/** Custom class for the content */
	contentClass?: string;
}

export function Collapsible(props: CollapsibleProps) {
	return (
		<ArkCollapsible.Root
			defaultOpen={props.defaultOpen ?? true}
			class={
				props.class ??
				"overflow-hidden rounded-lg border bg-white shadow-sm"
			}
		>
			<ArkCollapsible.Trigger
				class={
					props.triggerClass ??
					"flex w-full items-center justify-between border-b bg-[#003580] px-4 py-2 text-left font-medium text-white transition-colors hover:bg-[#003580]/90"
				}
			>
				{props.trigger}
				<ArkCollapsible.Indicator class="transition-transform duration-200 data-[state=open]:rotate-90">
					<ChevronRight class="h-4 w-4" />
				</ArkCollapsible.Indicator>
			</ArkCollapsible.Trigger>
			<ArkCollapsible.Content class={props.contentClass ?? "divide-y"}>
				{props.children}
			</ArkCollapsible.Content>
		</ArkCollapsible.Root>
	);
}
