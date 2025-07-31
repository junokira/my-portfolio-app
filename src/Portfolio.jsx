import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Import AnimatePresence for exit animations
import { PenTool, LayoutGrid, Globe, Search, Code, ChevronRight, ChevronDown, X, TrendingUp, Link, FileText, BarChart2, Monitor, Users, Menu } from "lucide-react"; // Import Menu icon for mobile navigation

/**
 * CursorFollower Component
 * Renders a small element that follows the cursor and scales based on mouse movement speed.
 * This component is now hidden on mobile screens.
 */
const CursorFollower = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const lastMousePosition = useRef({ x: 0, y: 0 });
  const lastTimestamp = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTimestamp.current;

      // Calculate distance moved
      const dx = e.clientX - lastMousePosition.current.x;
      const dy = e.clientY - lastMousePosition.current.y; 
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Calculate speed (pixels per millisecond)
      const speed = distance / deltaTime;

      // Map speed to scale, clamp values to prevent extreme scaling
      // Base scale is 1, max scale could be 2 or 3 depending on desired effect
      const newScale = Math.min(2, 1 + speed * 0.1); // Adjust 0.1 for sensitivity

      setMousePosition({ x: e.clientX, y: e.clientY });
      setScale(newScale);

      lastMousePosition.current = { x: e.clientX, y: e.clientY };
      lastTimestamp.current = currentTime;
    };

    // Only add event listener if on a desktop-like device (based on window width)
    // This is a simple check, a more robust solution might use media queries or touch detection
    if (window.innerWidth >= 768) { // Tailwind's 'md' breakpoint is 768px
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (window.innerWidth >= 768) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  return (
    // This div is hidden on mobile screens (md:hidden)
    <motion.div
      className="fixed top-0 left-0 w-4 h-4 rounded-full bg-white/20 pointer-events-none z-50 hidden md:block"
      style={{
        translateX: mousePosition.x - 8, // Adjust by half of w/h to center the dot
        translateY: mousePosition.y - 8, // Adjust by half of w/h to center the dot
        scale,
      }}
      transition={{ type: "tween", ease: "easeOut", duration: 0.1 }}
    />
  );
};

/**
 * MobileAmbientLight Component
 * Renders a subtle, pulsating radial light effect visible only on mobile screens.
 */
const MobileAmbientLight = () => {
  return (
    <motion.div
      className="fixed inset-0 z-0 md:hidden pointer-events-none" // Hidden on desktop, visible on mobile
      style={{
        background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08), transparent 70%)`,
      }}
      animate={{
        scale: [1, 1.05, 1], // Subtle pulse effect
        opacity: [0.8, 0.9, 0.8], // Subtle opacity change
      }}
      transition={{
        duration: 4, // Slow pulse
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};


/**
 * ExpandablePhotosWidget Component
 * Manages the display of a collection of photos with an expand/collapse feature.
 * It now receives isExpanded and setIsExpanded as props from its parent to synchronize.
 */
const ExpandablePhotosWidget = ({ isExpanded, setIsExpanded, setSelectedImage }) => {
  // Array of all photo URLs. Added more placeholders for better testing.
  const allPhotos = [
    "https://i.ibb.co/21b1s0nj/logo.png",
    "https://i.ibb.co/p7297MR/vo0id-logo.png",
    "https://i.ibb.co/PGFQkrJM/think.png",
    "https://i.ibb.co/9mgwLzSG/clouds-1.png",
    "https://i.ibb.co/MxTwCzyd/handddd.png",
    "https://i.ibb.co/nqWwwQd0/kopoai-grey.png",
    "https://placehold.co/150x150/FFFF00/000000?text=Logo+7",
    "https://placehold.co/150x150/800080/FFFFFF?text=Logo+8",
    "https://placehold.co/150x150/FFA500/000000?text=Logo+9",
    "https://placehold.co/150x150/00FFFF/000000?text=Logo+10",
    "https://placehold.co/150x150/FF00FF/000000?text=Logo+11",
    "https://placehold.co/150x150/008080/FFFFFF?text=Logo+12",
    "https://placehold.co/150x150/800000/FFFFFF?text=Logo+13",
    "https://placehold.co/150x150/008000/FFFFFF?text=Logo+14",
    "https://placehold.co/150x150/000080/FFFFFF?text=Logo+15",
    "https://placehold.co/150x150/808000/FFFFFF?text=Logo+16",
    "https://placehold.co/150x150/800080/FFFFFF?text=Logo+17",
    "https://placehold.co/150x150/008080/FFFFFF?text=Logo+18",
    "https://placehold.co/150x150/808080/FFFFFF?text=Logo+19",
    "https://placehold.co/150x150/C0C0C0/000000?text=Logo+20",
    "https://placehold.co/150x150/FFD700/000000?text=Logo+21",
  ];

  // Show 6 logos (2 rows of 3) when collapsed, 18 when expanded
  const collapsedCount = 6;
  const expandedCount = 18;
  const visiblePhotos = isExpanded ? allPhotos.slice(0, expandedCount) : allPhotos.slice(0, collapsedCount);

  // Define the fixed height for each individual logo wrapper (e.g., 100px for a square image)
  const logoWrapperSize = 100;
  // Define the gap size between grid items (Tailwind's gap-6 is 24px for better visual balance)
  const gapSize = 24;
  // Standard padding for the inner container (from Tailwind's p-3)
  const containerPadding = 12;

  // Calculate the total height of the grid content when expanded (logos + internal gaps)
  const numRowsWhenExpanded = Math.ceil(expandedCount / 3); // 6 rows
  const numRowsWhenCollapsed = Math.ceil(collapsedCount / 3); // 2 rows
  const actualGridContentHeightExpanded = (numRowsWhenExpanded * logoWrapperSize) + Math.max(0, (numRowsWhenExpanded - 1) * gapSize);
  const actualGridContentHeightCollapsed = (numRowsWhenCollapsed * logoWrapperSize) + Math.max(0, (numRowsWhenCollapsed - 1) * gapSize);
  // Calculate the total height of the inner container when expanded/collapsed, including its fixed padding
  const expandedContainerHeight = actualGridContentHeightExpanded + (containerPadding * 2);
  const collapsedContainerHeight = actualGridContentHeightCollapsed + (containerPadding * 2);

  return (
    <motion.div
      className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-4 space-y-2 flex flex-col justify-between"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Clickable header to toggle expansion */}
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h3 className="text-white text-lg font-semibold">Photos</h3>
          <p className="text-gray-400 text-sm">Library · {allPhotos.length} Photos</p>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-white/50 transition-transform duration-300 transform rotate-180" />
        ) : (
          <ChevronRight className="w-4 h-4 text-white/50 transition-transform duration-300" />
        )}
      </div>
      <div
        className="rounded-xl overflow-hidden bg-white/10 mt-2 px-3 py-3 flex items-center justify-center"
        style={{
          height: isExpanded ? `${expandedContainerHeight}px` : `${collapsedContainerHeight}px`,
          transition: 'height 0.3s ease-out',
        }}
      >
        <motion.div
          className="grid grid-cols-3 gap-6 w-full h-full items-center justify-center"
          layout
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* Always render the first 6 logos in the same position */}
          {allPhotos.slice(0, collapsedCount).map((url, i) => (
            <motion.div
              key={i}
              className="aspect-square w-full max-w-[100px] mx-auto cursor-pointer flex items-center justify-center"
              initial={false}
              animate={{
                opacity: 1,
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              onClick={() => setSelectedImage(url)}
            >
              <img
                src={url}
                alt={`Logo ${i + 1}`}
                className="w-20 h-20 object-contain rounded-lg"
                onContextMenu={(e) => e.preventDefault()}
                style={{ WebkitTouchCallout: "none" }}
              />
            </motion.div>
          ))}
          {/* When expanded, render the next 12 logos below */}
          {isExpanded && allPhotos.slice(collapsedCount, expandedCount).map((url, i) => (
            <motion.div
              key={collapsedCount + i}
              className="aspect-square w-full max-w-[100px] mx-auto cursor-pointer flex items-center justify-center"
              initial={false}
              animate={{
                opacity: 1,
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              onClick={() => setSelectedImage(url)}
            >
              <img
                src={url}
                alt={`Logo ${collapsedCount + i + 1}`}
                className="w-20 h-20 object-contain rounded-lg"
                onContextMenu={(e) => e.preventDefault()}
                style={{ WebkitTouchCallout: "none" }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
      {isExpanded && allPhotos.length > collapsedCount && (
        <p className="text-gray-500 text-xs mt-2 text-center">Click arrow to collapse</p>
      )}
    </motion.div>
  );
};

/**
 * AIDevWidget Component
 * Manages the display of the AI Dev content with an expand/collapse feature for its description.
 * Its description expansion is now synchronized with the Photos widget's expansion.
 */
const AIDevWidget = ({ isExpanded, setIsExpanded }) => { // Now accepts isExpanded and setIsExpanded
  // The description expansion state is now directly tied to the shared isExpanded state
  const showAIDevDescription = isExpanded;

  // Ref for the generative canvas
  const canvasRef = useRef(null);

  // Import collapsedContainerHeight from ExpandablePhotosWidget context
  // For this file, just recalculate it here to match
  const logoWrapperSize = 100;
  const gapSize = 24;
  const containerPadding = 12;
  const numRowsWhenCollapsed = 2;
  const actualGridContentHeightCollapsed = (numRowsWhenCollapsed * logoWrapperSize) + Math.max(0, (numRowsWhenCollapsed - 1) * gapSize);
  const collapsedContainerHeight = actualGridContentHeightCollapsed + (containerPadding * 2);

  // Effect to draw the generative animation on the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Exit if canvas element is not found
    const ctx = canvas.getContext("2d");
    let frame = 0; // Variable to hold the animation frame ID
    let animationFrameId;

    const draw = () => {
      // Set canvas dimensions to match its CSS size
      const w = canvas.width = canvas.offsetWidth;
      const h = canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h); // Clear the canvas for the next frame

      // Draw radial pattern with lines and animated dots
      const centerX = w / 2;
      const centerY = h / 2;
      const radius = Math.min(w, h) / 2 - 20; // Leave some margin
      
      // Number of lines radiating from center
      const numLines = 18;
      
      ctx.strokeStyle = '#000000'; // Black lines
      ctx.lineWidth = 1;
      ctx.fillStyle = '#000000'; // Black dots

      for (let i = 0; i < numLines; i++) {
        const angle = (i / numLines) * 2 * Math.PI;
        const endX = centerX + radius * Math.cos(angle);
        const endY = centerY + radius * Math.sin(angle);

        // Draw the radiating line
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Draw animated dots along the line with outward flow
        const numDots = 4;
        for (let j = 1; j <= numDots; j++) {
          // Create a wave that flows outward from center
          const baseRadius = radius * (j / (numDots + 1));
          const wavePhase = frame * 0.015; // Slower, more hypnotic speed
          const dotPhase = wavePhase - (j * 0.5); // Each dot follows the wave with delay

          // Use a smooth sine wave that creates outward flow
          const waveOffset = Math.sin(dotPhase + Math.PI) * 15; // Adjusted wave phase
          const dotRadius = baseRadius + waveOffset;

          const dotX = centerX + dotRadius * Math.cos(angle);
          const dotY = centerY + dotRadius * Math.sin(angle);

          // Vary dot size based on position in the wave - make them bigger
          const sizeMultiplier = Math.sin(dotPhase + Math.PI/2) * 0.5 + 1.2; // Increased base size from 0.7 to 1.2
          const dotSize = 3 * sizeMultiplier; // Increased base size from 2 to 3

          ctx.beginPath();
          ctx.arc(dotX, dotY, dotSize, 0, 2 * Math.PI);
          ctx.fill();
        }
      }

      frame++;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw(); // Start the animation loop when component mounts

    // Cleanup function: stop the animation when component unmounts
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  return (
    <motion.div // Added motion.div here
      className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-4 space-y-4 flex flex-col"
      whileHover={{ scale: 1.02 }} // Apply hover effect
      transition={{ duration: 0.2 }} // Apply transition
    >
      {/* Header with dynamic arrow, now clickable to toggle the shared state */}
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)} // Toggles the shared state
      >
        <div>
          <h3 className="text-white text-lg font-semibold">AI Dev</h3>
          <p className="text-gray-400 text-sm">v0id - Synthetic Mind · Recents</p>
        </div>
        {/* Arrow icon reflects the shared expansion state */}
        {showAIDevDescription ? (
          <ChevronDown className="w-4 h-4 text-white/50 transition-transform duration-300 transform rotate-180" />
        ) : (
          <ChevronRight className="w-4 h-4 text-white/50 transition-transform duration-300" />
        )}
      </div>
      <div
        className="rounded-xl overflow-hidden bg-[#bdc0a7] mt-2 px-3 py-3 flex items-center justify-center"
        style={{
          height: `${collapsedContainerHeight}px`,
          transform: isExpanded ? 'translateY(0px)' : 'translateY(16px)',
        }}
      >
        {/* Canvas for generative animation - using ref */}
        <canvas ref={canvasRef} className="w-[calc(100%-24px)] h-[calc(100%-24px)]"></canvas>
      </div>
      {/* New description for Synthetic Mind - conditionally rendered and animated */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: isExpanded ? 1 : 0, height: isExpanded ? 'auto' : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        {isExpanded && (
          <p className="text-gray-400 text-sm">
            The Synthetic Mind, a core project by v0id, is an interactive AI art piece designed to simulate complex cognitive processes. It maintains a dynamic semantic network of concepts, an episodic memory of past thoughts, and a set of internal drives (curiosity, purpose, etc.). This architecture allows the mind to generate reflective thoughts by prompting a large language model with rich context, including recent internal monologues, key focus concepts, and its evolving identity. It can also ingest external data, like Wikipedia summaries, to simulate continuous learning and growth. The result is a compelling, real-time display of an AI's internal world, inviting users to observe and interact with a truly evolving digital consciousness, offering a unique glimpse into an artificial mind's inner workings.
          </p>
        )}
      </motion.div>
    </motion.div>
  );
};

/**
 * LargeImageViewer Component
 * Displays a selected image in a compact, integrated view.
 */
const LargeImageViewer = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null; // Don't render if no image is selected

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" // Padding for the overall overlay
      onClick={onClose} // Close when clicking outside the image
    >
      {/* Main image container with the desired border and shadow */}
      <div 
        // Changed sizing to use w-full max-w-sm for mobile, md:max-w-2xl for desktop,
        // and aspect-square to force a square shape.
        className="relative flex flex-col items-center justify-center bg-white/10 shadow-2xl rounded-xl border-2 border-gray-600 p-4 w-full max-w-sm md:max-w-2xl aspect-square"
        style={{ outline: 'none' }} // Ensure no outline
        onClick={(e) => e.stopPropagation()} // Prevent click from propagating to overlay
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-8 h-8 bg-red-600 hover:bg-red-700 text-white transition-all duration-200 z-10 rounded-full flex items-center justify-center shadow-lg border border-red-400"
          aria-label="Close image"
        >
          <X size={16} />
        </button>
        <img
          src={imageUrl}
          alt="Large view"
          // Crucial: max-w-full and max-h-full ensure image scales down proportionally.
          // object-contain ensures aspect ratio is maintained, preventing stretching.
          // w-full h-full ensures it tries to fill the available space, but max-w/h will constrain it.
          className="w-full h-full max-w-full max-h-full object-contain rounded-xl"
          style={{ 
            border: 'none', 
            outline: 'none', 
            WebkitUserSelect: "none", 
            MozUserSelect: "none",
            msUserSelect: "none",
            userSelect: "none",
            WebkitTouchCallout: "none"
          }} // Fix: Prevent long-press save menu on iOS
          onContextMenu={(e) => e.preventDefault()} // Fix: Prevent right-click and long-press
        />
      </div>
    </motion.div>
  );
};


/**
 * SkillCard Component
 * Displays a single skill with its icon and description.
 */
const SkillCard = ({ skill }) => {
  const [showDescription, setShowDescription] = useState(false);

  return (
    <motion.div
      className="rounded-xl bg-white/5 border border-white/10 p-4 flex flex-col items-center justify-center text-center cursor-pointer relative overflow-hidden"
      whileHover={{ scale: 1.05 }}
      onTap={() => setShowDescription(!showDescription)} // Use onTap for touch devices
      onHoverStart={() => setShowDescription(true)} // Show on hover for desktop
      onHoverEnd={() => setShowDescription(false)} // Hide on hover end for desktop
    >
      {/* Skill Icon - fixed aspect ratio */}
      <div className="w-16 h-16 flex items-center justify-center mb-2 aspect-square">
        <img src={skill.iconUrl} alt={skill.name} className="w-full h-full object-contain invert" />
      </div>
      <h4 className="text-lg font-semibold text-white">{skill.name}</h4>
      {/* Description Overlay */}
      <motion.div
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: showDescription ? 1 : 0, y: showDescription ? "0%" : "100%" }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 text-white text-sm"
      >
        <p>{skill.description}</p>
      </motion.div>
    </motion.div>
  );
};

/**
 * ProjectCard Component
 * Displays a single project with its image, title, and description.
 * It now manages its own expanded state, but is controlled by a parent to ensure only one is open.
 */
const ProjectCard = ({ project, isExpanded, onSelect }) => { // isExpanded and onSelect props
  const toggleExpansion = () => {
    onSelect(project.id); // Notify parent to set this project as selected (or deselect if already selected)
  };

  return (
    <motion.div
      className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-4 space-y-2 flex flex-col justify-between cursor-pointer"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onClick={toggleExpansion} // Toggle expansion on click
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-white text-lg font-semibold">{project.name}</h3>
          <p className="text-gray-400 text-sm">{project.category}</p>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-white/50 transition-transform duration-300 transform rotate-180" />
        ) : (
          <ChevronRight className="w-4 h-4 text-white/50 transition-transform duration-300" />
        )}
      </div>
      {/* Project Image/Visual Area - mimicking the inner containers of Spaces */}
      <div className="rounded-xl overflow-hidden mt-2 p-3 flex items-center justify-center h-24"
        style={{ backgroundColor: project.backgroundColor || "rgba(255,255,255,0.1)" }}> {/* Use project.backgroundColor */}
        {project.id === "awaken" ? (
          <span className="text-white text-3xl font-anton">AWAKEN</span> // Anton font for AWAKEN
        ) : project.id === "vaulted" ? ( // Add condition for vaulted
          <span className="text-white text-3xl font-sans font-bold">VAULTED</span> // Different font and style for Vaulted
        ) : project.id === "horizon" ? ( // Add condition for Horizon
          <span className="text-white text-3xl font-sans font-thin">HORIZON</span> // Thin text for Horizon
        ) : project.id === "onthewall" ? ( // Add condition for OnTheWall
          <span className="text-white text-3xl font-anton">ONTHEWALL</span> // Bad Hawk (using Anton as a bold example)
        ) : (
          <img
            src={project.imageUrl}
            alt={project.name}
            className="w-full h-full object-contain p-1" // object-contain and p-1 for fit and buffer
            onContextMenu={(e) => e.preventDefault()}
            style={{ WebkitTouchCallout: "none" }}
          />
        )}
      </div>
      
      {/* Technologies and Links - always visible */}
      {project.technologies && project.technologies.length > 0 && (
        <div className="mt-2">
          <p className="text-gray-300 text-xs font-semibold">Technologies:</p>
          <ul className="flex flex-wrap gap-1 mt-1">
            {project.technologies.map((tech, i) => (
              <li key={i} className="bg-white/10 text-gray-300 text-xs px-2 py-0.5 rounded-full">
                {tech}
              </li>
            ))}
          </ul>
        </div>
      )}
      {project.links && project.links.length > 0 && (
        <div className="mt-2">
          <p className="text-gray-300 text-xs font-semibold">Links:</p>
          <ul className="flex flex-wrap gap-2 mt-1">
            {project.links.map((link, i) => (
              <li key={i}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-gray-300 text-xs underline flex items-center gap-1" // Changed text-blue-400 to text-white
                  onClick={(e) => e.stopPropagation()} // Prevent card from collapsing when clicking link
                >
                  {link.name} <Link size={12} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Expanded Description - conditionally rendered */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="text-gray-400 text-sm mt-2">{project.fullDescription}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


/**
 * ExperienceItem Component
 * Displays a single work experience entry.
 */
const ExperienceItem = ({ experience }) => (
  <motion.div
    className="bg-white/5 border border-white/10 rounded-xl p-6 relative overflow-hidden"
    whileHover={{ backgroundColor: "rgba(255,255,255,0.08)" }}
  >
    <div className="flex justify-between items-start mb-2">
      <div>
        <h3 className="text-xl font-semibold text-white">{experience.role}</h3>
        <p className="text-gray-400 text-md">{experience.company}</p>
      </div>
      <p className="text-gray-500 text-sm flex-shrink-0">{experience.duration}</p>
    </div>
    <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
      {experience.responsibilities.map((res, i) => (
        <li key={i}>{res}</li>
      ))}
    </ul>
  </motion.div>
);


// Define separate components for other content sections
const GraphicDesignContent = () => (
  <section>
    <h2 className="text-3xl font-semibold mb-4 border-b border-white/10 pb-2">Graphic Design Portfolio</h2>
    <p className="text-gray-400 leading-relaxed text-lg mb-8">
      Welcome to my graphic design portfolio, where creativity meets strategic communication. I specialize in crafting compelling visual identities, engaging marketing collateral, and impactful digital assets that resonate with target audiences and drive brand recognition. Below are examples of my work, showcasing a blend of artistic vision and practical application.
    </p>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Project 1: Brand Identity Redesign */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-2">Project: "EcoBloom" Sustainable Brand Identity</h3>
        <p className="text-gray-400 text-sm mb-4">
          **Objective:** Develop a fresh, eco-friendly brand identity for a new sustainable product line, emphasizing natural elements and modern aesthetics.
        </p>
        <img src="https://placehold.co/400x250/34D399/FFFFFF?text=EcoBloom+Logo" alt="EcoBloom Logo" className="w-full h-auto rounded-lg mb-4" />
        <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
          <li>Designed primary and secondary logos, color palettes, and typography.</li>
          <li>Created mockups for packaging, stationery, and digital presence.</li>
          <li>Ensured brand consistency across all touchpoints.</li>
        </ul>
        <p className="text-gray-500 text-xs mt-4">Tools: Adobe Illustrator, Adobe Photoshop</p>
      </div>

      {/* Project 2: Event Poster Series */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-2">Project: "FutureTech Summit" Poster Series</h3>
        <p className="text-gray-400 text-sm mb-4">
          **Objective:** Design a series of eye-catching event posters for a technology conference, attracting a diverse audience of innovators and professionals.
        </p>
        <img src="https://placehold.co/400x250/60A5FA/FFFFFF?text=Tech+Poster" alt="FutureTech Summit Poster" className="w-full h-auto rounded-lg mb-4" />
        <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
          <li>Developed unique visual themes for each poster in the series.</li>
          <li>Incorporated abstract elements to represent technological advancement.</li>
          <li>Optimized for both digital and print media.</li>
          </ul>
        <p className="text-gray-500 text-xs mt-4">Tools: Adobe Photoshop, Adobe Illustrator</p>
      </div>

      {/* Add more graphic design projects here following the same structure */}
    </div>
  </section>
);

const UIUXDesignContent = () => (
  <section>
    <h2 className="text-3xl font-semibold mb-4 border-b border-white/10 pb-2">UI/UX Design Portfolio</h2>
    <p className="text-gray-400 leading-relaxed text-lg mb-8">
      My UI/UX design philosophy centers on creating intuitive, accessible, and delightful digital experiences. I follow a user-centered design process, from in-depth research and ideation to meticulous prototyping and rigorous testing, ensuring that every design decision serves the user and business objectives.
    </p>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Project 1: Mobile App Redesign */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-2">Case Study: "ConnectUs" Social App Redesign</h3>
        <p className="text-gray-400 text-sm mb-4">
          **Problem:** Users found the existing social networking app cluttered and difficult to navigate, leading to low engagement.
        </p>
        <img src="https://placehold.co/400x250/EC4899/FFFFFF?text=ConnectUs+UI" alt="ConnectUs App UI" className="w-full h-auto rounded-lg mb-4" />
        <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
          <li>Conducted user interviews and usability tests to identify pain points.</li>
          <li>Developed new user flows and information architecture for improved navigation.</li>
          <li>Designed a cleaner, more intuitive interface with a focus on core features.</li>
          <li>**Impact:** Increased daily active users by 25% and session duration by 15%.</li>
        </ul>
        <p className="text-gray-500 text-xs mt-4">Tools: Figma, Adobe XD, Miro</p>
      </div>

      {/* Project 2: E-commerce Website Optimization */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-2">Case Study: "ArtisanCrafts" E-commerce UX Optimization</h3>
        <p className="text-gray-400 text-sm mb-4">
          **Problem:** High cart abandonment rates and low conversion on an existing e-commerce platform.
        </p>
        <img src="https://placehold.co/400x250/F59E0B/FFFFFF?text=ArtisanCrafts+UX" alt="ArtisanCrafts Website UX" className="w-full h-auto rounded-lg mb-4" />
        <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
          <li>Analyzed user behavior data and conducted A/B tests on checkout flows.</li>
          <li>Simplified product browsing and filtering experience.</li>
          <li>Redesigned product pages for better information hierarchy and visual appeal.</li>
          <li>**Impact:** Reduced cart abandonment by 18% and increased conversion rate by 10%.</li>
        </ul>
        <p className="text-gray-500 text-xs mt-4">Tools: Figma, Google Analytics, Hotjar</p>
      </div>
    </div>
  </section>
);

const DigitalMarketingContent = () => (
  <section>
    <h2 className="text-3xl font-semibold mb-4 border-b border-white/10 pb-2">Digital Marketing Campaigns</h2>
    <p className="text-gray-400 leading-relaxed text-lg mb-8">
      In the dynamic world of digital marketing, I craft data-driven strategies that connect brands with their audience, build strong online presences, and achieve measurable business growth. My expertise spans various channels, focusing on integrated campaigns that deliver impactful results.
    </p>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Campaign 1: Product Launch Campaign */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-2">Campaign: "InnovateX" Product Launch Strategy</h3>
        <p className="text-400 text-sm mb-4">
          **Objective:** Generate excitement and pre-orders for a new tech gadget.
        </p>
        <img src="https://placehold.co/400x250/10B981/FFFFFF?text=Product+Launch+Ad" alt="InnovateX Product Launch Ad" className="w-full h-auto rounded-lg mb-4" />
        <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
          <li>Developed a multi-channel strategy: social media ads, email marketing, and influencer collaborations.</li>
          <li>Created compelling ad creatives and landing page copy.</li>
          <li>Monitored campaign performance daily and optimized ad spend.</li>
          <li>**Results:** Achieved 150% of pre-order target within the first month.</li>
        </ul>
        <p className="text-gray-500 text-xs mt-4">Channels: Social Media (Facebook, Instagram), Email, Influencer Marketing</p>
      </div>

      {/* Campaign 2: Lead Generation for B2B Service */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-2">Campaign: "BizGrow Solutions" B2B Lead Generation</h3>
        <p className="text-gray-400 text-sm mb-4">
          **Objective:** Acquire high-quality leads for a B2B SaaS platform.
        </p>
        <img src="https://placehold.co/400x250/EF4444/FFFFFF?text=B2B+Lead+Gen" alt="BizGrow Solutions Lead Gen" className="w-full h-auto rounded-lg mb-4" />
        <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
          <li>Implemented Google Ads (Search & Display) with targeted keywords.</li>
          <li>Developed a content marketing funnel with whitepapers and webinars.</li>
          <li>Utilized LinkedIn Ads for professional targeting.</li>
          <li>**Results:** Reduced cost-per-lead by 20% and increased lead-to-opportunity conversion by 10%.</li>
        </ul>
        <p className="text-gray-500 text-xs mt-4">Channels: Google Ads, LinkedIn Ads, Content Marketing</p>
      </div>
    </div>
  </section>
);

const SEOContent = () => {
  // Data for SEO Services with Lucide React Icons
  const seoServices = [
    { name: "Keyword Research", icon: <Search className="w-8 h-8 text-white" /> },
    { name: "On-Page SEO", icon: <FileText className="w-8 h-8 text-white" /> },
    { name: "Off-Page SEO", icon: <Link className="w-8 h-8 text-white" /> },
    { name: "Technical SEO", icon: <Code className="w-8 h-8 text-white" /> },
    { name: "Local SEO", icon: <Globe className="w-8 h-8 text-white" /> },
    { name: "Analytics & Reporting", icon: <BarChart2 className="w-8 h-8 text-white" /> },
    { name: "Content Strategy", icon: <Monitor className="w-8 h-8 text-white" /> },
    { name: "Competitor Analysis", icon: <Users className="w-8 h-8 text-white" /> },
  ];

  return (
    <section>
      <h2 className="text-3xl font-semibold mb-4 border-b border-white/10 pb-2">SEO Strategies & Results</h2>
      <p className="text-gray-400 leading-relaxed text-lg mb-8">
        My approach to Search Engine Optimization is rooted in a deep understanding of algorithms, user intent, and technical best practices. I develop comprehensive SEO strategies that boost organic visibility, drive qualified traffic, and improve search rankings for sustainable long-term growth.
      </p>

      {/* New section for SEO Services */}
      <div className="mb-12">
        <h3 className="text-2xl font-semibold mb-6 text-white">Key SEO Services</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {seoServices.map((service, i) => (
            <motion.div
              key={i}
              className="rounded-xl bg-white/5 border border-white/10 p-4 flex flex-col items-center justify-center text-center space-y-2"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.08)" }}
              transition={{ duration: 0.2 }}
            >
              {service.icon}
              <p className="text-white text-md font-medium">{service.name}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Case Study 1: E-commerce Organic Traffic Growth */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-2">Case Study: E-commerce Organic Traffic Surge</h3>
          <p className="text-gray-400 text-sm mb-4">
            **Challenge:** A niche e-commerce site struggled with low organic traffic despite having unique products.
          </p>
          <img src="https://placehold.co/400x250/3B82F6/FFFFFF?text=SEO+Traffic+Graph" alt="SEO Traffic Graph" className="w-full h-auto rounded-lg mb-4" />
          <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
            <li>Conducted extensive keyword research to identify high-potential long-tail keywords.</li>
            <li>Optimized product pages and category descriptions for target keywords.</li>
            <li>Implemented technical SEO fixes (site speed, mobile responsiveness, schema markup).</li>
            <li>**Results:** Achieved a 70% increase in organic traffic and a 25% improvement in keyword rankings for top terms within 6 months.</li>
          </ul>
          <p className="text-gray-500 text-xs mt-4">Tools: Google Search Console, SEMrush, Screaming Frog</p>
        </div>

        {/* Case Study 2: Local Business SEO Domination */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-2">Case Study: Local Service Business Ranking Boost</h3>
          <p className="text-gray-400 text-sm mb-4">
            **Challenge:** A local service provider had minimal online presence and was losing customers to competitors.
          </p>
          <img src="https://placehold.co/400x250/8B5CF6/FFFFFF?text=Local+SEO" alt="Local SEO Map" className="w-full h-auto rounded-lg mb-4" />
          <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
            <li>Optimized Google My Business profile and local citations.</li>
            <li>Developed location-specific landing pages with optimized content.</li>
            <li>Implemented local schema markup and encouraged customer reviews.</li>
            <li>**Results:** Ranked in the top 3 for 80% of local keywords and saw a 40% increase in local inquiries.</li>
          </ul>
          <p className="text-gray-500 text-xs mt-4">Tools: Google My Business, Moz Local, BrightLocal</p>
        </div>
      </div>
    </section>
  );
};

const AIDevContent = () => (
  <section>
    <h2 className="text-3xl font-semibold mb-4 border-b border-white/10 pb-2">AI Development Projects</h2>
    <p className="text-gray-400 leading-relaxed text-lg mb-8">
      My journey into AI development is driven by a passion for creating intelligent systems that push the boundaries of interaction and creativity. From leveraging large language models for dynamic content generation to building cognitive agents with simulated memory and drives, I explore how AI can augment human experience and artistic expression.
    </p>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Project 1: Synthetic Mind (Expanded) */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-2">Project: v0id - The Synthetic Mind</h3>
        <p className="text-gray-400 text-sm mb-4">
          **Goal:** To create an interactive AI art piece that simulates complex cognitive processes, including semantic networks, episodic memory, and internal drives.
        </p>
        <img src="https://placehold.co/400x250/22D3EE/FFFFFF?text=Synthetic+Mind+Viz" alt="Synthetic Mind Visualization" className="w-full h-auto rounded-lg mb-4" />
        <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
          <li>Integrated advanced LLMs for real-time thought generation and reflection.</li>
          <li>Developed a modular architecture for memory management and drive simulation.</li>
          <li>Designed the interactive front-end for real-time display of AI's internal state.</li>
          <li>**Impact:** Explores the artistic and philosophical implications of artificial consciousness.</li>
        </ul>
        <p className="text-gray-500 text-xs mt-4">Technologies: Large Language Models (LLMs), Python, React, TensorFlow</p>
      </div>

      {/* Project 2: Image Recognition for Art Classification */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-2">Project: Art Style Classifier (Computer Vision)</h3>
        <p className="text-gray-400 text-sm mb-4">
          **Goal:** Develop a machine learning model to classify artworks by artistic style (e.g., Impressionism, Cubism).
        </p>
        <img src="https://placehold.co/400x250/A78BFA/FFFFFF?text=Art+Classifier" alt="Art Style Classifier" className="w-full h-auto rounded-lg mb-4" />
        <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
          <li>Curated and preprocessed a dataset of thousands of artworks.</li>
          <li>Trained a Convolutional Neural Network (CNN) using TensorFlow.</li>
          <li>Achieved high accuracy in classifying various art movements.</li>
          <li>**Impact:** Potential for art historical research, museum cataloging, and educational tools.</li>
        </ul>
        <p className="text-gray-500 text-xs mt-4">Technologies: TensorFlow, Python, Keras, scikit-learn</p>
      </div>
    </div>
  </section>
);


/**
 * HomeContent Component
 * Renders the content for the "Home" section of the portfolio.
 * It now manages the isExpanded state for the Photos widget.
 */
const HomeContent = ({ setSelectedImage }) => { // Receive setSelectedImage prop
  // Centralized state for both Photos and AI Dev widget expansion
  const [isLinkedWidgetsExpanded, setIsLinkedWidgetsExpanded] = useState(false);
  // State to manage which row of projects is currently expanded
  const [expandedProjectRow, setExpandedProjectRow] = useState(null); // Can be 0, 1, 2, etc. or null

  // Function to handle project card clicks for row-by-row expansion
  const handleProjectClick = (projectId, rowIndex) => {
    // If the clicked row is already expanded, collapse it.
    // Otherwise, expand the clicked row.
    setExpandedProjectRow(prevRowIndex => (prevRowIndex === rowIndex ? null : rowIndex));
  };

  // Data for Skills & Tools section
  const skills = [
    { name: "Figma", iconUrl: "https://www.vectorlogo.zone/logos/figma/figma-icon.svg", description: "Expert in UI/UX design, prototyping, and collaborative workflows." },
    { name: "Adobe Photoshop", iconUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Adobe_Photoshop_CC_icon.svg/1024px-Adobe_Photoshop_CC_icon.png", description: "Proficient in image manipulation, digital painting, and graphic design." }, // Updated to a PNG that should invert well
    { name: "Adobe Illustrator", iconUrl: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Adobe_Illustrator_CC_icon.svg", description: "Skilled in vector graphics, logo design, and illustration." },
    { name: "React", iconUrl: "https://www.vectorlogo.zone/logos/reactjs/reactjs-icon.svg", description: "Experienced in building modern, responsive web applications." },
    { name: "HTML5", iconUrl: "https://www.vectorlogo.zone/logos/w3_html5/w3_html5-icon.svg", description: "Proficient in semantic HTML and web structure." },
    { name: "Swift", iconUrl: "https://cdn.jsdelivr.net/npm/simple-icons@5.15.0/icons/swift.svg", description: "Experienced in iOS and macOS application development." }, // Updated Swift to simple-icons SVG
    { name: "Final Cut Pro", iconUrl: "https://help.apple.com/assets/673BE5C0E115654F7F097772/673BE5C41BAE7922D30F2CE1/en_US/97f5f4dfe6df84d78caacff68ec63538.png", description: "Skilled in professional video editing and post-production." }, // Updated to the user-provided PNG
    { name: "Python", iconUrl: "https://www.vectorlogo.zone/logos/python/python-icon.svg", description: "Proficient in scripting, data analysis, and AI/ML development." },
    { name: "TensorFlow", iconUrl: "https://www.vectorlogo.zone/logos/tensorflow/tensorflow-icon.svg", description: "Familiar with machine learning model development and deployment." },
    { name: "Tailwind CSS", iconUrl: "https://www.vectorlogo.zone/logos/tailwindcss/tailwindcss-icon.svg", description: "Adept at rapid UI development with utility-first CSS framework." },
    { name: "Three.js", iconUrl: "https://cdn.jsdelivr.net/npm/simple-icons@5.15.0/icons/threedotjs.svg", description: "Experience with 3D graphics and interactive web experiences." }, // Updated Three.js to simple-icons SVG
    { name: "Google Cloud", iconUrl: "https://www.vectorlogo.zone/logos/google_cloud/google_cloud-icon.svg", description: "Familiar with cloud services for deployment and data management." },
  ];

  // Data for Experience section
  const experiences = [
    {
      role: "Lead Product Designer & AI Developer",
      company: "v0id - Synthetic Mind",
      duration: "Jan 2023 - Present",
      responsibilities: [
        "Led the design and development of an interactive AI art piece, 'Synthetic Mind'.",
        "Integrated LLMs with memory and planning for believable AI behavior.",
        "Managed UI/UX from concept to deployment, focusing on user empathy.",
      ],
    },
    {
      role: "Senior UI/UX Designer",
      company: "Innovate Solutions Inc.",
      duration: "Aug 2019 - Dec 2022",
      responsibilities: [
        "Designed and prototyped user interfaces for various web and mobile applications.",
        "Conducted user research, usability testing, and A/B testing to optimize designs.",
        "Collaborated with cross-functional teams to ensure design feasibility and implementation.",
      ],
    },
    {
      role: "Graphic Designer",
      company: "Creative Agency Co.",
      duration: "Jun 2016 - Jul 2019",
      responsibilities: [
        "Developed brand identities, logos, and marketing collateral for diverse clients.",
        "Created engaging visual content for digital and print media campaigns.",
        "Managed multiple design projects from concept to final delivery.",
      ],
    },
  ];

  // Data for Projects section, now with more details for the new card style
  const projects = [
    {
      id: "awaken",
      name: "AWAKEN",
      category: "Fashion House",
      description: "Creative direction for immersive AI-driven art experiences, blending fashion, technology, and art.",
      fullDescription: "As the creative director for AWAKEN, a cutting-edge fashion house, I guided the artistic vision for their immersive AI-driven art experiences. This involved conceptualizing and overseeing the development of interactive installations that blend fashion, technology, and art to explore themes of consciousness and perception, creating unique brand narratives.",
      imageUrl: "https://placehold.co/150x100/da4a44/FFFFFF?text=AWAKEN&font=Anton", // Red background, Anton font
      backgroundColor: "#da4a44", // Explicitly set red background
      technologies: ["Creative Direction", "AI Integration", "Interactive Design", "Event Production"],
      links: [
        { name: "Video Demo", url: "https://www.youtube.com/watch?v=exampleAWAKEN" },
        { name: "Press Kit", url: "https://www.example.com/awaken-press" },
      ],
    },
    {
      id: "kwality-klarity", // Unique ID for each project
      name: "Kwality & Klarity",
      category: "Media Company",
      description: "Comprehensive web design and brand development, including blog, newsletter, and overall web presence.",
      fullDescription: "For Kwality & Klarity, a dynamic media company, I spearheaded the complete web design and brand development. This involved crafting a cohesive visual identity, designing and implementing a user-friendly website, setting up an engaging blog, and integrating a newsletter system to enhance their digital outreach and audience engagement.",
      imageUrl: "https://i.ibb.co/v40Ndw3j/WHITEKWALITY-KLARITYDISTORTED.png", // Black background
      backgroundColor: "#000000", // Explicitly set black background
      technologies: ["React", "Tailwind CSS", "Figma", "Adobe Illustrator", "Email Marketing Platform"],
      links: [
        { name: "Live Site", url: "https://kwalityandklarity.com" }, // Updated URL
        { name: "Case Study", url: "https://www.example.com/kwalityklarity-case-study" },
      ],
    },
    {
      id: "v0id",
      name: "v0id",
      category: "AI Research & Development",
      description: "Personal R&D initiative focused on synthetic minds and advanced generative AI applications.",
      fullDescription: "v0id is my personal research initiative focused on the development of synthetic minds and advanced generative AI applications. This includes experimentation with large language models, neural networks, and creating AI that can exhibit emergent behaviors and creative outputs.",
      imageUrl: "https://i.ibb.co/p7297MR/vo0id-logo.png",
      backgroundColor: "#bdc0a7", // Dark grey for v0id
      technologies: ["Python", "TensorFlow", "PyTorch", "Google Cloud", "Adobe Photoshop", "React", "HTML"],
      links: [
        { name: "Mind.v0id.live", url: "https://mind.v0id.live" }, // Direct link as requested previously
        { name: "Research Paper", url: "https://www.example.com/v0id-research" },
      ],
    },
    {
      id: "kopoai",
      name: "Kopoai",
      category: "Activewear Brand UX",
      description: "Enhanced user experience across digital platforms for an innovative activewear brand.",
      fullDescription: "For Kopoai, an innovative activewear brand, I focused on enhancing the user experience across their digital platforms. This included optimizing the e-commerce website and mobile app for seamless navigation, intuitive product discovery, and a streamlined checkout process, ensuring a premium user journey that reflects the brand's quality.",
      imageUrl: "https://i.ibb.co/Gf3P2mfD/kopoai-logo.png", // Updated image URL
      backgroundColor: "#f0ece0", // Earth-tone brown for Kopoai
      technologies: ["Figma", "User Research", "Wireframing", "Prototyping", "E-commerce Platforms"], // Technologies restored
      links: [
        { name: "Website UX", url: "https://www.example.com/kopoai-ux-case-study" },
        { name: "App Prototype", url: "https://www.figma.com/proto/exampleKopoaiMobile" }, // Link restored
      ],
    },
    {
      id: "horizon",
      name: "Horizon",
      category: "Travel Mobile App",
      description: "Development of a cross-platform mobile application for outdoor enthusiasts, featuring GPS and offline maps.",
      fullDescription: "Horizon is a comprehensive travel mobile app designed for outdoor enthusiasts. I was responsible for the development of its cross-platform functionality, including GPS tracking for trails, offline map capabilities, and social features that allow users to share their adventures and connect with a community.",
      imageUrl: "https://placehold.co/150x100/4A4A4A/FFFFFF?text=Horizon&font=sans-serif&weight=100", // Thin text for Horizon
      backgroundColor: "#4A4A4A", // Dark grey for Horizon
      technologies: ["React Native", "Swift", "Firebase", "Mapbox API", "GPS Integration"],
      links: [
        { name: "App Store", url: "https://apps.apple.com/app/exampleHorizon" },
        { name: "Play Store", url: "https://play.google.com/store/apps/details?id=exampleHorizon" },
      ],
    },
    {
      id: "onthewall",
      name: "OnTheWall",
      category: "E-commerce & UX",
      description: "Optimizing the user experience and visual design for an online art marketplace.",
      fullDescription: "Revamped the user experience and visual design of 'OnTheWall', an online marketplace for independent artists. Focused on improving discoverability, streamlining the purchase process, and enhancing the overall aesthetic to attract more users and artists.",
      imageUrl: "https://placehold.co/150x100/0033cc/FFFFFF?text=OnTheWall&font=Anton",
      backgroundColor: "#0033cc", // Dark blue for OnTheWall
      technologies: ["Figma", "Shopify", "HTML", "CSS", "JavaScript"],
      links: [
        { name: "Live Site", url: "https://www.example.com/onthewall" },
        { name: "UX Case Study", url: "https://www.example.com/onthewall-ux-case-study" },
      ],
    },
    {
      id: "clouds",
      name: "CLOUDS",
      category: "Generative Art",
      description: "An experimental project exploring dynamic, cloud-like visual formations.",
      fullDescription: "CLOUDS is a generative art piece that uses Perlin noise and particle systems to create endlessly evolving, organic cloud formations. It's a real-time visualization designed for ambient display, exploring the beauty of natural phenomena through code.",
      imageUrl: "https://i.ibb.co/p6qLNCsw/clouds-banner.png",
      backgroundColor: "#fadd2a", // Yellow for Clouds
      technologies: ["JavaScript", "HTML5 Canvas", "Perlin Noise Algorithms"],
      links: [
        { name: "Live Demo", url: "https://www.example.com/clouds-demo" },
        { name: "CodePen", url: "https://codepen.io/yourusername/pen/exampleClouds" },
      ],
    },
    {
      id: "vaulted",
      name: "Vaulted",
      category: "Security Software UI",
      description: "Creating a secure and user-friendly interface for data encryption software.",
      fullDescription: "Designed the user interface for Vaulted, a desktop application for secure data encryption and management. Prioritized usability and clear communication of security features, ensuring a complex tool felt intuitive and trustworthy for everyday users.",
      imageUrl: "https://placehold.co/150x100/EF4444/FFFFFF?text=Vaulted", // Placeholder, but will be rendered as text
      backgroundColor: "#646d83", // Slate blue for Vaulted
      technologies: ["Figma", "Electron", "React", "Node.js"],
      links: [
        { name: "Product Page", url: "https://www.example.com/vaulted" },
        { name: "Demo Video", url: "https://www.youtube.com/watch?v=exampleVaulted" },
      ],
    },
  ];

  // Group projects into rows for linked expansion
  const projectRows = [];
  for (let i = 0; i < projects.length; i += 2) {
    projectRows.push(projects.slice(i, i + 2));
  }


  return (
    <div className="space-y-20">
      {/* About Section */}
      <section>
        <h2 className="text-3xl font-semibold mb-4 border-b border-white/10 pb-2">About</h2>
        <p className="text-gray-400 leading-relaxed text-lg">
          I'm a multidisciplinary digital creative blending beautiful design, strategic thinking,
          and cutting-cutting-edge AI development. I specialize in crafting visual experiences that deliver results.
        </p>
      </section>

      {/* Spaces Section, including the ExpandablePhotosWidget */}
      <section>
        <h2 className="text-3xl font-semibold mb-4 border-b border-white/10 pb-2">Spaces</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4"> {/* Changed to grid-cols-1 on mobile */}
          {/* Pass the centralized state and setter to both widgets */}
          <ExpandablePhotosWidget
            isExpanded={isLinkedWidgetsExpanded}
            setIsExpanded={setIsLinkedWidgetsExpanded}
            setSelectedImage={setSelectedImage}
          />

          {/* AI Dev Widget - now controlled by the same state */}
          <AIDevWidget
            isExpanded={isLinkedWidgetsExpanded}
            setIsExpanded={setIsLinkedWidgetsExpanded}
          />
        </div>
      </section>

      {/* Projects Section - Now using ProjectCard component and grid layout */}
      <section>
        <h2 className="text-3xl font-semibold mb-4 border-b border-white/10 pb-2">Projects</h2>
        <p className="text-gray-400 leading-relaxed text-lg">
          From brand systems and marketing funnels to advanced AI tools and web platforms, my portfolio spans industries and mediums.
          Notable projects include Kwality & Klarity, AWAKEN, v0id, Kopoai, Horizon, OnTheWall, and Vaulted.
        </p>
        <div className="mt-8 space-y-6"> {/* Use space-y-6 for vertical spacing between rows */}
          {projectRows.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {row.map((proj) => (
                <ProjectCard
                  key={proj.id}
                  project={proj}
                  isExpanded={expandedProjectRow === rowIndex} // Check if this project's row is expanded
                  onSelect={() => handleProjectClick(proj.id, rowIndex)} // Pass row index for selection
                />
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Redesigned Experience Section */}
      <section>
        <h2 className="text-3xl font-semibold mb-4 border-b border-white/10 pb-2">Experience</h2>
        <div className="grid grid-cols-1 gap-6">
          {experiences.map((exp, i) => (
            <ExperienceItem key={i} experience={exp} />
          ))}
        </div>
      </section>

      {/* New Skills & Tools Section */}
      <section>
        <h2 className="text-3xl font-semibold mb-4 border-b border-white/10 pb-2">Skills & Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {skills.map((skill, i) => (
            <SkillCard key={i} skill={skill} />
          ))}
        </div>
      </section>
    </div>
  );
};

// Define the navigation items for the sidebar
const navItems = [
  {
    id: "home",
    icon: (
      // SVG icon for Home
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 12l9-9 9 9M4 10v10a1 1 0 001 1h3m10-11v10a1 1 0 001 1h3m-7-4h-4v4h4v-4z"
        />
      </svg>
    ),
    label: "Home",
    content: HomeContent // Now passing a component reference
  },
  {
    id: "graphic",
    icon: <PenTool className="w-4 h-4" />, label: "Graphic Design", content: GraphicDesignContent
  },
  {
    id: "uiux",
    icon: <LayoutGrid className="w-4 h-4" />, label: "UI/UX Design", content: UIUXDesignContent
  },
  {
    id: "marketing",
    icon: <Globe className="w-4 h-4" />, label: "Digital Marketing", content: DigitalMarketingContent
  },
  {
    id: "seo",
    icon: <Search className="w-4 h-4" />, label: "SEO", content: SEOContent
  },
  {
    id: "ai",
    icon: <Code className="w-4 h-4" />, label: "AI Dev", content: AIDevContent
  }
];

/**
 * Main App Component
 * Renders the overall portfolio layout, including sidebar navigation and main content.
 */
function App() {
  // State for mouse position to create the radial gradient effect
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  // State to manage the currently active navigation page
  const [activePage, setActivePage] = useState("home");
  // State to hold the URL of the currently selected image for large view
  const [selectedImage, setSelectedImage] = useState(null);
  // State for mobile menu visibility
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Effect to track mouse movement for the background gradient
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    // Cleanup event listener on component unmount
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Find the active content component based on the activePage state
  // Pass setSelectedImage to HomeContent
  const ActiveContentComponent = navItems.find((p) => p.id === activePage)?.content;

  // Function to close mobile menu and set active page
  const handleNavLinkClick = (pageId) => {
    setActivePage(pageId);
    setIsMobileMenuOpen(false); // Close menu on navigation
  };

  return (
    <div className="relative min-h-screen bg-black text-white font-sans overflow-hidden">
      {/* Style block for importing Google Fonts */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Anton&display=swap');
          .font-anton {
            font-family: 'Anton', sans-serif;
          }
        `}
      </style>

      {/* Background radial gradient following mouse */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.1), transparent 80%)`
        }}
      />

      {/* Cursor Follower Component (Desktop only) */}
      <CursorFollower />

      {/* Mobile Ambient Light Effect (Mobile only) */}
      <MobileAmbientLight />

      <div className="flex h-screen">
        {/* Mobile Header (visible on small screens) */}
        <div className="md:hidden fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md border-b border-white/10 p-4 flex items-center justify-between z-20">
          {/* Reverted to just name in mobile header as per feedback */}
          <h1 className="text-xl font-semibold">Calvin Korkie</h1>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md hover:bg-white/10">
            <Menu className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Sidebar Navigation (Desktop) */}
        <div className="hidden md:block w-60 bg-white/5 backdrop-blur-md border-r border-white/10 px-4 py-6 space-y-6 z-10">
          <div className="flex flex-col items-center space-y-2">
            <motion.div
              className="relative rounded-full border-2 border-transparent"
              whileHover={{
                borderColor: "rgba(255, 255, 255, 0.5)", // Faint white border on hover
                boxShadow: "0 0 15px rgba(255, 255, 255, 0.3)", // Subtle glow
                scale: 1.05, // Slightly enlarge
              }}
              transition={{ duration: 0.2 }}
            >
              <img
                src="https://i.ibb.co/kVZjJf5Y/photo-of-meeee.webp"
                alt="Calvin Korkie"
                className="w-20 h-20 rounded-full object-cover" // Removed border from img itself
                onContextMenu={(e) => e.preventDefault()}
                style={{ WebkitTouchCallout: "none" }}
              />
            </motion.div>
            <h1 className="text-xl font-semibold text-center">Calvin Korkie</h1>
            <p className="text-xs text-gray-400">anticalvin@icloud.com</p>
            <p className="text-xs text-gray-400">Cape Town, South Africa</p> {/* Added location */}
          </div>
          <ul className="mt-6 space-y-4">
            {navItems.map((item) => (
              <li
                key={item.id}
                onClick={() => handleNavLinkClick(item.id)} // Use handleNavLinkClick
                className={`flex items-center gap-3 px-2 py-1 rounded-md cursor-pointer transition ${
                  activePage === item.id ? "bg-white/10 text-white" : "text-gray-300 hover:text-white"
                }`}
              >
                {item.icon} <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              // Adjusted pt-24 to push content down further, accounting for the header
              className="fixed inset-0 bg-black/90 backdrop-blur-lg z-30 flex flex-col p-6 pt-24 md:hidden" 
            >
              {/* Profile info at the top of the mobile menu */}
              <div className="flex flex-col items-center space-y-2 mb-8">
                <motion.div
                  className="relative rounded-full border-2 border-transparent"
                  whileHover={{
                    borderColor: "rgba(255, 255, 255, 0.5)",
                    boxShadow: "0 0 15px rgba(255, 255, 255, 0.3)",
                    scale: 1.05,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <img
                    src="https://i.ibb.co/kVZjJf5Y/photo-of-meeee.webp"
                    alt="Calvin Korkie"
                    className="w-20 h-20 rounded-full object-cover"
                    onContextMenu={(e) => e.preventDefault()}
                    style={{ WebkitTouchCallout: "none" }}
                  />
                </motion.div>
                <h1 className="text-xl font-semibold text-center">Calvin Korkie</h1>
                <p className="text-xs text-gray-400">anticalvin@icloud.com</p>
                <p className="text-xs text-gray-400">Cape Town, South Africa</p>
              </div>

              {/* Close button for mobile menu, positioned relative to the overlay itself */}
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-md hover:bg-white/10 absolute top-4 right-4">
                <X className="w-6 h-6 text-white" />
              </button>
              
              <ul className="space-y-6">
                {navItems.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => handleNavLinkClick(item.id)} // Use handleNavLinkClick
                    className={`flex items-center gap-4 text-xl py-2 rounded-md cursor-pointer transition ${
                      activePage === item.id ? "text-white font-semibold bg-white/10" : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {item.icon} <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        {/* Adjusted pt-24 for mobile to account for fixed header and prevent cropping */}
        <div className="flex-1 overflow-y-auto px-4 py-12 md:px-12 md:pt-12 pt-24">
          <div className="max-w-4xl mx-auto">
            {/* Render content based on active page, now as a component */}
            {/* Conditionally render HomeContent or the LargeImageViewer */}
            {selectedImage ? (
              <LargeImageViewer imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
            ) : (
              ActiveContentComponent && <ActiveContentComponent setSelectedImage={setSelectedImage} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
