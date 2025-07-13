import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import workItems from "./items";
import { IoMdArrowBack } from "react-icons/io";

import { gsap } from "gsap";

import Transition from "../../components/transition/Transition";
import "./gallery.css";

const Gallery = () => {
  const carouselRef = useRef(null);
  const slideCount = useRef(1);
  const [slideIndex, SetSlideIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

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
    const image = document.createElement("img");
    image.className = "slide-preview";
    image.style.top = "100%";
    image.src = newSlide.workImg;
    image.alt = newSlide.workName;
    slideImgDiv.appendChild(image);

    const slideContentDiv = document.createElement("div");
    slideContentDiv.className = "slide-content";
    const contentHeader = document.createElement("div");
    contentHeader.className = "slide-content-header";
    const headerImg = document.createElement("img");
    headerImg.src = newSlide.previewImg;
    headerImg.alt = newSlide.workName;

    contentHeader.appendChild(headerImg);
    slideContentDiv.appendChild(contentHeader);

    const workClient = document.querySelector("#work-client");

    gsap.to(workClient, {
      opacity: 0,
      x: 15,
      duration: 0.3,
      onComplete: () => {
        workClient.textContent = newSlide.workClient;
        gsap.to([workClient], {
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

    gsap.set([slideContentDiv], { opacity: 0 });

    gsap.to([slideContentDiv], {
      opacity: 1,
      duration: 1,
      ease: "power4.out",
      onComplete: () => {
        setIsAnimating(false);
      },
    });

    gsap.to(image, {
      top: "0%",
      duration: 1.5,
      ease: "power4.out",
      onComplete: () => {
        setIsAnimating(false);
      },
    });

    gsap.to(".slide-img img", {
      top: "-50%",
      scale: 1.5,
      duration: 1.5,
      ease: "power4.out",
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
      <div className="gallery">
        <div className="work-carousel" ref={carouselRef}>
          <div className="slide">
            <div className="slide-img">
              <img src={workItems[0].workImg} alt={workItems[0].workName} />
            </div>
            <div className="slide-content">
              <div className="slide-content-header">
                <img
                  src={workItems[0].previewImg}
                  alt={workItems[0].workName}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="slide-info">
          <div className="slide-info-row">
            <p>With</p>
            <p id="work-client">{workItems[0].workClient}</p>
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
      </div>
    </>
  );
};

export default Transition(Gallery);
