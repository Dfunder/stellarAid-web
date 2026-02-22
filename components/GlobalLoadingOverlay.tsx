"use client";
import { useUIStore } from "@/store/uiStore";
import GlobalLoading from "./GlobalLoading";

export default function GlobalLoadingOverlay() {
  const isGlobalLoading = useUIStore((s) => s.isGlobalLoading);
  if (!isGlobalLoading) return null;
  return <GlobalLoading message="Loading..." />;
}