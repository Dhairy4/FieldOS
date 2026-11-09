"use client";

import { MobileFrame } from "../../components/layout/MobileFrame";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileFrame
      desktopSidebar={false}
      className="flex flex-col justify-center pb-10"
    >
      {/* Constrain the form to a comfortable width and present it as a card
          on larger screens, so it no longer stretches edge-to-edge. */}
      <div className="mx-auto w-full max-w-md lg:rounded-xl lg:border lg:border-border lg:bg-surface lg:p-8 lg:shadow-card">
        {children}
      </div>
    </MobileFrame>
  );
}
