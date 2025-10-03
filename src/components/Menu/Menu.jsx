import React, { useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { gsap } from "gsap";

import "./menu.css";

const Menu = () => {
  const menuLinks = [
    { path: "/", label: "Home" },
    { path: "/work", label: "Work" },
    // { path: "/photos", label: "Photos" },
  ];

  const menuContainer = useRef();
  const location = useLocation();

  useEffect(() => {
    // Animación suave de entrada para los items del menú
    gsap.fromTo(".menu-item", 
      { opacity: 0, y: -20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8, 
        stagger: 0.15, 
        ease: "power3.out",
        delay: 0.3
      }
    );
  }, []);

  // Efecto para cambiar el estado activo cuando cambia la ruta
  useEffect(() => {
    const activeLink = document.querySelector(".menu-item-link.active");
    if (activeLink) {
      activeLink.classList.remove("active");
    }
    
    const currentLink = document.querySelector(`[href="${location.pathname}"]`);
    if (currentLink) {
      currentLink.classList.add("active");
    }
  }, [location]);

  return (
    <>
      <div className="menu" ref={menuContainer}>
        <div className="menu-items">
          {menuLinks.map((link, index) => (
            <div
              key={index}
              className="menu-item"
            >
              <Link 
                className={`menu-item-link ${location.pathname === link.path ? 'active' : ''}`}
                to={link.path}
              >
                <button>{link.label}</button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Menu;