import React, { useEffect } from "react";
import Transition from "../../components/transition/Transition";
import Canvas from "./Canvas";
import { gsap } from "gsap";
import "./Home.css";

// ✅ Importación de íconos
import emailIcon from "../../assets/favicon/message-2.svg";
import instagramIcon from "../../assets/favicon/instagram.svg";
import behanceIcon from "../../assets/favicon/behance.svg";

const Home = () => {
  const splitHeader = (selector) => {
    let elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      let text = element.innerText;
      let splitText = text
        .split("")
        .map((char) => `<span>${char === " " ? "  " : char}</span>`)
        .join("");

      element.innerHTML = splitText;
    });
  };

  useEffect(() => {
    splitHeader(".header-1 h1");
    splitHeader(".header-2 h1");

    gsap.set("p", {
      y: 50,
      opacity: 0,
    });

    setTimeout(() => {
      gsap.to([".header-1 h1 span", ".header-2 h1 span"], {
        top: "0px",
        stagger: 0.015,
        duration: 0.5,
        ease: "power3.out",
      });

      gsap.to("p", {
        y: 0,
        opacity: 1,
        stagger: 0.05,
        duration: 1,
        ease: "power3.out",
      });
    }, 500);
  }, []);

  return (
    <>
      <Canvas />

      <div className="header">
        <div className="header-1">
          <h1>bel-en-s</h1>
        </div>
        <div className="header-2">
          <h1>
            Self<span style={{ color: "rgba(255, 255, 255, 0.5)" }}>*</span>design
            <br />
            studio
          </h1>
        </div>
      </div>

      <div className="intro">
        <div className="intro-col">
          <div className="intro-about">
            <div className="intro-about-col">
              <p>
                We create digital experiences that feel like scenes from a dream—blending art direction,
                fantasy, and multimedia into spaces that elevate. We believe in the power of the imaginary,
                of building interfaces and worlds that go beyond function—toward emotion, presence, and beauty.
              </p>

              {/* ✅ NEW: Services / keywords (debajo del párrafo, sin cambiar nada más) */}
              <div className="services-keywords">
                <span className="sk">Interactive Websites</span>
                <span className="sk">Web Motion (GSAP)</span>
                <span className="sk">3D / WebGL</span>
                <span className="sk">Branding & Visual Systems</span>
                <span className="sk">UI Design</span>
                <span className="sk">Prototyping</span>
                <span className="sk">Art direction + illustration</span>
              </div>
            </div>

            <div className="intro-about-col">
              {/* (tu segunda columna se mantiene vacía / comentada) */}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ NEW: Work section (vertical scroll llega acá) */}
      <section className="work-section">
        <div className="work-head">
          <p className="work-kicker">Work</p>
          <h2 className="work-title">Selected projects</h2>
          <p className="work-sub">
            Scroll horizontally to preview. Videos will live inside each square.
          </p>
        </div>

        <div className="work-row">
          {/* Card 1 */}
          <article className="work-card">
            <div className="work-thumb" />
            <div className="work-meta">
              <p className="work-name">AWAKE</p>
              <p className="work-desc">Interactive studio site · Motion + WebGL</p>
            </div>
          </article>

          {/* Card 2 */}
          <article className="work-card">
            <div className="work-thumb" />
            <div className="work-meta">
              <p className="work-name">RTS</p>
              <p className="work-desc">B2B website · Systems + UX</p>
            </div>
          </article>

          {/* Card 3 */}
          <article className="work-card">
            <div className="work-thumb" />
            <div className="work-meta">
              <p className="work-name">Despierta Candela</p>
              <p className="work-desc">Brand + Web · Editorial aesthetic</p>
            </div>
          </article>

          {/* Card 4 */}
          <article className="work-card">
            <div className="work-thumb" />
            <div className="work-meta">
              <p className="work-name">R3F Experiments</p>
              <p className="work-desc">Three.js · Materials + post</p>
            </div>
          </article>
        </div>
      </section>

      {/* ✅ Footer fixed (queda igual, no lo toco) */}
      <footer
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "200px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <a
            href="mailto:belen.seoane.palmieri@gmail.com"
            style={{ marginBottom: "10px", padding: "10px" }}
          >
            <img src={emailIcon} alt="Email Icon" style={{ width: "24px", height: "24px" }} />
          </a>
          <a
            href="https://www.instagram.com/bel.en.s"
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: "10px" }}
          >
            <img src={instagramIcon} alt="Instagram" style={{ width: "24px", height: "24px" }} />
          </a>
          <a
            href="https://www.behance.net/bel-en-s"
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: "10px" }}
          >
            <img src={behanceIcon} alt="Behance" style={{ width: "24px", height: "24px" }} />
          </a>
        </div>
      </footer>
    </>
  );
};

export default Transition(Home);
