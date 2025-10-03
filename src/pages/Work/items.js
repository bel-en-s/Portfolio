import RauwVideo from "../../assets/work/rauw.mp4";
import FilozaVideo from "../../assets/work/Filoza.mp4"; // Asegúrate de tener este video
import LizboaVideo from "../../assets/work/lizboa.mp4"; // Asegúrate de tener este video
import CandelaVideo from "../../assets/work/despierta.mp4"; // Asegúrate de tener este video
import PhotographyVideo from "../../assets/work/Cartografías.mp4"; // Asegúrate de tener este video

const workItems = [
  {
    workId: 0,
    workName: "Rauw Alejandro",
    workImg: RauwVideo,
    slug: "rauw-alejandro",
    bgColor: "#cca459",
    workClient: "Sony Music",
    workRole: "Interactive Tour Landing",
    workDescription: [
      `Together with the team at DHNN, I designed and developed an immersive WebGL landing page for Rauw Alejandro’s tour...`,
      `This is more than a website—it’s real-time visual storytelling...`,
      `The result is a digital scenography that amplifies the tour’s aesthetic...`
    ],
    link: "https://rauwalejandro.com/"
  },
  {
    workId: 1,
    workName: "Filoza",
    workImg: FilozaVideo,
    slug: "filoza",
    bgColor: "#aeab74",
    workClient: "Filoza",
    workRole: "E-commerce & Web Design",
    workDescription: [
      `Designed and developed a full e-commerce experience for Filoza...`,
      `Focused on creating a seamless user journey from product discovery to checkout...`,
      `Implemented a modern and responsive design that reflects the brand's identity...`
    ],
  },
  {
    workId: 2,
    workName: "Tienda Lizboa",
    workImg: LizboaVideo,
    slug: "tienda-lizboa",
    bgColor: "#ca7f88",
    workClient: "Lizboa Store",
    workRole: "3D Interactive Experience",
    workDescription: [
      `Created an immersive 3D interactive landing page for Tienda Lizboa...`,
      `Utilized WebGL and Three.js to build a captivating visual experience...`,
      `The project involved 3D modeling, animation, and interactive elements...`
    ],
  },
  {
    workId: 3,
    workName: "Espacio Despierta Candela",
    workImg: CandelaVideo,
    slug: "espacio-despierta-candela",
    bgColor: "#5a8c7d",
    workClient: "Diseño Humano",
    workRole: "Brand Identity & Web Design",
    workDescription: [
      `Developed the brand identity and web design for Espacio Despierta Candela...`,
      `The project encompassed logo design, color palette, typography, and the design of a responsive website...`,
      `The goal was to create a brand that reflects the essence of the space and its purpose...`
    ],
  },
  {
    workId: 4,
    workName: "Photography Visualization",
    workImg: PhotographyVideo,
    slug: "photography-visualization",
    bgColor: "#3a4a5f",
    workClient: "Creative Studio",
    workRole: "Interactive 3D Platform",
    workDescription: [
      `Built an interactive 3D website for image visualization...`,
      `The platform allows users to explore photographs in a 3D space, providing a unique way to experience visual content...`,
      `Technologies used include Three.js, WebGL, and custom shaders for visual effects...`
    ],
  }
];

export default workItems;