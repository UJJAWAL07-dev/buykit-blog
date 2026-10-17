import { motion } from "framer-motion";
import "./Hero.css";

import { ComputersCanvas } from "./canvas";
import { fadeIn, textVariant } from "../utils/motion";

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="hero-copy-wrap">
        <div className="hero-accent" aria-hidden="true">
          <div className="hero-accent-dot" />
          <div className="hero-accent-line" />
        </div>

        <div className="hero-copy">
          <h1 className="hero-title">
            <span style={{ color: "#ffffff" }}>BUY</span>
            <motion.span
              variants={textVariant(0.5)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0.25 }}
              className="hero-name"
            >
              KIT
            </motion.span>
          </h1>

          <motion.p
            variants={fadeIn("", "", 0.1, 1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.25 }}
            className="hero-subtitle"
          >
            FRESH PERSPECTIVES <br className="hero-line-break" />
            ON EVERYTHING THAT MATTERS.
          </motion.p>
        </div>
      </div>

      <ComputersCanvas />

      <div className="hero-scroll-indicator">
        <a href="#about">
          <div className="hero-scroll-shell">
            <motion.div
              animate={{
                y: [0, 24, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop",
              }}
              className="hero-scroll-dot"
            />
          </div>
        </a>
      </div>
    </section>
  );
};

export default Hero;