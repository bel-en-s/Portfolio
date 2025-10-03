import React, { useState } from "react";
import { Link } from "react-router-dom";
import workItems from "./items";
import { IoMdArrowBack } from "react-icons/io";
import Transition from "../../components/transition/Transition";
import ShaderBackground from "./ShaderBackground";
import "./work.css";

const Work = () => {
  const [activeItem, setActiveItem] = useState(null);

  const handleTouchStart = (workId) => {
    setActiveItem(workId);
  };

  const handleTouchEnd = () => {
    setActiveItem(null);
  };

  return (
    <>
      <ShaderBackground />
      
      <div className="back-btn">
        <IoMdArrowBack /> <Link to="/">Back</Link>
      </div>

      <div className={`work-gallery ${activeItem !== null ? 'has-active-item' : ''}`}>
        {workItems.map((item) => (
          <Link 
            // to={`/project/${item.slug}`} 
            key={item.workId} 
            className={`work-item ${activeItem === item.workId ? 'active' : ''}`}
            onTouchStart={() => handleTouchStart(item.workId)}
            onTouchEnd={handleTouchEnd}
          >
            <div className="work-media">
              {item.workImg.endsWith(".mp4") ? (
                <video
                  src={item.workImg}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="work-preview"
                />
              ) : (
                <img
                  src={item.workImg}
                  alt={item.workName}
                  className="work-preview"
                />
              )}
            </div>
            <div className="work-info">
              <h3 className="work-title">{item.workName}</h3>
              <div className="work-meta">
                <span className="work-client">{item.workClient}</span>
                <span className="work-role">{item.workRole}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
};

export default Transition(Work);