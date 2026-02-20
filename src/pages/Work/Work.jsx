import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { IoMdArrowBack } from "react-icons/io";

import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Transition from "../../components/transition/Transition";
import workItems from "./items";
import "./Work.css";

gsap.registerPlugin(ScrollTrigger);

const SITE_URL = "https://bel-en-s.com";
const withBase = (p) =>
  `${import.meta.env.BASE_URL}${String(p || "").replace(/^\/+/, "")}`;

const WK_USE_LOCAL_LENIS = true;

function isMp4(v) {
  return typeof v === "string" && v.toLowerCase().endsWith(".mp4");
}

function normSrc(src) {
  if (!src || typeof src !== "string") return "";
  if (/^(https?:)?\/\//i.test(src)) return src;
  return withBase(src);
}

function Work() {
  const navigate = useNavigate();
  const [hoverId, setHoverId] = useState(null);

  const lenisRef = useRef(null);
  const rafRef = useRef(0);
  const rootRef = useRef(null);

  const baseVideoRefs = useRef(new Map());
  const hoverVideoRefs = useRef(new Map());
  const cardRefs = useRef(new Map());
  const hoverTlRefs = useRef(new Map());

  const items = useMemo(() => {
    return (workItems || []).map((it, i) => {
      const rawWork = it.workImg || it.videoSrc || it.imageSrc || "";
      const baseVideo = it.videoSrc || (isMp4(rawWork) ? rawWork : "");
      const baseImage = it.imageSrc || (!isMp4(rawWork) ? rawWork : "");

      const rawHover = it.hoverSrc || it.hoverVideoSrc || it.hoverImageSrc || "";
      const hoverVideo = it.hoverVideoSrc || (isMp4(rawHover) ? rawHover : "");
      const hoverImage = it.hoverImageSrc || (!isMp4(rawHover) ? rawHover : "");

      return {
        ...it,
        __i: i,
        __key: it.workId ?? `wk-${i}`,
        __href: it.slug ? `/project/${it.slug}` : "/work",
        __poster: normSrc(it.posterSrc || ""),
        __baseVideo: normSrc(baseVideo || ""),
        __baseImage: normSrc(baseImage || ""),
        __hoverVideo: normSrc(hoverVideo || ""),
        __hoverImage: normSrc(hoverImage || ""),
      };
    });
  }, []);

  useEffect(() => {
    if (!WK_USE_LOCAL_LENIS) return;
    if (window.__LENIS__) return;

    const lenis = new Lenis({
      lerp: 0.07,
      wheelMultiplier: 0.9,
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

  useLayoutEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    const onLenisScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onLenisScroll);
    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      lenis.off("scroll", onLenisScroll);
    };
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".wkItem");

      cards.forEach((card) => {
        const title = card.querySelector(".wkName");
        const meta = card.querySelector(".wkMeta");
        const thumb = card.querySelector(".wkThumb");

        gsap.fromTo(
          [title, meta],
          { y: 16, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: {
              trigger: card,
              start: "top 78%",
              end: "top 45%",
              toggleActions: "play none none reverse",
            },
          }
        );

        gsap.fromTo(
          thumb,
          { y: 0, scale: 1 },
          {
            y: -18,
            scale: 0.99,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top 70%",
              end: "bottom 20%",
              scrub: true,
            },
          }
        );
      });
    }, root);

    return () => ctx.revert();
  }, [items.length]);

  const safePlay = (el) => {
    if (!el) return;
    try {
      el.muted = true;
      el.playsInline = true;
      const p = el.play();
      if (p?.catch) p.catch(() => {});
    } catch {}
  };

  const safePause = (el) => {
    if (!el) return;
    try {
      el.pause();
    } catch {}
  };

  const killHoverTl = (id) => {
    const tl = hoverTlRefs.current.get(id);
    if (tl) tl.kill();
    hoverTlRefs.current.delete(id);
  };

  const getEls = (id) => {
    const card = cardRefs.current.get(id);
    if (!card) return null;
    const base = card.querySelector(".wkBase");
    const hover = card.querySelector(".wkHover");
    if (!base || !hover) return null;
    return { card, base, hover };
  };

  const handleEnter = (id) => {
    setHoverId(id);

    const els = getEls(id);
    if (!els) return;

    killHoverTl(id);

    const { base, hover } = els;

    gsap.set(hover, { opacity: 0, scale: 1.08, filter: "blur(6px)" });
    gsap.set(base, { opacity: 1, scale: 1, filter: "blur(0px)" });

    const tl = gsap.timeline();
    tl.to(
      base,
      {
        opacity: 0,
        scale: 1.04,
        filter: "blur(4px)",
        duration: 0.4,
        ease: "power3.out",
      },
      0
    );
    tl.to(
      hover,
      {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.6,
        ease: "power3.out",
      },
      0
    );

    hoverTlRefs.current.set(id, tl);

    const hv = hoverVideoRefs.current.get(id);
    const bv = baseVideoRefs.current.get(id);
    if (hv) safePlay(hv);
    if (bv) safePause(bv);
  };

  const handleLeave = (id) => {
    setHoverId(null);

    const els = getEls(id);
    if (!els) return;

    killHoverTl(id);

    const { base, hover } = els;

    const tl = gsap.timeline();
    tl.to(
      hover,
      {
        opacity: 0,
        scale: 1.04,
        filter: "blur(4px)",
        duration: 0.35,
        ease: "power2.out",
      },
      0
    );
    tl.to(
      base,
      {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.5,
        ease: "power3.out",
      },
      0
    );

    hoverTlRefs.current.set(id, tl);

    const hv = hoverVideoRefs.current.get(id);
    const bv = baseVideoRefs.current.get(id);
    if (hv) safePause(hv);
    if (bv) safePlay(bv);
  };

  useLayoutEffect(() => {
    items.forEach((item) => {
      const id = item.__key;
      const card = cardRefs.current.get(id);
      if (!card) return;

      const base = card.querySelector(".wkBase");
      const hover = card.querySelector(".wkHover");

      if (base) gsap.set(base, { opacity: 1, scale: 1, filter: "blur(0px)" });
      if (hover) gsap.set(hover, { opacity: 0, scale: 1.02, filter: "blur(0px)" });
    });
  }, [items.length]);

  useEffect(() => {
    const onLeavePage = () => {
      baseVideoRefs.current.forEach((v) => safePause(v));
      hoverVideoRefs.current.forEach((v) => safePause(v));
      hoverTlRefs.current.forEach((tl) => tl.kill());
      hoverTlRefs.current.clear();
    };
    window.addEventListener("pagehide", onLeavePage);
    return () => window.removeEventListener("pagehide", onLeavePage);
  }, []);

const goBack = () => {
  if (window.history.length > 1) {
    navigate(-1);
  } else {
    navigate(import.meta.env.BASE_URL || "/", { replace: true });
  }
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

      <main className="wk" ref={rootRef}>
        <button type="button" className="wkBack" onClick={goBack} aria-label="Back">
          <IoMdArrowBack className="wkBackIcon" />
          <span className="wkBackText">Back</span>
        </button>

        <header className="wkHeader">
          <h1 className="wkTitle">selected works</h1>
          <p className="wkKws">
            Creative web design · Interactive experiences · Motion design · 3D · <br />
            WebGL · Three.js · GSAP · Art direction · Branding · UX/UI
          </p>
        </header>

        <section className="wkStack" aria-label="Projects">
          {items.map((item) => {
            const id = item.__key;

            const hasBaseVideo = !!item.__baseVideo;
            const hasHoverVideo = !!item.__hoverVideo;
            const hasHoverImage = !!item.__hoverImage;

            return (
              <article
                key={id}
                className="wkItem"
                ref={(el) => {
                  if (el) cardRefs.current.set(id, el);
                  else cardRefs.current.delete(id);
                }}
                onMouseEnter={() => handleEnter(id)}
                onMouseLeave={() => handleLeave(id)}
              >
                <Link  className="wkThumb" aria-label={item.workName}>
                  {hasBaseVideo ? (
                    <video
                      className="wkMedia wkBase"
                      ref={(el) => {
                        if (el) baseVideoRefs.current.set(id, el);
                        else baseVideoRefs.current.delete(id);
                      }}
                      src={item.__baseVideo}
                      poster={item.__poster || undefined}
                      muted
                      playsInline
                      loop
                      autoPlay
                      preload="auto"
                    />
                  ) : (
                    <img className="wkMedia wkBase" src={item.__baseImage} alt={item.workName} loading="lazy" />
                  )}

                  {hasHoverVideo ? (
                    <video
                      className="wkMedia wkHover"
                      ref={(el) => {
                        if (el) hoverVideoRefs.current.set(id, el);
                        else hoverVideoRefs.current.delete(id);
                      }}
                      src={item.__hoverVideo}
                      muted
                      playsInline
                      loop
                      preload="auto"
                    />
                  ) : hasHoverImage ? (
                    <img className="wkMedia wkHover" src={item.__hoverImage} alt="" loading="lazy" />
                  ) : (
                    <span className="wkMedia wkHover" />
                  )}
                </Link>

                <div className="wkCardFoot">
                  <h2 className="wkName">{item.workName}</h2>
                  <p className="wkMeta">
                    {item.workClient ? <span>{item.workClient}</span> : null}
                    {item.workRole ? <span>{item.workRole}</span> : null}
                    {item.workYear ? <span>{item.workYear}</span> : null}
                  </p>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </>
  );
}

export default Transition(Work);
