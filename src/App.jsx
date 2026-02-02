import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Menu from "./components/Menu/Menu";
import Home from "./pages/home/Home";
import ProjectDetail from "./pages/Project/ProjectDetail";
import Work from "./pages/Work/Work";
import Photos from "./pages/Photos/Photos";
import Project from "./pages/Project/Project";
import Gallery from "./pages/Gallery/Gallery";

import { AnimatePresence } from "framer-motion";
import "./App.css";

function App() {
  const location = useLocation();

  useEffect(() => {
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 1000);
  }, [location.pathname]);

  return (
    <>
      {/* <Menu /> */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route index element={<Home />} />
          <Route path="/work" element={<Work />} />
          <Route path="/photos" element={<Photos />} />
          <Route path="/project" element={<Project />} />
          <Route path="/project" element={<Project />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/project/:slug" element={<ProjectDetail />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;
