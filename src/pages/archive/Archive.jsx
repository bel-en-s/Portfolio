import { useEffect, useState, useRef } from "react";
import { ReactLenis } from "lenis/react";

import "./Archive.css";

import Transition from "../../components/transition/Transition";
import Preview from "../../components/preview/Preview";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const Archive = () => {
  const [archiveList, setArchiveList] = useState([]);
  const containerRef = useRef(null);

  const archives = [
    { name: "Vintage Visions", category: "Print Design" },
    { name: "Lost Horizons", category: "Concept Art" },
    { name: "Eternal Echoes", category: "Typography" },
    { name: "Abstract Dimensions", category: "Experimental Media" },
    { name: "Silent Stories", category: "Photography" },
    { name: "Fading Memories", category: "Editorial Design" },
    { name: "Echo Chamber", category: "Sound Design" },
    { name: "Shattered Glass", category: "Art Installations" },
    { name: "Timeless Essence", category: "Brand Strategy" },
    { name: "Parallel Worlds", category: "UX/UI Design" },
    { name: "Invisible Threads", category: "Fashion Styling" },
    { name: "Beyond the Surface", category: "Augmented Reality" },
  ];

  useEffect(() => {
    const initialSet = Array(120)
      .fill()
      .flatMap((_, i) =>
        archives.map((archive, j) => ({
          ...archive,
          name: `${archive.name}`,
          id: i * archives.length + j,
        }))
      );
    setArchiveList(initialSet);
  }, []);

  useEffect(() => {
    if (containerRef.current && archiveList.length > 0) {
      ScrollTrigger.create({
        scroller: containerRef.current,
        start: 0,
        end: "max",
        onLeave: (self) => {
          self.scroll(1);
          ScrollTrigger.update();
        },
        onLeaveBack: (self) => {
          self.scroll(ScrollTrigger.maxScroll(containerRef.current) - 1);
          ScrollTrigger.update();
        },
      });

      const archiveItems =
        containerRef.current.querySelectorAll(".archive-item");
      archiveItems.forEach((item) => {
        gsap.to(item, {
          repeat: 1,
          yoyo: true,
          ease: "none",
          scrollTrigger: {
            scroller: containerRef.current,
            trigger: item,
            start: "center bottom",
            end: "center top",
            scrub: true,
          },
        });
      });
    }
  }, [archiveList]);

  return (
    <ReactLenis root>
      <div
        className="archive"
        ref={containerRef}
        style={{
          height: "100vh",
          top: "-25em",
          //  overflowY: "auto"
          // to enable infinite scrolling, uncomment `overflowY: "auto"` and remove the <ReactLenis root> component from root
        }}
      >
        <div className="container">
          <div className="overlay"></div>

          <Preview />

          {archiveList.map((archive) => (
            <div className="row" key={archive.id}>
              <div className="archive-item">
                <div className="archive-details">
                  <h1 id="archive-name">{archive.name}</h1>
                  <p id="archive-category">{archive.category}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ReactLenis>
  );
};

export default Transition(Archive);
