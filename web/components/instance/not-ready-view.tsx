import React from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
// images
import instanceNotReady from "public/instance/plane-instance-not-ready.webp";
import PlaneWhiteLogo from "public/plane-logos/white-horizontal-with-blue-logo.svg";
import PlaneBlackLogo from "public/plane-logos/black-horizontal-with-blue-logo.svg";

export const InstanceNotReady = () => {
  const { resolvedTheme } = useTheme();

  const planeLogo = resolvedTheme === "dark" ? PlaneWhiteLogo : PlaneBlackLogo;

  return (
    <div className="h-screen w-full overflow-y-auto bg-onboarding-gradient-100">
      <div className="h-full w-full pt-24">
        <div className="h-full bg-onboarding-gradient-100 md:w-2/3 sm:w-4/5 px-4 pt-4 rounded-t-md mx-auto shadow-sm border-x border-t border-custom-border-100">
          <div className="relative px-7 sm:px-0 bg-onboarding-gradient-200 h-full rounded-t-md">
            <div className="flex items-center py-10 justify-center">
              <Image src={planeLogo} className="h-[44px] w-full" alt="Plane logo" />
            </div>
            <div className="mt-20">
              <Image src={instanceNotReady} className="w-full" alt="Instance not ready" />
            </div>
            <div className="flex flex-col gap-5 items-center py-12 pb-20 w-full">
              <h3 className="text-2xl font-medium">Your Plane instance isn{"'"}t ready yet</h3>
              <p className="text-sm">Ask your Instance Admin to complete set-up first.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
