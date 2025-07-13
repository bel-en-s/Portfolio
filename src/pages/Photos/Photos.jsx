import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Transition from "../../components/transition/Transition";
import PhotosPrev1 from "../../assets/work/img1.jpg";
import PhotosPrev2 from "../../assets/work/img2.jpg";
import PhotosPrev3 from "../../assets/work/img3.jpg";
import PhotosPrev4 from "../../assets/work/img4.jpg";
import PhotosPrev5 from "../../assets/work/img5.jpg";
import PhotosPrev6 from "../../assets/work/img6.jpg";
import { gsap } from "gsap";

import "./photos.css";

const Photos = () => {
  const navigate = useNavigate();

  const handleHeaderClick = (event) => {
    event.stopPropagation();
    navigate("/gallery");
  };

  useEffect(() => {
    gsap.set(["h1", ".view-gallery"], { y: 50, opacity: 0 });
    gsap.set(".photo-img", {
      clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
    });

    setTimeout(() => {
      gsap.to(["h1", ".view-gallery"], {
        y: 0,
        opacity: 1,
        stagger: 0.25,
        duration: 1,
        ease: "power3.out",
      });

      gsap.to(".photo-img", {
        clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
        duration: 1,
        ease: "power4.inOut",
        stagger: 0.025,
      });
    }, 500);
  }, []);

  return (
    <>
      <div className="photos">
        <div className="photos-col">
          <h1>Photos</h1>
          <Link to="/gallery">
            <button className="view-gallery">View Gallery</button>
          </Link>
        </div>
        <div className="photos-col"></div>
        <div className="photos-col"></div>
        <div className="photos-col">
          <div className="photos-row">
            <div className="photo-img"></div>
            <div className="photo-img" onClick={handleHeaderClick}>
              <img src={PhotosPrev1} alt="" />
            </div>
            <div className="photo-img"></div>
          </div>
          <div className="photos-row">
            <div className="photo-img"></div>
            <div className="photo-img">
              <div className="photo-img" onClick={handleHeaderClick}>
                <img src={PhotosPrev2} alt="" />
              </div>
            </div>
            <div className="photo-img">
              <div className="photo-img" onClick={handleHeaderClick}>
                <img src={PhotosPrev3} alt="" />
              </div>
            </div>
          </div>
          <div className="photos-row">
            <div className="photo-img">
              <div className="photo-img" onClick={handleHeaderClick}>
                <img src={PhotosPrev4} alt="" />
              </div>
            </div>
            <div className="photo-img">
              <div className="photo-img" onClick={handleHeaderClick}>
                <img src={PhotosPrev5} alt="" />
              </div>
            </div>
            <div className="photo-img"></div>
          </div>
          <div className="photos-row">
            <div className="photo-img"></div>
            <div className="photo-img"></div>
            <div className="photo-img">
              <div className="photo-img" onClick={handleHeaderClick}>
                <img src={PhotosPrev6} alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Transition(Photos);
