"use client";

import * as React from "react";

const cn = (...args: Array<string | false | undefined | null>) =>
  args.filter(Boolean).join(" ");

type Size = "sm" | "md" | "lg" | "xl";
type Variant = "primary" | "secondary" | "success" | "warning" | "destructive" | "white" | "black";
type LoaderType = "spinner" | "dots" | "ring" | "sit-n-spin";

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

const SitNSpinIcon = ({ size = "md", variant = "primary" }: { size?: Size; variant?: Variant }) => {
  const sizeMap: Record<Size, number> = { sm: 20, md: 32, lg: 48, xl: 64 };
  const iconSize = sizeMap[size];
  const color = variant === "primary" ? "#3b82f6" : 
                variant === "secondary" ? "#6b7280" : 
                variant === "success" ? "#10b981" : 
                variant === "warning" ? "#f59e0b" : 
                variant === "destructive" ? "#ef4444" : 
                variant === "white" ? "#ffffff" : "#000000";

  return (
    <svg 
      width={iconSize} 
      height={iconSize} 
      viewBox="0 0 100 100" 
      className="animate-spin"
      aria-hidden="true"
    >
      {/* Base circle */}
      <circle cx="50" cy="50" r="45" stroke={color} strokeWidth="3" fill="none" strokeDasharray="5,5" />
      
      {/* Chair/Seat */}
      <g transform="translate(50, 50) rotate(0)">
        <path 
          d="M -25,-10 L 25,-10 L 20,15 L -20,15 Z" 
          fill={color} 
          fillOpacity="0.3"
          stroke={color}
          strokeWidth="2"
          className="origin-center animate-pulse"
        />
        
        {/* Chair back */}
        <rect 
          x="-20" 
          y="15" 
          width="40" 
          height="10" 
          fill={color} 
          fillOpacity="0.4"
          stroke={color}
          strokeWidth="1"
          rx="2"
        />
        
        {/* Chair legs */}
        <line x1="-15" y1="25" x2="-15" y2="40" stroke={color} strokeWidth="3" />
        <line x1="15" y1="25" x2="15" y2="40" stroke={color} strokeWidth="3" />
        
        {/* Person sitting (simple stick figure) */}
        <circle cx="0" cy="-5" r="6" fill={color} fillOpacity="0.8" />
        <line x1="0" y1="1" x2="0" y2="15" stroke={color} strokeWidth="3" />
        <line x1="-10" y1="-10" x2="0" y2="-5" stroke={color} strokeWidth="2" />
        <line x1="10" y1="-10" x2="0" y2="-5" stroke={color} strokeWidth="2" />
        <line x1="-8" y1="25" x2="0" y2="15" stroke={color} strokeWidth="2" />
        <line x1="8" y1="25" x2="0" y2="15" stroke={color} strokeWidth="2" />
      </g>
      
      {/* Rotating decorative elements */}
      <circle cx="50" cy="50" r="35" stroke={color} strokeWidth="1" fill="none" opacity="0.3">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 50 50"
          to="360 50 50"
          dur="3s"
          repeatCount="indefinite"
        />
      </circle>
      
      {/* Sparkles/effects */}
      <g>
        <circle cx="80" cy="50" r="3" fill={color} opacity="0.6">
          <animate 
            attributeName="opacity" 
            values="0.3;0.8;0.3" 
            dur="1.5s" 
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="20" cy="50" r="3" fill={color} opacity="0.6">
          <animate 
            attributeName="opacity" 
            values="0.3;0.8;0.3" 
            dur="1.5s" 
            repeatCount="indefinite"
            begin="0.5s"
          />
        </circle>
        <circle cx="50" cy="20" r="3" fill={color} opacity="0.6">
          <animate 
            attributeName="opacity" 
            values="0.3;0.8;0.3" 
            dur="1.5s" 
            repeatCount="indefinite"
            begin="1s"
          />
        </circle>
      </g>
    </svg>
  );
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

  const renderSitNSpin = () => (
    <div className="flex flex-col items-center justify-center" aria-hidden>
      <SitNSpinIcon size={size} variant={variant} />
      {fullPage && (
        <div className="mt-4 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{ animationDelay: `${i * 0.2}s` }}
              className={cn(
                "w-2 h-2 rounded-full animate-bounce",
                colorClass ?? variantBgColor[variant]
              )}
            />
          ))}
        </div>
      )}
    </div>
  );

  const loaderInner = type === "dots" ? renderDots() : 
                     type === "ring" ? renderRing() : 
                     type === "sit-n-spin" ? renderSitNSpin() : 
                     renderSpinner();

  const content = (
    <div className={cn("flex flex-col items-center gap-3", className)} role="status" aria-label={accessibleLabel}>
      {loaderInner}
      {text ? <p className={cn("text-sm font-medium", variantTextColor[variant])}>{text}</p> : <span className="sr-only">{accessibleLabel}</span>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-200/50">
          {content}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 font-medium animate-pulse">
              Taking a spin... just a moment!
            </p>
          </div>
        </div>
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

// New: Page Loading Wrapper specifically for page transitions
export const PageLoadingWrapper: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
  variant?: Variant;
}> = ({ isLoading, children, message = "Getting things ready...", variant = "primary" }) => {
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader 
          show={true} 
          fullPage={true} 
          type="sit-n-spin" 
          variant={variant}
          text={message}
        />
      </div>
    );
  }
  return <>{children}</>;
};

// New: Route transition loader
export const RouteTransitionLoader: React.FC<{
  isTransitioning: boolean;
  children: React.ReactNode;
}> = ({ isTransitioning, children }) => {
  return (
    <>
      {isTransitioning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
          <Loader 
            show={true} 
            type="sit-n-spin" 
            variant="primary"
            text="Moving to a new seat..."
            fullPage={false}
            size="lg"
          />
        </div>
      )}
      {children}
    </>
  );
};

// Updated skeleton components with chair theme
type SkeletonProps = {
  className?: string;
  rounded?: boolean;
  width?: string;
  height?: string;
};

export const SkeletonBox: React.FC<SkeletonProps> = ({ className = "", rounded = true, width = "w-full", height = "h-4" }) => {
  return (
    <div className={cn(width, height, rounded ? "rounded-md" : "", "bg-gradient-to-r from-gray-100 to-gray-200 relative overflow-hidden", className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50 animate-shimmer" />
    </div>
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={cn("p-4 rounded-lg bg-gradient-to-br from-white to-gray-50 border border-gray-200/50 relative overflow-hidden shadow-sm", className)}>
      {/* <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-40 animate-shimmer" /> */}
      <div className="space-y-2">
        <div className="w-20 h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
        <div className="w-5 h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
      </div>
    </div>
  );
};

// New: SkeletonMobileCard — mirrors the exact DOM & classes of the mobile member card to ensure pixel-perfect skeletons
export const SkeletonMobileCard: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={cn("bg-gray-100 border border-gray-200 rounded-md p-2 flex flex-col min-h-[210px] relative overflow-hidden", className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-40 animate-shimmer" />

      <div className="flex items-center justify-between">
        <div className="h-4 w-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
        <div className="h-4 w-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded ml-2 flex-1" />
        <div className="h-4 w-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded ml-1" />
      </div>

      <div className="flex justify-between mt-2">
        <div className="h-3 w-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
        <div className="h-3 w-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
      </div>

      <div className="flex justify-between mt-1">
        <div className="h-3 w-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
        <div className="h-3 w-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
      </div>

      <div className="flex justify-between mt-1">
        <div className="h-3 w-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
        <div className="h-3 w-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
      </div>

      <div className="flex justify-between mt-1">
        <div className="h-3 w-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
        <div className="h-3 w-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
      </div>

      <div className="flex justify-between mt-1">
        <div className="h-3 w-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
        <div className="h-3 w-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
      </div>

      <div className="flex justify-between mt-1">
        <div className="h-3 w-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
        <div className="h-3 w-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
      </div>

      <div className="mt-2 w-full h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
    </div>
  );
};

// Update your loader file - modify the SkeletonTable component to accept custom column widths and match the real table min-width
export const SkeletonTable: React.FC<{ 
  rows?: number; 
  cols?: number; 
  className?: string;
  colWidths?: string[];
  minWidthClass?: string;
}> = ({ rows = 4, cols = 6, className = "", colWidths = [], minWidthClass = "min-w-[1000px]" }) => {
  // Use provided colWidths or default ones (try to map to the actual table used in AnalyticsPage)
  const defaultColWidths = (() => {
    if (cols === 11) {
      // Map roughly to: checkbox, sr, name, haptu, withdraw, interest, fine, paidWithdrawal, newWithdrawal, total, action
      return [
        "w-12", // checkbox
        "w-10", // sr
        "w-[320px]", // name
        "w-24", // haptu
        "w-20", // withdraw
        "w-20", // interest
        "w-20", // fine
        "w-24", // paidWithdrawal
        "w-24", // newWithdrawal
        "w-28", // total
        "w-24",
      ];
    }
    return Array.from({ length: cols }).map((_, idx) => (idx === 0 ? "w-12" : idx === 1 ? "w-12" : "w-[150px]"));
  })();

  const widths = colWidths.length > 0 ? colWidths : defaultColWidths;

  
  return (
    <div className={cn("w-full overflow-x-auto relative", className)}>
      <div className={cn(minWidthClass, "border border-gray-200/50 rounded-lg p-4 bg-gradient-to-b from-white to-gray-50/50 relative overflow-hidden shadow-sm")}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-40 animate-shimmer" />
        <div className="grid grid-cols-7 gap-4 mb-3">
          {widths.map((w, i) => (
            <div key={i} className={cn(w, "h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded")} />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="flex items-center gap-4">
              {widths.map((w, c) => (
                <div key={c} className={cn(w, "h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded")} />
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
        <div key={i} className={cn(
          i === 0 ? "w-12" : i === 1 ? "w-12" : "w-[150px]", 
          "h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded"
        )} />
      ))}
    </div>
  );
};

export const LoginSkeleton: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6 relative overflow-hidden", className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-40 animate-shimmer" />
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-200/50">
        <div className="mb-6">
          <div className="h-10 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-6" />
          <div className="space-y-3">
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
            <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
            <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
          </div>
        </div>
        <div className="mt-6">
          <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
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
      <div className="absolute left-0 top-0 h-full bg-white/20" style={{ width: `${safeProgress}%`, transition: "width 300ms ease" }} />
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

// New: Hook for page loading state
export const usePageLoader = (initialState = false) => {
  const [isLoading, setIsLoading] = React.useState(initialState);
  
  const startLoading = (message?: string) => {
    setIsLoading(true);
    return () => setIsLoading(false);
  };
  
  const stopLoading = () => setIsLoading(false);
  
  return {
    isLoading,
    setIsLoading,
    startLoading,
    stopLoading,
  };
};