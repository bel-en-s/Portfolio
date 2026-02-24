import RauwVideo from "../../assets/work/rauw.mp4";
import RauwHover from "../../assets/work/rauw.png";

import FilozaVideo from "../../assets/work/Filoza.mp4";
import FilozaHover from "../../assets/work/Shop.png";
import LizboaVideo from "../../assets/work/Lizboa.mp4";
import LizboaHover from "../../assets/work/Lizboa.png";
import CandelaVideo from "../../assets/work/Despierta.mp4";
import CandelaHover from "../../assets/work/Candela.png";
import PhotographyVideo from "../../assets/work/Cartografías.mp4";

import RTSVideo from "../../assets/work/RTS.mp4";
import AWKHover from "../../assets/work/AWK.png";
import AWKVideo from "../../assets/work/AWK1.mp4";


const workItems = [
   {
    workId: 5,
    workName: "Gsap + Shaders webpage",
    slug: "rts",
    bgColor: "#cca459",
    workClient: "AWKRTS",
    workRole: "Interactive Tour Landing- 2025",
    workDescription: [
      `Together with the team at DHNN, I designed and developed an immersive WebGL landing page for Rauw Alejandro’s tour...`,
      `This is more than a website—it’s real-time visual storytelling...`,
      `The result is a digital scenography that amplifies the tour’s aesthetic...`,
    ],

    mediaType: "video",
    videoSrc: AWKVideo,
    hoverImageSrc: AWKHover,
    posterSrc: "",
  },
  {
    workId: 0,
    workName: "Rauw Alejandro",
    slug: "rauw-alejandro",
    bgColor: "#cca459",
    workClient: "DHNN",
    workRole: "Interactive Tour Landing- 2025",
    workDescription: [
      `Together with the team at DHNN, I designed and developed an immersive WebGL landing page for Rauw Alejandro’s tour...`,
      `This is more than a website—it’s real-time visual storytelling...`,
      `The result is a digital scenography that amplifies the tour’s aesthetic...`,
    ],
    link: "https://rauwalejandro.com/",
    mediaType: "video",
    videoSrc: RauwVideo,
    hoverImageSrc: RauwHover,
    posterSrc: "",
  },
     {
    workId: 3,
    workName: "Espacio Despierta Candela",
    slug: "espacio-despierta-candela",
    bgColor: "#5a8c7d",
    workClient: "Diseño Humano",
    workRole: "Brand Identity & Web Design - 2025",
    workDescription: [
      `Developed the brand identity and web design for Espacio Despierta Candela...`,
      `The project encompassed logo design, color palette, typography, and the design of a responsive website...`,
      `The goal was to create a brand that reflects the essence of the space and its purpose...`,
    ],
    mediaType: "video",
    videoSrc: CandelaVideo,
     hoverImageSrc: CandelaHover,
    posterSrc: "",
  },
  
  {
    workId: 1,
    workName: "Filoza E-commerce",
    slug: "filoza",
    bgColor: "#aeab74",
    workClient: "Filoza",
    workRole: "E-commerce & Web Design- 2024",
    workDescription: [
      `Designed and developed a full e-commerce experience for Filoza...`,
      `Focused on creating a seamless user journey from product discovery to checkout...`,
      `Implemented a modern and responsive design that reflects the brand's identity...`,
    ],
    mediaType: "video",
    videoSrc: FilozaVideo,
    hoverImageSrc: FilozaHover,
    posterSrc: "",
  },
 {
    workId: 2,
    workName: "Tienda Lizboa",
    slug: "tienda-lizboa",
    bgColor: "#ca7f88",
    workClient: "Lizboa Store",
    workRole: "3D Interactive Experience- 2023",
    workDescription: [
      `Created an immersive 3D interactive landing page for Tienda Lizboa...`,
      `Utilized WebGL and Three.js to build a captivating visual experience...`,
      `The project involved 3D modeling, animation, and interactive elements...`,
    ],
    mediaType: "video",
    videoSrc: LizboaVideo,
    posterSrc: "",
     hoverImageSrc: LizboaHover,
  },

];

export default workItems;
