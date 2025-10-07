//src/components/ui/ModalPortal.tsx

"use client";

import { PropsWithChildren, useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function ModalPortal({ children }: PropsWithChildren) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
}
