import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 0.9,
      touchMultiplier: 1,
    });

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    let rafId = 0;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    gsap.ticker.lagSmoothing(0);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.off("scroll", onScroll);
      lenis.destroy();
    };
  }, []);

  return null;
}
