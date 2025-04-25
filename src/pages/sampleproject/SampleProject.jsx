import { Link } from "react-router-dom";
import { ReactLenis } from "lenis/react";

import "./SampleProject.css";

import Transition from "../../components/transition/Transition";

import ProjectHeroImg from "../../assets/sample-projects/sample-project-hero-2.jpg";
import ProjectHeroImg2 from "../../assets/sample-projects/sample-project-hero-3.jpg";
import ProjectHeroImg3 from "../../assets/sample-projects/sample-project-hero.jpg";
import ProjectImg1 from "../../assets/sample-projects/sample-project-1.jpg";
import ProjectImg2 from "../../assets/sample-projects/sample-project-2.jpg";
import ProjectImg3 from "../../assets/sample-projects/sample-project-3.jpg";
import ProjectImg4 from "../../assets/sample-projects/sample-project-4.jpg";

const SampleProject = () => {
  return (
    <ReactLenis root>
      <div className="project">
        <div className="conainer">
          <div className="project-hero-img">
            <img src={ProjectHeroImg} alt="Project Hero Img" />
          </div>

          <div className="project-info">
            <div className="col">
              <div className="project-client">
                <p>Client &#x2192; Acme Industries</p>
              </div>
              <div className="project-studio">
                <p>Studio &#x2192; Creative Works</p>
              </div>
            </div>
            <div className="col">
              <div className="project-year">
                <p>Year &#x2192; 2023</p>
              </div>
            </div>
          </div>

          <div className="project-copy">
            <div className="col">
              <h1>
                Dynamic Vision: <br />
                TechCorp x Innovate Media
              </h1>
            </div>

            <div className="col">
              <p>
                A campaign designed to capture the innovation, creativity, and
                energy that TechCorp brings to the forefront of technology.
                Highlighting the cutting-edge developments for their latest
                product launch, this project emphasizes the fusion of technology
                and art, creating a visually striking and engaging experience.
              </p>

              <div className="project-sub-info">
                <div className="sub-col">
                  <span>Branding</span>
                  <span>Visual Design</span>
                  <span>Typography</span>
                  <span>Animation</span>
                </div>

                <div className="sub-col">
                  <span>&#x2192; Live Demo</span>
                </div>
              </div>
            </div>
          </div>

          <div className="project-hero-img-2">
            <img src={ProjectHeroImg2} alt="" />
          </div>

          <div className="project-copy">
            <div className="col"></div>

            <div className="col">
              <p>
                A visual campaign celebrating the innovation, creativity, and
                impact of cutting-edge technology at the Global Tech Expo. After
                a year of virtual events, this project brought technology to
                life with dynamic visuals and bold messaging, showcasing the
                future of innovation. The campaign captured the energy and
                excitement of the tech world, highlighting key moments that
                defined the event.
              </p>
            </div>
          </div>

          <div className="project-imgs">
            <div className="img">
              <img src={ProjectImg1} alt="" />
            </div>

            <div className="img">
              <img src={ProjectImg4} alt="" />
            </div>
          </div>
          <div className="project-imgs">
            <div className="img">
              <img src={ProjectImg3} alt="" />
            </div>

            <div className="img">
              <img src={ProjectImg2} alt="" />
            </div>
          </div>

          <div className="project-hero-img-3">
            <img src={ProjectHeroImg3} alt="" />
          </div>

          <div className="next-project-cta">
            <Link to="/">
              <h1>Next Project</h1>
            </Link>
          </div>
        </div>
      </div>
    </ReactLenis>
  );
};

export default Transition(SampleProject);
