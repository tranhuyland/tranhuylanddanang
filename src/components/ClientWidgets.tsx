"use client";

import dynamic from "next/dynamic";

const AIChatbot = dynamic(() => import("./AIChatbot"), { ssr: false });
const ScrollToTop = dynamic(() => import("./ScrollToTop"), { ssr: false });

export default function ClientWidgets() {
  return (
    <>
      <AIChatbot />
      <ScrollToTop />
    </>
  );
}
