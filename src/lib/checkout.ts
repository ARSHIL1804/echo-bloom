import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { createPortalSession, createProCheckout } from "@/lib/polar.functions";

/** Sends the user to Polar checkout for the Pro plan. */
export function useUpgrade() {
  const startCheckout = useServerFn(createProCheckout);
  const [pending, setPending] = useState(false);

  async function upgrade() {
    setPending(true);
    try {
      const { url } = await startCheckout({});
      window.location.href = url;
    } catch (error) {
      toast.error("Couldn't start checkout", {
        description: error instanceof Error ? error.message : "Please try again in a moment.",
      });
      setPending(false);
    }
  }

  return { upgrade, pending };
}

/** Opens the Polar customer portal to manage or cancel the subscription. */
export function useBillingPortal() {
  const createSession = useServerFn(createPortalSession);
  const [pending, setPending] = useState(false);

  async function openPortal() {
    setPending(true);
    try {
      const { url } = await createSession({});
      window.location.href = url;
    } catch (error) {
      toast.error("Couldn't open billing portal", {
        description: error instanceof Error ? error.message : "Please try again in a moment.",
      });
      setPending(false);
    }
  }

  return { openPortal, pending };
}
