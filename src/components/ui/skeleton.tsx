import { cn } from "@/lib/utils";

function Skeleton({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				"animate-pulse rounded-md bg-dokusho-button-primary/10",
				className
			)}
			{...props}
		/>
	);
}

export { Skeleton }; 