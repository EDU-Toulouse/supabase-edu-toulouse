import { cn } from "@/lib/utils";

export type PageHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export function PageHeader({ className, children, ...props }: PageHeaderProps) {
  return (
    <div className={cn("grid gap-1", className)} {...props}>
      {children}
    </div>
  );
}

export type PageHeaderHeadingProps = React.HTMLAttributes<HTMLHeadingElement>;

export function PageHeaderHeading({
  className,
  ...props
}: PageHeaderHeadingProps) {
  return (
    <h1
      className={cn("text-3xl font-bold tracking-tight md:text-4xl", className)}
      {...props}
    />
  );
}

export type PageHeaderDescriptionProps =
  React.HTMLAttributes<HTMLParagraphElement>;

export function PageHeaderDescription({
  className,
  ...props
}: PageHeaderDescriptionProps) {
  return <p className={cn("text-muted-foreground", className)} {...props} />;
}
