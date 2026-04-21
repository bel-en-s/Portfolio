import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import "./ContactButton.css";

export default function ContactButton({
  label = "contacto",
  email = "belen.seoane.palmieri@gmail.com",
  href,
  className = "",
  underlineOffset = 3,
  underlineThickness = 1,
  uppercase = true,
}) {

  const rootRef = useRef(null);
  const tlRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const line = root.querySelector(".cb-line");
    if (!line) return;

    // ✅ arranca visible
    gsap.set(line, { transformOrigin: "left center", scaleX: 1 });

    // hover -> desaparece / leave -> vuelve
    const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
    tl.to(line, { scaleX: 0, duration: 0.28 }, 0);
    tlRef.current = tl;

    const onEnter = () => tlRef.current?.play();
    const onLeave = () => tlRef.current?.reverse();

    root.addEventListener("mouseenter", onEnter);
    root.addEventListener("mouseleave", onLeave);
    root.addEventListener("focus", onEnter);
    root.addEventListener("blur", onLeave);

    return () => {
      root.removeEventListener("mouseenter", onEnter);
      root.removeEventListener("mouseleave", onLeave);
      root.removeEventListener("focus", onEnter);
      root.removeEventListener("blur", onLeave);
      tlRef.current?.kill();
      tlRef.current = null;
    };
  }, []);

  const finalHref = href ? href : `mailto:${email}`;
  const isExternal = href && href.startsWith("http");

  return (
    <a
      ref={rootRef}
      className={`cb ${uppercase ? "cb--upper" : ""} ${className}`}
      href={finalHref}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      style={{
        "--cb-underline-offset": `${underlineOffset}px`,
        "--cb-underline-thickness": `${underlineThickness}px`,
      }}
    >
      <span className="cb-textWrap">
        <span className="cb-label">{label}</span>
        <span className="cb-line" aria-hidden="true" />
      </span>
    </a>
  );
}
