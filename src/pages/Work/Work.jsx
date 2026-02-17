// src/pages/Work/Work.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { IoMdArrowBack } from "react-icons/io";

import Lenis from "lenis";

import Transition from "../../components/transition/Transition";
import workItems from "./items";
import "./Work.css";

const SITE_URL = "https://bel-en-s.com";
const withBase = (p) =>
  `${import.meta.env.BASE_URL}${String(p || "").replace(/^\/+/, "")}`;

const WK_USE_LOCAL_LENIS = true;

function Work() {
  const navigate = useNavigate();
  const [hoverId, setHoverId] = useState(null);

  // Lenis local (opcional)
  const lenisRef = useRef(null);
  const rafRef = useRef(0);

  const items = useMemo(() => {
    return (workItems || []).map((it, i) => {
      const maybeWorkImg = it.workImg || "";
      const workImgStr = typeof maybeWorkImg === "string" ? maybeWorkImg : "";

      const isMp4InWorkImg = workImgStr.toLowerCase().endsWith(".mp4");
      const videoSrc = it.videoSrc || (isMp4InWorkImg ? maybeWorkImg : "");
      const imageSrc = it.imageSrc || (!isMp4InWorkImg ? maybeWorkImg : "");

      return {
        ...it,
        __i: i,
        __href: it.slug ? `/project/${it.slug}` : "/work",
        __video: videoSrc || "",
        __poster: it.posterSrc || "",
        __image: imageSrc || "",
      };
    });
  }, []);

  useEffect(() => {
    if (!WK_USE_LOCAL_LENIS) return;


    if (window.__LENIS__) return;

    const lenis = new Lenis({
    
      lerp: 0.06,
      wheelMultiplier: 0.85,
      touchMultiplier: 1,
      smoothWheel: true,
      smoothTouch: false,
      normalizeWheel: true,
      syncTouch: false,
    });

    window.__LENIS__ = lenis;
    lenisRef.current = lenis;

    const raf = (t) => {
      lenis.raf(t);
      rafRef.current = requestAnimationFrame(raf);
    };
    rafRef.current = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafRef.current);
      lenis.destroy();
      lenisRef.current = null;
      delete window.__LENIS__;
    };
  }, []);

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate(withBase(""));
  };

  const onEnter = (id) => setHoverId(id);
  const onLeave = () => setHoverId(null);

  const playPreview = (videoEl) => {
    if (!videoEl) return;
    try {
      videoEl.currentTime = 0;
      videoEl.play();
    } catch {}
  };

  const stopPreview = (videoEl) => {
    if (!videoEl) return;
    try {
      videoEl.pause();
    } catch {}
  };

  return (
    <>
      <Helmet>
        <title>Work – Belén Seoane Palmieri</title>
        <meta
          name="description"
          content="Work portfolio de Belén Seoane Palmieri: creative web design, interactive experiences, motion design, 3D, WebGL/Three.js, GSAP, art direction, branding y UX/UI."
        />
        <link rel="canonical" href={`${SITE_URL}/work`} />
      </Helmet>

      <main className="wk">
        <button type="button" className="wkBack" onClick={goBack} aria-label="Back">
          <IoMdArrowBack />
          <span>Back</span>
        </button>

        <header className="wkHeader">
          <h1 className="wkTitle">work portfolio</h1>

          <p className="wkKws">
            Creative web design · Interactive experiences · Motion design · 3D · <br/>WebGL · Three.js · GSAP · Art direction
            · Branding · UX/UI
          </p>

          {/* <div className="wkAbout">
            <p>
              Diseño experiencias digitales con foco en ritmo, textura y sensibilidad. Trabajo entre dirección de arte y
              desarrollo para construir sitios narrativos: tipografía, composición, micro-interacciones y performance.
              Suelo explorar visualmente, definir sistema y luego llevarlo a código cuidando animación, accesibilidad y
              tiempos de carga.
            </p>
          </div> */}
        </header>

        <section className="wkGrid" aria-label="Projects">
          {items.map((item) => {
            const hasVideo = !!item.__video;
            const isHover = hoverId === item.workId;

            return (
              <article
                key={item.workId ?? item.__i}
                className="wkCard"
                onMouseEnter={() => onEnter(item.workId)}
                onMouseLeave={onLeave}
              >
                <div className="wkCardHead">
                  <h2 className="wkName">{item.workName}</h2>
                  <p className="wkMeta">
                    {item.workClient ? <span>{item.workClient}</span> : null}
                    {item.workRole ? <span>{item.workRole}</span> : null}
                  </p>
                </div>

                <Link to={item.__href} className="wkThumb" aria-label={item.workName}>
                  {hasVideo ? (
                    <video
                      className={`wkMedia ${isHover ? "is-on" : ""}`}
                      src={item.__video}
                      poster={item.__poster || undefined}
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      onMouseEnter={(e) => playPreview(e.currentTarget)}
                      onMouseLeave={(e) => stopPreview(e.currentTarget)}
                      onFocus={(e) => playPreview(e.currentTarget)}
                      onBlur={(e) => stopPreview(e.currentTarget)}
                    />
                  ) : (
                    <img className="wkMedia is-on" src={item.__image} alt={item.workName} loading="lazy" />
                  )}
                </Link>
              </article>
            );
          })}
        </section>

   
      </main>
    </>
  );
}

export default Transition(Work);
