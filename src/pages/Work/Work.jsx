import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import workItems from "./items";
import { IoMdArrowBack } from "react-icons/io";

import { gsap } from "gsap";

import Transition from "../../components/transition/Transition";
import "./work.css";

const Work = () => {
  const carouselRef = useRef(null);
  const slideCount = useRef(1);
  const [slideIndex, SetSlideIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  const handleHeaderClick = (event) => {
    event.stopPropagation();
    navigate("/project");
  };

  const splitHeader = (element) => {
    let text = element.innerText;
    let splitText = text
      .split("")
      .map(function (char) {
        return `<span>${char === " " ? "&nbsp;&nbsp;" : char}</span>`;
      })
      .join("");

    element.innerHTML = splitText;
  };

  const addNewSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    const nextSlideIndex = slideCount.current % workItems.length;
    SetSlideIndex(nextSlideIndex);
    const newSlide = workItems[nextSlideIndex];
    const slideDiv = document.createElement("div");
    slideDiv.className = "slide";

    const slideImgDiv = document.createElement("div");
    slideImgDiv.className = "slide-img";

    let media;
    if (newSlide.workImg.endsWith(".mp4")) {
      media = document.createElement("video");
      media.src = newSlide.workImg;
      media.autoplay = true;
      media.muted = true;
      media.loop = true;
      media.playsInline = true;
    } else {
      media = document.createElement("img");
      media.src = newSlide.workImg;
      media.alt = newSlide.workName;
    }
    media.className = "work-preview";
    slideImgDiv.appendChild(media);


    const slideContentDiv = document.createElement("div");
    slideContentDiv.className = "slide-content";
    slideContentDiv.style.backgroundColor = newSlide.bgColor;
    const contentHeader = document.createElement("div");
    contentHeader.className = "slide-content-header";
    const header = document.createElement("h1");
    header.addEventListener("click", handleHeaderClick);
    header.textContent = newSlide.workName;
    splitHeader(header);
    const letters = header.querySelectorAll("span");

    contentHeader.appendChild(header);
    slideContentDiv.appendChild(contentHeader);

    const workClient = document.querySelector("#work-client");
    const workRole = document.querySelector("#work-role");
    const workType = document.querySelector("#work-type");

    gsap.to([workClient, workRole, workType], {
      opacity: 0,
      x: 15,
      duration: 0.3,
      stagger: 0.1,
      onComplete: () => {
        workClient.textContent = newSlide.workClient;
        workRole.textContent = newSlide.workRole;
        workType.textContent = newSlide.workType;
        gsap.to([workClient, workRole, workType], {
          opacity: 1,
          x: 0,
          duration: 0.3,
          stagger: 0.1,
          delay: 0.3,
        });
      },
    });

    slideDiv.appendChild(slideImgDiv);
    slideDiv.appendChild(slideContentDiv);

    gsap.set(letters, { top: "100px" });

    gsap.to(letters, {
      top: "0px",
      duration: 0.5,
      ease: "power2.out",
      delay: 0.35,
      stagger: 0.075,
    });

    gsap.set([slideImgDiv, slideContentDiv], {
      clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
    });

    gsap.to([slideImgDiv, slideContentDiv], {
      clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
      duration: 1.5,
      ease: "power4.out",
      stagger: 0.125,
      onComplete: () => {
        setIsAnimating(false);
      },
    });

    carouselRef.current.appendChild(slideDiv);
    slideCount.current++;

    if (carouselRef.current.children.length > 5) {
      Array.from(carouselRef.current.children)
        .slice(0, -5)
        .forEach((slide) => {
          setTimeout(() => {
            carouselRef.current.removeChild(slide);
          }, 2000);
        });
    }
  };
  useEffect(() => {
    const nextBtn = document.querySelector(".next-btn");
    const handleClick = (event) => {
      if (
        !document.querySelector(".menu").contains(event.target) &&
        !document
          .querySelector(".slide-content-header")
          .contains(event.target) &&
        !document
          .querySelector(".slide-content-header h1")
          .contains(event.target) &&
        !document.querySelector(".back-btn").contains(event.target) &&
        !isAnimating
      ) {
        addNewSlide();
      }
    };

    document.addEventListener("click", handleClick);
    nextBtn.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
      nextBtn.removeEventListener("click", handleClick);
    };
  }, [isAnimating]);

  return (
    <>
      <div className="back-btn">
        <IoMdArrowBack /> <Link to="/">Back</Link>
      </div>
      <div className="work-carousel" ref={carouselRef}>
        <div className="slide">
          <div className="slide-img">
            {workItems[0].workImg.endsWith(".mp4") ? (
              <video
                src={workItems[0].workImg}
                autoPlay
                muted
                loop
                playsInline
                className="work-preview"
              />
            ) : (
              <img
                src={workItems[0].workImg}
                alt={workItems[0].workName}
                className="work-preview"
              />
            )}
          </div>

          <div
            className="slide-content"
            style={{ backgroundColor: workItems[0].bgColor }}
          >
            <div className="slide-content-header">
              <h1 onClick={handleHeaderClick}>{workItems[0].workName}</h1>
            </div>
          </div>
        </div>
      </div>
      <div className="slide-info">
        <div className="slide-info-row">
          <p>With</p>
          <p id="work-client">{workItems[0].workClient}</p>
        </div>
        <div className="slide-info-row">
          <p>Role</p>
          <p id="work-role">{workItems[0].workRole}</p>
        </div>
        <div className="slide-info-row">
          <p>Type</p>
          <p id="work-type">{workItems[0].workType}</p>
        </div>
      </div>
      <div className="slide-index">
        <p>{slideIndex + 1}</p>
        <p>/</p>
        <p>{workItems.length}</p>
      </div>
      <div className="next-btn">
        <p>Next</p>
      </div>
    </>
  );
};

export default Transition(Work);
