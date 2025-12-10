import React from "react";

export function MobileFooter({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="
        fixed bottom-0 left-0 right-0
        bg-white border-t shadow-md
        p-3
        flex flex-col gap-3
        sm:hidden
        z-50
      "
    >
      {children}
    </div>
  );
}
