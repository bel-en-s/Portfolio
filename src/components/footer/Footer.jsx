import { Link } from "react-router-dom";

import "./Footer.css";

const Footer = () => {
  return (
    <div className="footer">
      <div className="footer-col">
        <div className="footer-sub-col">
          <div className="footer-link">
            <Link to="https://www.youtube.com/@codegrid/">
              &#x2192; belen.seoane.palmieri@gmail.com
            </Link>
          </div>
          <div className="footer-link">
            <Link to="https://www.youtube.com/@codegrid/">
              &#x2192; Enquiries
            </Link>
          </div>
        </div>
        <div className="footer-sub-col">
          <div className="footer-link">
            <Link to="https://www.instagram.com/codegridweb/">
              &#x2192; Instagram
            </Link>
          </div>
          <div className="footer-link">
            <Link to="https://www.instagram.com/codegridweb/">
              &#x2192; Chat
            </Link>
          </div>
        </div>
      </div>

      <div className="footer-col">
        <div className="footer-link">
          <p>&copy; El Plieuge {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
