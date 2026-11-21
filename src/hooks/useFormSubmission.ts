"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useFormSubmission(successCooldownMs = 2500) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const cooldownRef = useRef<ReturnType<typeof setTimeout>>();
  const cooldownMsRef = useRef(successCooldownMs);

  useEffect(() => {
    cooldownMsRef.current = successCooldownMs;
  }, [successCooldownMs]);

  useEffect(() => () => {
    if (cooldownRef.current) clearTimeout(cooldownRef.current);
  }, []);

  const submit = useCallback(
    async (operation: () => void | Promise<void>): Promise<boolean> => {
      if (submittingRef.current) return false;

      submittingRef.current = true;
      setIsSubmitting(true);
      if (cooldownRef.current) {
        clearTimeout(cooldownRef.current);
        cooldownRef.current = undefined;
      }
      try {
        await operation();
        cooldownRef.current = setTimeout(() => {
          cooldownRef.current = undefined;
          submittingRef.current = false;
          setIsSubmitting(false);
        }, cooldownMsRef.current);
        return true;
      } catch (error) {
        if (cooldownRef.current) {
          clearTimeout(cooldownRef.current);
          cooldownRef.current = undefined;
        }
        submittingRef.current = false;
        setIsSubmitting(false);
        throw error;
      }
    },
    [],
  );

  return { isSubmitting, submit };
}
