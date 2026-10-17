import React from "react";
import './Tech.css';
import { motion } from "framer-motion";

import {
  FaLaptopCode,
  FaBrain,
  FaMobileAlt,
  FaCode,
  FaMicrochip,
  FaGlobe,
  FaShieldAlt,
  FaBookOpen,
  FaStar,
} from "react-icons/fa";

import { SectionWrapper } from "../hoc";
import { technologies } from "../constants";
import { styles } from "../styles";
import { fadeIn, textVariant } from "../utils/motion";

const Tech = () => {
  return (
    <>
      {/* Section Heading */}
      <motion.div
        variants={textVariant()}
        className='tech-heading'
      >
        <p className={styles.sectionSubText}>
          What we explore
        </p>

        <h2 className={styles.sectionHeadText}>
          Technology, Without the Noise.
          <FaLaptopCode className="tech-heading-icon" />
        </h2>
      </motion.div>

      {/* Section Introduction */}
      <div className='tech-intro'>
        <motion.p
          variants={fadeIn("", "", 0.1, 1)}
          className='tech-description'
        >
          We explore the technologies, ideas, products and digital trends
          shaping the world around us — breaking down complex topics into
          insights that are easy to understand and worth knowing.
        </motion.p>
      </div>

      {/* BuyKit Categories */}
      <div className='tech-grid'>
        {technologies.map((technology, index) => {
          const Icon = technology.icon;

          return (
            <motion.div
              className='tech-card'
              key={technology.name}
              variants={fadeIn("up", "spring", 0.08 * index, 0.75)}
            >
              <div className='tech-icon-wrap'>
                <Icon className='tech-icon' />
              </div>

              <h3 className='tech-name'>
                {technology.name}
              </h3>

              <span className='tech-level'>
                {technology.label || "EXPLORE"}
              </span>
            </motion.div>
          );
        })}
      </div>
    </>
  );
};

export default SectionWrapper(Tech, "skills");