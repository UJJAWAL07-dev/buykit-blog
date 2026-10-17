import React, { useEffect, useState } from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";
import {
  FaUser,
  FaFolderOpen,
  FaEnvelope,
} from "react-icons/fa";
import { motion } from "framer-motion";

import { navLinks } from "../constants";
import { menu, close } from "../assets";
import { fadeIn } from "../utils/motion";

const Navbar = () => {
  const [active, setActive] = useState("");
  const [toggle, setToggle] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const getIcon = (title) => {
    const icons = {
      About: FaUser,
      Articles: FaFolderOpen,
      Queries: FaEnvelope,
    };

    return icons[title] || FaUser;
  };

  const handleNavClick = (event, nav) => {
    event.preventDefault();

    setActive(nav.title);
    setToggle(false);

    const target = document.getElementById(nav.id);

    if (!target) {
      console.warn(`Navigation target not found: #${nav.id}`);
      return;
    }

    const section = target.closest("section") || target.parentElement || target;
    const navbarHeight = 100;

    const targetPosition =
      section.getBoundingClientRect().top +
      window.scrollY -
      navbarHeight;

    window.scrollTo({
      top: Math.max(0, targetPosition),
      behavior: "smooth",
    });

    window.history.replaceState(null, "", `#${nav.id}`);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;

      setScrolled(scrollTop > 100);

      if (
        window.innerHeight + scrollTop >=
        document.documentElement.scrollHeight - 50
      ) {
        const lastLink = navLinks[navLinks.length - 1];

        if (lastLink) {
          setActive(lastLink.title);
        }

        return;
      }

      let currentSection = "";

      for (const nav of navLinks) {
        const target = document.getElementById(nav.id);

        if (!target) continue;

        const section =
          target.closest("section") ||
          target.parentElement ||
          target;

        const rect = section.getBoundingClientRect();

        if (rect.top <= 150 && rect.bottom > 150) {
          currentSection = nav.title;
        }
      }

      if (scrollTop < 100) {
        currentSection = "";
      }

      setActive(currentSection);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const renderNavLinks = (isMobile = false) =>
    navLinks.map((nav) => {
      const IconComponent = getIcon(nav.title);

      return (
        <li
          key={nav.id}
          className={`${
            isMobile ? "mobile-nav-item" : "desktop-nav-item"
          } ${active === nav.title ? "is-active" : ""}`}
        >
          <a
            href={`#${nav.id}`}
            className={
              isMobile ? "mobile-nav-link" : "desktop-nav-link"
            }
            onClick={(event) => handleNavClick(event, nav)}
          >
            <IconComponent className="nav-link-icon" />
            {nav.title}
          </a>
        </li>
      );
    });

  return (
    <motion.nav
      variants={fadeIn("down", "spring", 0.2, 1)}
      initial="hidden"
      animate="show"
      className={`site-navbar ${
        scrolled ? "site-navbar--scrolled" : ""
      }`}
    >
      <div className="navbar-inner">
        <Link
          to="/"
          className="navbar-brand"
          onClick={() => {
            setActive("");
            setToggle(false);
            window.history.replaceState(
              null,
              "",
              window.location.pathname
            );
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
        >
          <img
            src="/buykit.jpg"
            alt="BuyKit logo"
            className="navbar-logo"
          />

          <p className="navbar-name">
            BUYKIT
            <span className="navbar-role"></span>
          </p>
        </Link>

        <ul className="desktop-nav">
          {renderNavLinks()}
        </ul>

        <div className="mobile-nav">
          <button
            type="button"
            className="mobile-menu-button"
            aria-label={
              toggle ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={toggle}
            onClick={() => setToggle((previous) => !previous)}
          >
            <img
              src={toggle ? close : menu}
              alt=""
              className="mobile-menu-icon"
            />
          </button>

          <div
            className={`mobile-menu-panel ${
              toggle ? "is-open" : ""
            }`}
          >
            <ul className="mobile-nav-list">
              {renderNavLinks(true)}
            </ul>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;