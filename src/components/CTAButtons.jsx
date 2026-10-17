import React, { useState, useEffect } from "react";
import "./CTAButtons.css";
import { motion, AnimatePresence } from "framer-motion";
import { FaRocket } from "react-icons/fa";

const CTAButtons = () => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            // Hide button once user scrolls past the hero section
            setIsVisible(window.scrollY <= 400);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleContactUs = () => {
        window.open("https://buykit.in", "_blank", "noopener,noreferrer");
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="cta-wrapper"
                    initial={{ opacity: 0, y: -20, x: 20 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: -20, x: 20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                >
                    <motion.button
                        onClick={handleContactUs}
                        className="cta-primary"
                        whileHover={{ y: -2, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        aria-label="Contact Us"
                    >
                        {/* Animated gradient background */}
                        <div
                            className="cta-primary-bg"
                            aria-hidden="true"
                        />

                        {/* Content */}
                        <div className="cta-primary-content">
                            <FaRocket
                                className="cta-icon-rocket"
                                aria-hidden="true"
                            />
                            <span>Contact Us</span>
                        </div>

                        {/* Pulse ring */}
                        <div
                            className="cta-primary-ring"
                            aria-hidden="true"
                        />
                    </motion.button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CTAButtons;