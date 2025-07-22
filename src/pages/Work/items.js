import SerenityVideo from "../../assets/work/rauw.mp4";
import TimelessVideo from "../../assets/work/Filoza.jpg";
import HarmonyImg from "../../assets/work/img3.jpg";
import Lizboa from "../../assets/work/Lizboa.png";
import LegacyImg from "../../assets/work/img5.jpg";
import EnclaveImg from "../../assets/work/img6.jpg";
import WhisperImg from "../../assets/work/img7.jpg";

import ProjectImg1 from "../../assets/work/boceto-rauw.jpeg";
import ProjectImg2 from "../../assets/work/rauw.png";
import ProjectImg3 from "../../assets/work/img4.jpg";
import ProjectImg4 from "../../assets/work/img3.jpg";
import ProjectImg5 from "../../assets/work/img2.jpg";
import ProjectImg6 from "../../assets/work/img1.jpg";

const workItems = [
  {
    workId: 0,
    workName: "Interactive Web Design",
    workImg: SerenityVideo,
    slug: "rauw",
    bgColor: "#cca459",
    workClient: "DHHN",
    workRole: "Interactive Designer",
    // workType: "WebGL Landing",
    workDescription: [
      `Together with the team at DHNN, I designed and developed an immersive WebGL landing page for Rauw Alejandro’s tour...`,
      `This is more than a website—it’s real-time visual storytelling...`,
      `The result is a digital scenography that amplifies the tour’s aesthetic...`
    ],
    images: [ProjectImg1, ProjectImg2, SerenityVideo], // importá antes
    link: "https://rauwalejandro.com/"
  },
  {
    workId: 1,
    workName: "Identity & E-commerce",
    slug: "filoza",
    workImg: TimelessVideo,
    bgColor: "#aeab74",
    workClient: "Filoza",
    workRole: "Digital Designer",
    workDescription: [
      `asdgfasdfoped an immersive WebGL landing page for Rauw Alejandro’s tour...`,
      `This is more than a website—it’s real-time visual storytelling...`,
      `The result is a digital scenography that amplifies the tour’s aesthetic...`
    ],
    // workType: "Branding & Web e-commerce",
  },
  {
    workId: 2,
    workName: "3D art & web",
    workImg: Lizboa,
    bgColor: "#ca7f88",
    workClient: "Tienda Lizboa",
    workRole: "Developer & Designer",
    // workType: "UI Design",
  },
  // {
  //   workId: 3,
  //   workName: "Enclave",
  //   workImg: EnclaveImg,
  //   bgColor: "#b29d7b",
  //   workClient: "Utopia Co.",
  //   workRole: "Specialist",
  //   workType: "Portfolio",
  // },
  // {
  //   workId: 4,
  //   workName: "Elegance",
  //   workImg: EleganceImg,
  //   bgColor: "#fbcd9c",
  //   workClient: "Elite Decor",
  //   workRole: "Designer",
  //   workType: "Cinema",
  // },
  // {
  //   workId: 5,
  //   workName: "Legacy",
  //   workImg: LegacyImg,
  //   bgColor: "#8d9a78",
  //   workClient: "Historians",
  //   workRole: "Artist",
  //   workType: "Concept Design",
  // },

  // {
  //   workId: 6,
  //   workName: "Whisper",
  //   workImg: WhisperImg,
  //   bgColor: "#db7f5e",
  //   workClient: "Retreaters",
  //   workRole: "Director",
  //   workType: "Film Design",
  // },
];

export default workItems;
