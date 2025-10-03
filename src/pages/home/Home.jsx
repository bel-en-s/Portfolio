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
        .map((char) => `<span>${char === " " ? "  " : char}</span>`)
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
          <h1>Self<span style={{color: "rgba(255, 255, 255, 0.5)"}}>*</span>design<br />studio</h1>
        </div>
      </div>
      <div className="intro">
        {/* <div className="intro-col">
          <div className="intro-sub-col">
            <p className="intro-header">About</p>
            <p>Read More</p>
            <br />
            <p className="intro-header">Contact</p>
            <p>Email Address</p>
          </div>
          <div className="intro-sub-col">
            <p className="intro-header">Social</p>
            <p>Instagram</p>
            <p>Savee</p>
            <p>LinkedIn</p>
          </div>
        </div> */}
        <div className="intro-col">
          {/* <div className="intro-img">
       
          </div> */}
          <div className="intro-about">
            <div className="intro-about-col">
              <p>
                We create digital experiences that feel like scenes from a dream—blending art direction, 
                fantasy, and multimedia into spaces that elevate.
                We believe in the power of the imaginary, of building interfaces and worlds that go beyond 
                function—toward emotion, presence, and beauty.
              </p>
            </div>
            <div className="intro-about-col">
              {/* <p>
                With a background in art and code, we direct and shape interactive work that feels crafted, intentional, and alive.
                We collaborate with teams and clients across luxury, fashion, and art, delivering high-end experiences rooted in aesthetics and meaning.
              </p> */}
            </div>
          </div>
{/* 
          <div className="intro-data">
            <p className="intro-header">Clients</p>
            <p>
              Apple, Spotify, Nike, Amazon, Adobe, Tesla, Microsoft, Uber,
              Peloton, Samsung, Airbnb, LEGO, BBC, Red Bull.
            </p>
            <br />
            <p className="intro-header">Senior Visual Designer - ThinkMotive</p>
            <p>March 2022 - Current</p>
            <br />
            <p className="intro-header">Lead Designer - Creative Labs</p>
            <p>June 2018 - March 2022</p>
            <br />
            <p className="intro-header">Graphic Designer - MediaMonks</p>
            <p>April 2015 - June 2018</p>
            <br />
            <p className="intro-header">Recognition</p>
            <p>Awwwards Site of the Day - Horizon UI</p>
            <p>Featured on CSS Design Awards - Horizon UI</p>
            <p>Cannes Lions, Silver, Digital Craft - NextGen Retail</p>
          </div> */}
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
            <img
              src={emailIcon}
              alt="Email Icon"
              style={{ width: "24px", height: "24px" }}
            />
          </a>
          <a
            href="https://www.instagram.com/bel.en.s"
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: "10px" }}
          >
            <img
              src={instagramIcon}
              alt="Instagram"
              style={{ width: "24px", height: "24px" }}
            />
          </a>
          <a
            href="https://www.behance.net/bel-en-s"
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: "10px" }}
          >
            <img
              src={behanceIcon}
              alt="Behance"
              style={{ width: "24px", height: "24px" }}
            />
          </a>
        </div>
      </footer>
    </>
  );
};

export default Transition(Home);
