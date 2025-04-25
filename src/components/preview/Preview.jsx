import { useState, useEffect } from "react";

import "./Preview.css";

import { previewImgs } from "./previewImages";
import tickSfx from "../../assets/sfx/tick.wav";

const defaultPreviewImg = previewImgs[0];
const buffer = 100;

const Preview = () => {
  const [previewImg, setPreviewImg] = useState(defaultPreviewImg);

  useEffect(() => {
    const tickSound = new Audio(tickSfx);

    const handleScroll = () => {
      const position = window.scrollY;
      const index = Math.floor(position / buffer) % previewImgs.length;
      const selectedPreviewImg = previewImgs[index];
      if (selectedPreviewImg === previewImg) {
        return;
      }
      setPreviewImg(selectedPreviewImg);
      tickSound.play();
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [previewImg]);

  return (
    <div className="archive-preview">
      <img src={previewImg} alt="currently selected source" />
    </div>
  );
};

export default Preview;
