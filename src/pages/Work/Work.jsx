import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { IoMdArrowBack } from "react-icons/io";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import workItems from "./items";
import Transition from "../../components/transition/Transition";
import "./work.css";

gsap.registerPlugin(ScrollTrigger);

const SITE_URL = "https://bel-en-s.com";

const pad2 = (n) => String(n).padStart(2, "0");

const Work = () => {
  const rootRef = useRef(null);
  const spotlightRef = useRef(null);
  const imagesRef = useRef(null);
  const namesRef = useRef(null);
  const indexRef = useRef(null);

  const [hoverId, setHoverId] = useState(null);

  const items = useMemo(() => {
    return workItems.map((it, i) => ({
      ...it,
      __i: i,
      __href: it.slug ? `/project/${it.slug}` : "/work",
    }));
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const spotlight = spotlightRef.current;
    const images = imagesRef.current;
    const names = namesRef.current;
    const indexEl = indexRef.current;
    if (!root || !spotlight || !images || !names || !indexEl) return;

    const h1 = root.querySelector(".workHeader-1 h1");
    const h2 = root.querySelector(".workHeader-2 h2");

    const split = (el) => {
      if (!el) return;
      const text = el.innerText;
      el.innerHTML = text
        .split("")
        .map((ch) => `<span>${ch === " " ? "  " : ch}</span>`)
        .join("");
    };

    split(h1);
    split(h2);

    const headerSpans = root.querySelectorAll(".workHeader-1 h1 span, .workHeader-2 h2 span");
    gsap.set(headerSpans, { position: "relative", top: 24 });

    const ctx = gsap.context(() => {
      const imgs = gsap.utils.toArray(".spotImg", images);
      const nameRows = gsap.utils.toArray(".nameRow", names);
      const total = nameRows.length;

      const setIndex = (i) => {
        indexEl.textContent = `${pad2(i + 1)}/${pad2(total)}`;
      };

      const setActive = (activeIndex) => {
        imgs.forEach((el, i) => el.classList.toggle("is-active", i === activeIndex));
        nameRows.forEach((el, i) => el.classList.toggle("is-active", i === activeIndex));
        setIndex(activeIndex);
      };

      setActive(0);

      const headerTl = gsap.timeline({ delay: 0.25, defaults: { ease: "power3.out" } });
      headerTl.to(headerSpans, { top: 0, duration: 0.55, stagger: 0.012 });
      headerTl.fromTo(
        root.querySelector(".workIntro"),
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9 },
        "-=0.2"
      );

      const pinLen = Math.max(window.innerHeight * 4, total * window.innerHeight * 0.55);

      ScrollTrigger.create({
        trigger: spotlight,
        start: "top top",
        end: `+=${pinLen}`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress;
          const activeIndex = Math.min(Math.floor(progress * total), total - 1);
          setActive(activeIndex);

          const imagesTravel = Math.max(0, images.scrollHeight - spotlight.clientHeight);
          const namesTravel = Math.max(0, names.scrollHeight - spotlight.clientHeight);

          gsap.set(images, { y: -progress * imagesTravel });
          gsap.set(names, { y: -progress * namesTravel });
        },
      });
    }, root);

    return () => ctx.revert();
  }, [items.length]);

  return (
    <>
      <Helmet>
        <title>Work – Belén Seoane Palmieri</title>
        <meta
          name="description"
          content="Trabajos seleccionados de Belén Seoane Palmieri: diseño web creativo, motion design, experiencias interactivas, WebGL/3D y dirección de arte."
        />
        <link rel="canonical" href={`${SITE_URL}/work`} />
        <meta property="og:title" content="Work – Belén Seoane Palmieri" />
        <meta
          property="og:description"
          content="Selected projects: motion, experiencias sensibles, WebGL/3D, GSAP y dirección de arte."
        />
        <meta property="og:url" content={`${SITE_URL}/work`} />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="workPage" ref={rootRef}>
        <div className="back-btn">
          <IoMdArrowBack /> <Link to="/">Back</Link>
        </div>

        <div className="workHeader">
          <div className="workHeader-1">
            <h1 className="workH1">Work</h1>
          </div>
          <div className="workHeader-2">
            <h2 className="workH2">Selected projects</h2>
          </div>
        </div>

        <div className="workIntro">
          <p>
            Diseño experiencias digitales con foco en ritmo, textura y sensibilidad. Combino dirección de arte con
            desarrollo (GSAP, WebGL/Three.js y 3D) para construir sitios interactivos y narrativos. Cada proyecto
            está curado con una portada nítida y un micro-loop que muestra interacción cuando suma.
          </p>
        </div>

        <section className="spotlight" ref={spotlightRef} aria-label="Selected work spotlight">
          <div className="spotIndex">
            <h3 ref={indexRef}>01/01</h3>
          </div>

          <div className="spotImages" ref={imagesRef}>
            {items.map((item) => (
              <Link
                to={item.__href}
                key={item.workId}
                className="spotImg"
                onMouseEnter={() => setHoverId(item.workId)}
                onMouseLeave={() => setHoverId(null)}
                onTouchStart={() => setHoverId(item.workId)}
                onTouchEnd={() => setHoverId(null)}
                aria-label={item.workName}
              >
                <img src={item.workImg} alt={item.workName} loading="lazy" />
                {item.workVideo && hoverId === item.workId ? (
                  <video src={item.workVideo} autoPlay muted loop playsInline preload="metadata" />
                ) : null}
              </Link>
            ))}
          </div>

          <div className="spotNames" ref={namesRef} aria-label="Project list">
            {items.map((item) => (
              <Link key={item.workId} to={item.__href} className="nameRow">
                <div className="nameTitle">{item.workName}</div>
                <div className="nameMeta">
                  {item.workClient ? <span>{item.workClient}</span> : null}
                  {item.workRole ? <span>{item.workRole}</span> : null}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="workOutro" aria-label="End">
          <p>Scroll complete.</p>
        </section>
      </div>
    </>
  );
};

export default Transition(Work);
