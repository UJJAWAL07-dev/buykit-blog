import React from "react";
import './About.css';
import { FaUserGraduate } from 'react-icons/fa';
import Tilt from "react-parallax-tilt";
import { motion } from "framer-motion";

import { styles } from "../styles";
import { github, potrait } from "../assets";
import { services } from "../constants";
import { SectionWrapper } from "../hoc";
import { fadeIn, textVariant } from "../utils/motion";

const ServiceCard = ({ index, title, icon }) => (
  <Tilt className='xs:w-[250px] w-full'>
    <motion.div
      variants={fadeIn("right", "spring", index * 0.5, 0.75)}
      className='w-full green-pink-gradient p-[1px] rounded-[20px] shadow-card'
    >
      <div
        options={{
          max: 45,
          scale: 1,
          speed: 450,
        }}
        className='bg-tertiary rounded-[20px] py-5 px-12 min-h-[280px] flex justify-evenly items-center flex-col'
      >
        <img
          src={icon}
          alt='service'
          className='w-16 h-16 object-contain'
        />

        <h3 className='text-white text-[20px] font-bold text-center font-["Oswald"] tracking-wide'>
          {title}
        </h3>
      </div>
    </motion.div>
  </Tilt>
);

const About = () => {
  return (
    <>
      {/* Section Heading */}
      <motion.div variants={textVariant()}>
        <p
          className={`${styles.sectionSubText} font-["Playfair_Display"] italic tracking-wider text-secondary text-[18px]`}
        >
          Introduction
        </p>

        <h2
          className={`${styles.sectionHeadText} font-["Oswald"] font-bold uppercase tracking-wider`}
        >
          About BuyKit. <FaUserGraduate className="inline-block" />
        </h2>
      </motion.div>

      {/* BuyKit Introduction */}
      <div className='flex flex-col-reverse gap-10 md:flex-row md:items-center'>

        <motion.p
          variants={fadeIn("", "", 0.1, 1)}
          className='m-[6px] p-[8px] text-secondary text-[17px] max-w-3xl leading-[30px] font-["Inter"] font-normal'
        >
          <strong className="font-['Orbitron'] text-[#915eff]">
            BuyKit
          </strong>{" "}
          is a technology-focused platform built to bring a fresh perspective
          to everything that matters in the digital world. From{" "}
          <strong className="font-['Orbitron'] text-[#915eff]">
            AI
          </strong>{" "}
          and emerging technologies to software, gadgets, apps, cybersecurity,
          and the internet, we explore the ideas and innovations shaping the
          future.

          <br />
          <br />

          Our goal is simple: make technology easier to understand, more
          interesting to explore, and genuinely useful in everyday life.
          Whether you're looking for the latest{" "}
          <strong className="font-['Orbitron'] text-[#915eff]">
            tech insights
          </strong>
          , practical guides, product discoveries, or thoughtful perspectives
          on what's next, BuyKit brings it all together in one place.

          <br />
          <br />

          <strong className="font-['Orbitron'] text-[#915eff]">
            Stay curious. Stay informed. See technology differently.
          </strong>
        </motion.p>

        {/* BuyKit Visual */}
        <motion.div
          variants={fadeIn("left", "", 0.2, 1)}
          className='w-full md:w-auto flex justify-center'
        >
          <div className='relative w-[200px] h-[200px] md:w-[250px] md:h-[250px]'>

            <img
              src={potrait}
              alt='BuyKit'
              className='w-full h-full object-cover rounded-full border-4 border-white/10 shadow-card'
            />

            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#915eff] to-transparent opacity-30" />

          </div>
        </motion.div>

      </div>

      {/* Service Cards */}
      <div className='mt-20 flex flex-wrap gap-10'>
        {services.map((service, index) => (
          <ServiceCard
            key={service.title}
            index={index}
            {...service}
          />
        ))}
      </div>
    </>
  );
};

export default SectionWrapper(About, "about");