"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useFormSubmission(successCooldownMs = 2500) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const cooldownRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => {
    if (cooldownRef.current) clearTimeout(cooldownRef.current);
  }, []);

  const submit = useCallback(
    async (operation: () => void | Promise<void>): Promise<boolean> => {
      if (submittingRef.current) return false;

      submittingRef.current = true;
      setIsSubmitting(true);
      try {
        await operation();
        if (cooldownRef.current) clearTimeout(cooldownRef.current);
        cooldownRef.current = setTimeout(() => {
          submittingRef.current = false;
          setIsSubmitting(false);
        }, successCooldownMs);
        return true;
      } catch (error) {
        submittingRef.current = false;
        setIsSubmitting(false);
        throw error;
      }
    },
    [successCooldownMs],
  );

  return { isSubmitting, submit };
}
