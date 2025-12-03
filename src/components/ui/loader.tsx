"use client";

import * as React from "react";

const cn = (...args: Array<string | false | undefined | null>) =>
  args.filter(Boolean).join(" ");

type Size = "sm" | "md" | "lg" | "xl";
type Variant = "primary" | "secondary" | "success" | "warning" | "destructive" | "white" | "black";
type LoaderType = "spinner" | "dots" | "ring";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: Size;
  colorClass?: string;
  "aria-label"?: string;
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "md", colorClass = "border-black", "aria-label": ariaLabel, ...props }, ref) => {
    const sizeMap: Record<Size, string> = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8", xl: "h-12 w-12" };
    return (
      <div
        ref={ref}
        role="status"
        aria-label={ariaLabel ?? "Loading"}
        className={cn("animate-spin rounded-full border-2 border-t-transparent", sizeMap[size], colorClass, className)}
        {...props}
      />
    );
  }
);
Spinner.displayName = "Spinner";

interface LoaderProps {
  size?: Size;
  variant?: Variant;
  className?: string;
  text?: string;
  fullPage?: boolean;
  show?: boolean;
  type?: LoaderType;
  "aria-label"?: string;
  colorClass?: string;
}

const sizeClasses: Record<Size, string> = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8", xl: "h-12 w-12" };
const borderClasses: Record<Size, string> = { sm: "border-2", md: "border-2", lg: "border-4", xl: "border-4" };
const variantBorderColor: Record<Variant, string> = {
  primary: "border-blue-600",
  secondary: "border-gray-600",
  success: "border-green-600",
  warning: "border-yellow-500",
  destructive: "border-red-600",
  white: "border-white",
  black: "border-black",
};
const variantBgColor: Record<Variant, string> = {
  primary: "bg-blue-600",
  secondary: "bg-gray-600",
  success: "bg-green-600",
  warning: "bg-yellow-500",
  destructive: "bg-red-600",
  white: "bg-white",
  black: "bg-black",
};
const variantTextColor: Record<Variant, string> = {
  primary: "text-blue-600",
  secondary: "text-gray-600",
  success: "text-green-600",
  warning: "text-yellow-500",
  destructive: "text-red-600",
  white: "text-white",
  black: "text-black",
};

export const Loader: React.FC<LoaderProps> = ({
  size = "md",
  variant = "primary",
  className = "",
  text,
  fullPage = false,
  show = true,
  type = "spinner",
  "aria-label": ariaLabel,
  colorClass,
}) => {
  if (!show) return null;
  const accessibleLabel = ariaLabel ?? text ?? "Loading";

  const renderDots = () => (
    <div className="flex items-center justify-center gap-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{ animationDelay: `${i * 0.12}s` }}
          className={cn("inline-block rounded-full animate-bounce", sizeClasses[size], colorClass ?? variantBgColor[variant])}
        />
      ))}
    </div>
  );

  const renderRing = () => (
    <div className="relative" aria-hidden>
      <div className={cn("rounded-full border-opacity-20", sizeClasses[size], borderClasses[size], variantBorderColor[variant])} />
      <div className={cn("absolute top-0 left-0 rounded-full animate-spin", sizeClasses[size], borderClasses[size], variantBorderColor[variant], "border-t-transparent")} />
    </div>
  );

  const renderSpinner = () => (
    <div aria-hidden className={cn("rounded-full animate-spin", sizeClasses[size], borderClasses[size], colorClass ?? variantBorderColor[variant], "border-t-transparent")} />
  );

  const loaderInner = type === "dots" ? renderDots() : type === "ring" ? renderRing() : renderSpinner();

  const content = (
    <div className={cn("flex flex-col items-center gap-3", className)} role="status" aria-label={accessibleLabel}>
      {loaderInner}
      {text ? <p className={cn("text-sm font-medium", variantTextColor[variant])}>{text}</p> : <span className="sr-only">{accessibleLabel}</span>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export const ButtonLoader: React.FC<{
  loading?: boolean;
  children: React.ReactNode;
  loadingText?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
}> = ({ loading = false, children, loadingText = "Loading...", variant = "white", size = "sm", className = "" }) => {
  if (!loading) return <>{children}</>;
  return (
    <div className={cn("flex items-center justify-center gap-2", className)} aria-live="polite">
      <Loader size={size} variant={variant} type="dots" className="!gap-0" show />
      <span className="text-sm">{loadingText}</span>
    </div>
  );
};

export const InlineSpinner: React.FC<{
  size?: Size;
  variant?: Variant;
  className?: string;
}> = ({ size = "sm", variant = "primary", className = "" }) => {
  return <Loader size={size} variant={variant} type="spinner" className={className} show />;
};

export const LoadingWrapper: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  loaderProps?: Partial<LoaderProps>;
  fallback?: React.ReactNode;
  className?: string;
}> = ({ isLoading, children, loaderProps = {}, fallback, className = "" }) => {
  if (isLoading) {
    if (fallback) return <div className={className}>{fallback}</div>;
    return (
      <div className={className}>
        <Loader show fullPage={loaderProps.fullPage ?? false} {...loaderProps} />
      </div>
    );
  }
  return <div className={className}>{children}</div>;
};

type SkeletonProps = {
  className?: string;
  rounded?: boolean;
  width?: string;
  height?: string;
};

export const SkeletonBox: React.FC<SkeletonProps> = ({ className = "", rounded = true, width = "w-full", height = "h-4" }) => {
  return <div className={cn(width, height, rounded ? "rounded-md" : "", "bg-gray-200/60 relative overflow-hidden", className)}><div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-30 animate-shimmer" /></div>;
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={cn("p-4 rounded-lg bg-white/60 border border-gray-200 relative overflow-hidden", className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-30 animate-shimmer" />
      <div className="flex items-center justify-between mb-3">
        <div className="w-28 h-4 bg-gray-200/60 rounded" />
        <div className="w-6 h-6 bg-gray-200/60 rounded" />
      </div>
      <div className="space-y-2">
        <div className="w-16 h-8 bg-gray-200/60 rounded" />
        <div className="w-24 h-3 bg-gray-200/60 rounded" />
      </div>
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number; cols?: number; className?: string }> = ({ rows = 4, cols = 6, className = "" }) => {
  const colWidths = Array.from({ length: cols }).map((_, idx) => (idx === 0 ? "w-12" : idx === 1 ? "w-12" : "w-[150px]"));
  return (
    <div className={cn("w-full overflow-x-auto relative", className)}>
      <div className="min-w-[800px] border border-gray-100 rounded-md p-4 bg-white/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-30 animate-shimmer" />
        <div className="grid grid-cols-6 gap-4 mb-3">
          {colWidths.map((w, i) => (
            <div key={i} className={cn(w, "h-4 bg-gray-200/60 rounded")} />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="flex items-center gap-4">
              {colWidths.map((w, c) => (
                <div key={c} className={cn(w, "h-6 bg-gray-200/60 rounded")} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const SkeletonTableRow: React.FC<{ cols?: number }> = ({ cols = 6 }) => {
  return (
    <div className="flex items-center gap-4">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className={cn(i === 0 ? "w-12" : i === 1 ? "w-12" : "w-[150px]", "h-6 bg-gray-200/60 rounded")} />
      ))}
    </div>
  );
};

export const LoginSkeleton: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-gray-50 p-6 relative overflow-hidden", className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-30 animate-shimmer" />
      <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-lg">
        <div className="mb-6">
          <div className="h-10 w-32 bg-gray-200/60 rounded mb-6" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200/60 rounded" />
            <div className="h-12 bg-gray-200/60 rounded" />
            <div className="h-4 bg-gray-200/60 rounded" />
            <div className="h-12 bg-gray-200/60 rounded" />
          </div>
        </div>
        <div className="mt-6">
          <div className="h-10 bg-gray-200/60 rounded" />
        </div>
      </div>
    </div>
  );
};

type ButtonWithLoaderProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingText?: string;
  variantClass?: string;
  spinnerSize?: Size;
};

export const ButtonWithLoader: React.FC<ButtonWithLoaderProps> = ({ loading = false, loadingText = "Loading", children, variantClass = "bg-blue-600 text-white", spinnerSize = "sm", className = "", ...props }) => {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={cn("inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-all disabled:opacity-60 relative overflow-hidden", variantClass, className)}
    >
      {loading ? (
        <>
          <Spinner size={spinnerSize} colorClass="border-white" />
          <span className="text-sm select-none">{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

type ButtonWithProgressProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  progress?: number;
  loading?: boolean;
  variantClass?: string;
};

export const ButtonWithProgress: React.FC<ButtonWithProgressProps> = ({ progress = 0, loading = false, children, variantClass = "bg-blue-600 text-white", className = "", ...props }) => {
  const safeProgress = Math.max(0, Math.min(100, Math.round(progress)));
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={cn("inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-all disabled:opacity-60 relative overflow-hidden", variantClass, className)}
    >
      <div className="absolute left-0 top-0 h-full bg-white/10" style={{ width: `${safeProgress}%`, transition: "width 300ms ease" }} />
      {loading ? (
        <div className="flex items-center gap-2 z-10">
          <Spinner size="sm" colorClass="border-white" />
          <span className="text-sm select-none">{children}</span>
        </div>
      ) : (
        <div className="z-10">{children}</div>
      )}
    </button>
  );
};

const styleTag = `
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.animate-shimmer > div { animation: shimmer 1.6s linear infinite; background-size: 200% 100%; }
`;

export default Spinner;

export const Styles = () => <style dangerouslySetInnerHTML={{ __html: styleTag }} />;
