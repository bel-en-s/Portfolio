// Menu.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import "./menu.css";

const withBase = (p) => {
  const base = import.meta?.env?.BASE_URL ?? "/";
  return `${base}${String(p || "").replace(/^\/+/, "")}`;
};

export default function Menu() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  const links = useMemo(
    () => [
      { path: "/work", label: "portfolio" },
      { path: "/bio", label: "bio" },
       { path: "/bio", label: "obras" },
      //  { path: "/bio", label: "Alquimia /nTecnològica" },
    ],
    []
  );

  const [open, setOpen] = useState(false);

  const panelRef = useRef(null);
  const backdropRef = useRef(null);
  const tlRef = useRef(null);

  useEffect(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) return;

    gsap.set(panel, { xPercent: 100 });
    gsap.set(backdrop, { opacity: 0, pointerEvents: "none" });

    const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
    tl.to(backdrop, { opacity: 1, duration: 0.25, pointerEvents: "auto" }, 0);
    tl.to(panel, { xPercent: 0, duration: 0.55 }, 0);

    tl.fromTo(
      panel.querySelectorAll(".menuPanelItem"),
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.35, stagger: 0.06 },
      0.15
    );

    tlRef.current = tl;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      tl.kill();
    };
  }, []);

  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) return;
    open ? tl.play() : tl.reverse();
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const toggle = () => setOpen((v) => !v);

  return (
    <>
      <div className="menuDesktop" aria-label="Navegación principal">
        <div className="menuDesktopRow">
          <nav className="menuDesktopLinks">
            {links.map((l) => {
              const active = location.pathname === l.path;
              return (
                <Link
                  key={l.path}
                  to={l.path}
                  className={`menuDesktopItem ${active ? "isActive" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  <img
                    className="menuDesktopIcon"
                    src={withBase("star.png")}
                    alt=""
                    aria-hidden="true"
                  />
                  <span className="menuDesktopLabel">
                    {String(l.label)
                      .split("\n")
                      .map((line, i, arr) => (
                        <React.Fragment key={i}>
                          {line}
                          {i < arr.length - 1 ? <br /> : null}
                        </React.Fragment>
                      ))}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* MOBILE (solo mobile): back opcional + burger */}
      <div className="menuTop">
        {!isHome && (
          <button type="button" className="menuBack" onClick={() => navigate(-1)}>
            ← BACK
          </button>
        )}

        <button
          type="button"
          className={`menuBurger ${open ? "isOpen" : ""}`}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          onClick={toggle}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* backdrop (mobile) */}
      <div
        ref={backdropRef}
        className="menuBackdrop"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* panel (mobile) */}
      <aside ref={panelRef} className="menuPanel" aria-label="Menú">
        <div className="menuPanelInner">
          <div className="menuPanelHeader">
            <p className="menuPanelKicker">MENU</p>
          </div>

          <nav className="menuPanelNav">
            {links.map((l) => {
              const active = location.pathname === l.path;
              return (
                <Link
                  key={l.path}
                  to={l.path}
                  className={`menuPanelItem ${active ? "isActive" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="menuPanelLabel">
                    {String(l.label)
                      .split("\n")
                      .map((line, i, arr) => (
                        <React.Fragment key={i}>
                          {line}
                          {i < arr.length - 1 ? <br /> : null}
                        </React.Fragment>
                      ))}
                  </span>
                  <span className="menuPanelArrow">→</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
