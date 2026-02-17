import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Menu from "./components/Menu/Menu";
import Home from "./pages/Home/Home";
import SmoothScroll from "./components/SmoothScroll/SmoothScroll";

import ProjectDetail from "./pages/Project/ProjectDetail";
import Work from "./pages/Work/Work";
import Photos from "./pages/Photos/Photos";
import Project from "./pages/Project/Project";
import Gallery from "./pages/Gallery/Gallery";
import { AnimatePresence } from "framer-motion";
import "./App.css";

function NotFound() {
  return (
    <div style={{ padding: "24px" }}>
      <h1>404</h1>
      <p>Esta página no existe.</p>
    </div>
  );
}

function App() {
  const location = useLocation();

  useEffect(() => {
    const t = setTimeout(() => window.scrollTo(0, 0), 1000);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <>
     <SmoothScroll />
      <Menu />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route index element={<Home />} />
          <Route path="/work" element={<Work />} />
          <Route path="/photos" element={<Photos />} />
          <Route path="/project" element={<Project />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/project/:slug" element={<ProjectDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;
