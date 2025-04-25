import { Link } from "react-router-dom";
import { ReactLenis, useLenis } from "lenis/react";

import "./Information.css";

import Transition from "../../components/transition/Transition";

import {
  services,
  campaigns,
  recognition,
  journey,
  collaborations,
  exhibitions,
  press,
} from "./info";

const Information = () => {
  const lenis = useLenis(({ scroll }) => {});

  return (
    <ReactLenis root>
      <div className="information">
        <div className="container">
          <h1>
            Aiden Brooks is a multidisciplinary Design & Art Director driven by
            a deep passion for creating visually compelling and meaningful
            experiences. With a focus on blending creativity, strategy, and
            cutting-edge technology, Aiden partners with like-minded innovators
            and brands to craft work that resonates deeply with audiences.
          </h1>
          <div className="info-services">
            <div className="col">
              <div className="sub-col">
                <ul>
                  {services.map((item) => (
                    <li key={item.id}>&#x2192; {item.text}</li>
                  ))}
                </ul>
              </div>
              <div className="sub-col">
                <ul>
                  {campaigns.map((item) => (
                    <li key={item.id}>&#x2192; {item.text}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="col">
              <p>
                Let’s explore new possibilities together. Whether you have a
                project in mind or just want to brainstorm ideas, I'm always
                excited to dive into new challenges. Ready to make something
                amazing? Let's get started.
              </p>
              <div className="contact-link">
                <Link to="/">&#x2192; Let's Connect</Link>
              </div>
            </div>
          </div>
          <div className="info-content">
            <div className="col">
              <div className="awards">
                <p>Recognition</p>
                <div className="divider"></div>
                <ul>
                  {recognition.map((item) => (
                    <li key={item.id}>&#x2192; {item.text}</li>
                  ))}
                </ul>
              </div>

              <div className="experience">
                <p>Professional Journey</p>
                <div className="divider"></div>
                <ul>
                  {journey.map((item) => (
                    <li key={item.id}>&#x2192; {item.text}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="col">
              <div className="selected-clients">
                <p>Collaborations</p>
                <div className="divider"></div>
                <ul>
                  {collaborations.map((item) => (
                    <li key={item.id}>&#x2192; {item.text}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="info-content-2">
            <div className="col">
              <p>Exhibitions, Talks, and Workshops</p>
              <div className="divider"></div>
              <ul>
                {exhibitions.map((item) => (
                  <li key={item.id}>&#x2192; {item.text}</li>
                ))}
              </ul>
            </div>
            <div className="col">
              <p>Press</p>
              <div className="divider"></div>
              <ul>
                {press.map((item) => (
                  <li key={item.id}>&#x2192; {item.text}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ReactLenis>
  );
};

export default Transition(Information);
