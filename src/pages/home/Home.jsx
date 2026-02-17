
import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Transition from "../../components/transition/Transition";
import Canvas from "./Canvas";
import { gsap } from "gsap";
import "./Home.css";

import emailIcon from "../../assets/favicon/message-2.svg";
import instagramIcon from "../../assets/favicon/instagram.svg";
import behanceIcon from "../../assets/favicon/behance.svg";
import ContactButton from "../../assets/ui/ContactButton";

const SITE_URL = "https://bel-en-s.com";

const Home = () => {
  const splitHeader = (selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      const text = element.innerText;
      const splitText = text
        .split("")
        .map((char) => `<span>${char === " " ? "  " : char}</span>`)
        .join("");
      element.innerHTML = splitText;
    });
  };

  useEffect(() => {
    splitHeader(".header-1 h1");
    splitHeader(".header-2 h2");

    gsap.set("p", { y: 50, opacity: 0 });

    const t = setTimeout(() => {
      gsap.to([".header-1 h1 span", ".header-2 h2 span"], {
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

    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <Helmet>
        <title>Belén Seoane Palmieri – Artista Multimedial & Diseñadora Web Creativa</title>
        <meta
          name="description"
          content="Belén Seoane Palmieri es artista multimedial y diseñadora web creativa en Buenos Aires. Motion design, experiencias sensibles, WebGL/3D, GSAP y dirección de arte."
        />
        <link rel="canonical" href={`${SITE_URL}/`} />
        <meta property="og:title" content="Belén Seoane Palmieri – Artista Multimedial & Diseñadora Web Creativa" />
        <meta
          property="og:description"
          content="Artista multimedial y diseñadora web creativa. Motion design, experiencias sensibles, WebGL/3D, GSAP y dirección de arte."
        />
        <meta property="og:url" content={`${SITE_URL}/`} />
        <meta property="og:type" content="website" />
      </Helmet>

      <Canvas />

      <div className="header">
        <div className="header-1">
          <h1 className="name">Belén Seoane Palmieri</h1>
        </div>
        <div className="header-2">
          <h2 className="tagline">Self*design</h2>
        </div>
      </div>

      <div className="intro">
        <div className="intro-col">
          <div className="intro-about">
            <div className="intro-about-col">
              <p>
                Artista multimedial y disenadora web creativa.
                <br />
                Buenos Aires, Argentina
                <br />
                <ContactButton
                  label="contacto"
                  href="#contact"
                  underlineOffset={4}
                  underlineThickness={1}
                  uppercase={true}
                />
              </p>
            </div>

            <div className="intro-about-col"></div>
          </div>
        </div>
      </div>

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

