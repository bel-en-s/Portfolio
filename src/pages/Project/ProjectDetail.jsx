import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { gsap } from "gsap";
import workItems from "../Work/items";
import "./project.css";

const ProjectDetail = () => {
  const { slug } = useParams();
  const project = workItems.find((item) => item.slug === slug);

  useEffect(() => {
    gsap.set(["h1", "p"], { y: 50, opacity: 0 });
    gsap.set(".img", {
      clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
    });

    setTimeout(() => {
      gsap.to(["h1", "p"], {
        y: 0,
        opacity: 1,
        stagger: 0.075,
        duration: 1,
        ease: "power3.out",
      });
      gsap.to(".img", {
        clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
        duration: 1,
        ease: "power4.inOut",
      });
    }, 500);
  }, []);

  if (!project) return <p>Project not found</p>;

  return (
    <div className="project">
      <div className="project-intro">
        <Link to="/work" className="back-btn">Back</Link>
        <h1>{project.workName}</h1>
      </div>

      <div className="project-data">
        <div className="project-info">
          <p className="copy-header">About</p>
          {project.workDescription?.map((para, i) => (
            <p key={i}>{para}</p>
          ))}

          {project.link && (
            <p className="link">
              <a href={project.link} target="_blank" rel="noopener noreferrer">
                Live Demo
              </a>
            </p>
          )}
        </div>

        <div className="project-images">
          {project.images?.map((img, i) => (
            <div className="img" key={i}>
              {img.endsWith(".mp4") ? (
                <video
                  src={img}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="work-preview"
                />
              ) : (
                <img src={img} alt={`${project.workName} ${i + 1}`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
