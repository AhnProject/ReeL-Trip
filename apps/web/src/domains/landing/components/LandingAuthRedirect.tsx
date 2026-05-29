"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function LandingAuthRedirect() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem("token")) {
      router.replace("/dashboard/home");
    }
  }, [router]);

  if (!mounted) return null;

  return null;
}
