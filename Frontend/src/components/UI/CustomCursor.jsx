import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const CustomCursor = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [cursorVariant, setCursorVariant] = useState("default");

    useEffect(() => {
        const mouseMove = (e) => {
            setMousePosition({
                x: e.clientX,
                y: e.clientY
            });
        };

        window.addEventListener("mousemove", mouseMove);

        // Add event listeners for hoverable elements
        const handleMouseEnter = () => setCursorVariant("text");
        const handleMouseLeave = () => setCursorVariant("default");

        const elements = document.querySelectorAll("a, button, input, textarea, select, .cursor-hover");
        elements.forEach(el => {
            el.addEventListener("mouseenter", handleMouseEnter);
            el.addEventListener("mouseleave", handleMouseLeave);
        });

        // Mutation observer to handle dynamic content
        const observer = new MutationObserver(() => {
            const newElements = document.querySelectorAll("a, button, input, textarea, select, .cursor-hover");
            newElements.forEach(el => {
                el.removeEventListener("mouseenter", handleMouseEnter); // Cleanup first to avoid dupes
                el.removeEventListener("mouseleave", handleMouseLeave);
                el.addEventListener("mouseenter", handleMouseEnter);
                el.addEventListener("mouseleave", handleMouseLeave);
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            window.removeEventListener("mousemove", mouseMove);
            elements.forEach(el => {
                el.removeEventListener("mouseenter", handleMouseEnter);
                el.removeEventListener("mouseleave", handleMouseLeave);
            });
            observer.disconnect();
        };
    }, []); // Empty dependency mainly references mount; dynamic updates handled by observer

    const variants = {
        default: {
            x: mousePosition.x - 8,
            y: mousePosition.y - 8,
            height: 16,
            width: 16,
            backgroundColor: "white",
            mixBlendMode: "difference"
        },
        text: {
            x: mousePosition.x - 40,
            y: mousePosition.y - 40,
            height: 80,
            width: 80,
            backgroundColor: "white",
            mixBlendMode: "difference"
        }
    };

    return (
        <motion.div
            className="fixed top-0 left-0 bg-white rounded-full pointer-events-none z-[9999]"
            variants={variants}
            animate={cursorVariant}
            transition={{
                type: "spring",
                stiffness: 150,
                damping: 15,
                mass: 0.1
            }}
        />
    );
};

export default CustomCursor;
