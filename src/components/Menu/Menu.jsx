import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";

import icon1 from "../../assets/favicon/1.png"; 

import icon2 from "../../assets/favicon/2.png"; 

import "./menu.css";

const Menu = () => {
  const menuLinks = [
    { path: "/", label: "Home", icon: icon1 },
    { path: "/work", label: "Work", icon: icon2 },
    // Podés agregar más items y más imágenes si las tenés
  ];

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuContainer = useRef();
  const menuItemAnimation = useRef();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    gsap.set(".menu-item", { opacity: 0, y: 40 });

    menuItemAnimation.current = gsap
      .timeline({ paused: true })
      .to(".menu-item", {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        duration: 0.5,
        ease: "power3.out",
      });
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      menuItemAnimation.current.play();
    } else {
      menuItemAnimation.current.reverse();
    }
  }, [isMenuOpen]);

  return (
    <>
      <div className="menu" ref={menuContainer}>
        <div className="menu-toggle" onClick={toggleMenu}>
          <button>Menu</button>
        </div>
        <div className="menu-items">
          {menuLinks.map((link, index) => (
            <div
              key={index}
              className="menu-item"
              onClick={toggleMenu}
            >
              <Link className="menu-item-link" to={link.path}>
                <button>
                  <img
                    src={link.icon}
                    alt={link.label}
                    className="menu-icon"
                  />
                  <span>{link.label}</span>
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Menu;
