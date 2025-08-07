// --- Main App Component ---
const App = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isWidgetsExpanded, setIsWidgetsExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  
  const backgroundCanvasRef = useRef(null);
  const mousePosition = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const shinyTextElementsRef = useRef([]);

  const handleNavLinkClick = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && selectedImage) {
        setSelectedImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePosition.current = { x: e.clientX, y: e.clientY };
      shinyTextElementsRef.current.forEach(el => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const elCenterX = rect.left + rect.width / 2;
        const elCenterY = rect.top + rect.height / 2;
        const distance = Math.hypot(elCenterX - mousePosition.current.x, elCenterY - mousePosition.current.y);
        const maxDistance = 200;
        const intensity = Math.max(0, 1 - distance / maxDistance);
        el.style.textShadow = `0 0 ${1 + intensity * 3}px rgba(255, 255, 255, ${0.2 + intensity * 0.3})`;
      });
    };
    window.addEventListener('mousemove', handleMouseMove);

    const updateShinyElements = () => {
      shinyTextElementsRef.current = document.querySelectorAll('.shiny-text');
      handleMouseMove({ clientX: mousePosition.current.x, clientY: mousePosition.current.y });
    };
    
    updateShinyElements();
    const observer = new MutationObserver(updateShinyElements);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = backgroundCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const gridSize = 40;
    const cubeHeight = gridSize * 2;
    const cubeWidth = gridSize * 2;
    const rows = Math.ceil(window.innerHeight / (cubeHeight * 0.75)) + 1;
    const cols = Math.ceil(window.innerWidth / cubeWidth) + 1;

    const drawCube = (x, y, shade) => {
        const topShade = `hsl(0, 0%, ${Math.min(15 + shade * 60, 100)}%)`;
        const leftShade = `hsl(0, 0%, ${Math.min(10 + shade * 40, 100)}%)`;
        const rightShade = `hsl(0, 0%, ${Math.min(5 + shade * 20, 100)}%)`;

        ctx.beginPath();
        ctx.moveTo(x, y - gridSize);
        ctx.lineTo(x + gridSize, y - gridSize / 2);
        ctx.lineTo(x, y);
        ctx.lineTo(x - gridSize, y - gridSize / 2);
        ctx.closePath();
        ctx.fillStyle = topShade;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x - gridSize, y - gridSize / 2);
        ctx.lineTo(x, y);
        ctx.lineTo(x, y + gridSize);
        ctx.lineTo(x - gridSize, y + gridSize / 2);
        ctx.closePath();
        ctx.fillStyle = leftShade;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x + gridSize, y - gridSize / 2);
        ctx.lineTo(x, y);
        ctx.lineTo(x, y + gridSize);
        ctx.lineTo(x + gridSize, y + gridSize / 2);
        ctx.closePath();
        ctx.fillStyle = rightShade;
        ctx.fill();

        ctx.strokeStyle = `hsl(0, 0%, ${Math.min(5 + shade * 15, 100)}%)`;
        ctx.lineWidth = 1;
        ctx.stroke();
    };

    const draw = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const mouseX = mousePosition.current.x;
      const mouseY = mousePosition.current.y;
      
      const offsetX = (window.innerWidth % (gridSize * 2)) / 2;
      const offsetY = (window.innerHeight % (gridSize * 1.5)) / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = offsetX + c * (gridSize * 2) + ((r % 2) === 1 ? gridSize : 0) - gridSize;
          const y = offsetY + r * (gridSize * 1.5);
          
          const distance = Math.hypot(x - mouseX, y - mouseY);
          const maxDistance = Math.hypot(window.innerWidth, window.innerHeight);
          const shade = 1 - Math.min(distance / (maxDistance * 0.2), 1);
          
          drawCube(x, y, shade);
        }
      }
      
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const allCategories = ["All", ...new Set(projects.map(p => p.category))];
  const filteredProjects = activeFilter === "All" ? projects : projects.filter(p => p.category === activeFilter);
  
  const logoWrapperSize = 100;
  const gapSize = 24;
  const containerPadding = 12;
  const numRowsWhenCollapsed = 2;
  const actualGridContentHeightCollapsed = (numRowsWhenCollapsed * logoWrapperSize) + Math.max(0, (numRowsWhenCollapsed - 1) * gapSize);
  const collapsedWidgetHeight = `${actualGridContentHeightCollapsed + (containerPadding * 2)}px`;

  return (
    <div className="relative min-h-screen bg-zinc-950 text-white overflow-hidden">
      
      <canvas ref={backgroundCanvasRef} className="fixed top-0 left-0 w-full h-full z-0"></canvas>
      
      <div className="absolute inset-0 z-10">
        <div className="liquid-blur-1"></div>
        <div className="liquid-blur-2"></div>
      </div>
      
      <TopNav handleNavLinkClick={handleNavLinkClick} />
      
      <div className="fixed top-4 right-4 z-40 md:hidden">
        <button onClick={() => setIsNavOpen(true)} className="p-2 rounded-full glass-container">
          <Menu />
        </button>
      </div>

      <MobileNav isNavOpen={isNavOpen} closeNav={() => setIsNavOpen(false)} handleNavLinkClick={handleNavLinkClick} />

      <div className="relative z-30 flex flex-col min-h-screen">
        
        <div className="flex-1 overflow-y-auto px-4 py-12 md:px-12 md:pt-12 pt-24">
          <div className="max-w-4xl mx-auto space-y-12">
            
            {selectedImage && (
              <LargeImageViewer imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
            )}

            <header id="home" className="glass-container p-8 text-center flex flex-col items-center">
              <motion.div
                className="mb-4 w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-2 border-white/50 shadow-lg"
                whileHover={{ scale: 1.1, rotate: 2 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src="https://i.ibb.co/kVZjJf5Y/photo-of-meeee.webp"
                  alt="Calvin Korkie Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/160x160/252f3e/ffffff?text=CK'; }}
                />
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-white shiny-text">
                Calvin Korkie
              </h1>
              <p className="text-xl md:text-2xl text-white shiny-text">Software Engineer | Product Designer</p>
              <a href="mailto:anticalvin@icloud.com" target="_blank" rel="noopener noreferrer" className="text-sm md:text-base text-white hover:text-white/80 shiny-text mt-2 cursor-pointer">
                anticalvin@icloud.com
              </a>
              <p className="text-sm md:text-base text-white shiny-text mt-2">Cape Town, South Africa</p>
            </header>

            <section id="spaces-and-generative-art">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-white text-center shiny-text">My Spaces & Generative Art</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                <AIDevWidget isExpanded={isWidgetsExpanded} setIsExpanded={setIsWidgetsExpanded} collapsedHeight={collapsedWidgetHeight} />
                <ExpandablePhotosWidget isExpanded={isWidgetsExpanded} setIsExpanded={setIsWidgetsExpanded} setSelectedImage={setSelectedImage} collapsedHeight={collapsedWidgetHeight} />
              </div>
            </section>

            <section id="about" className="glass-container p-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-white shiny-text">About Me</h2>
              <p className="text-white leading-relaxed shiny-text">
                I'm a multidisciplinary digital creative blending beautiful design, strategic thinking, and cutting-cutting-edge AI development. I specialize in crafting visual experiences that deliver results.
              </p>
            </section>
            
            <section id="projects">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-white mb-4 md:mb-0 shiny-text">Projects</h2>
                <div className="flex flex-wrap gap-2">
                  {allCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveFilter(category)}
                      className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors duration-200
                        ${activeFilter === category
                          ? 'bg-white text-zinc-950'
                          : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="wait">
                  {filteredProjects.map((project) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      layout
                    >
                      <ProjectCard project={project} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>
            
            <section id="experience">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-white text-center shiny-text">Experience</h2>
              <div className="space-y-6">
                {experience.map((item) => (
                  <ExperienceCard key={item.id} item={item} />
                ))}
              </div>
            </section>

            <section id="skills">
              <SkillAndSEOSection />
            </section>
            
            <section id="quote-widget" className="mt-12">
              <DynamicQuoteWidget />
            </section>

            <section id="contact" className="glass-container p-8 text-center mt-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-white shiny-text">Get In Touch</h2>
              
              {/* Email Me Button */}
              <motion.div className="mb-8">
                <motion.a
                  href="mailto:anticalvin@icloud.com"
                  className="inline-flex items-center gap-3 bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 backdrop-blur-sm border border-white/20"
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(255,255,255,0.2)" }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <EmailIcon size={24} />
                  <span className="shiny-text">Email Me</span>
                </motion.a>
              </motion.div>

              {/* Social Icons */}
              <div className="flex justify-center space-x-8">
                <motion.a
                  href="https://www.behance.net/calvin-portfolio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-icon text-white hover:text-blue-400 transition-colors duration-300"
                  whileHover={{ scale: 1.2, boxShadow: "0 8px 20px rgba(0,0,0,0.3)" }}
                  transition={{ duration: 0.2 }}
                >
                  <BehanceIcon size={40} />
                </motion.a>
                <motion.a
                  href="https://twitter.com/your-username"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-icon text-white hover:text-blue-400 transition-colors duration-300"
                  whileHover={{ scale: 1.2, boxShadow: "0 8px 20px rgba(0,0,0,0.3)" }}
                  transition={{ duration: 0.2 }}
                >
                  <TwitterIcon size={40} />
                </motion.a>
                <motion.a
                  href="https://linkedin.com/in/your-username"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-icon text-white hover:text-blue-600 transition-colors duration-300"
                  whileHover={{ scale: 1.2, boxShadow: "0 8px 20px rgba(0,0,0,0.3)" }}
                  transition={{ duration: 0.2 }}
                >
                  <LinkedInIcon size={40} />
                </motion.a>
              </div>
            </section>
          </div>
        </div>
      </div>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Anton&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap');
        
        body {
          scroll-behavior: smooth;
          overflow-x: hidden;
          font-family: 'Inter', sans-serif;
        }

        .glass-container {
          background-color: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px) saturate(180%);
          -webkit-backdrop-filter: blur(10px) saturate(180%);
          border-radius: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease-in-out;
        }
        
        .glass-button {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        .glass-button:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3), 0 0 15px rgba(255, 255, 255, 0.2);
        }
        .liquid-blur-1, .liquid-blur-2 {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(135deg, #1f2937, #4b5563, #6b7280); 
          animation: liquid-move 20s infinite ease-in-out alternate;
          filter: blur(80px);
          opacity: 0.5;
        }
        .liquid-blur-1 {
          width: 400px;
          height: 400px;
          top: -100px;
          left: -100px;
          animation-duration: 25s;
        }
        .liquid-blur-2 {
          width: 500px;
          height: 500px;
          bottom: -150px;
          right: -150px;
          animation-duration: 30s;
          animation-delay: 2s;
        }
        @keyframes liquid-move {
          0% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(150px, -50px) scale(1.1); }
          50% { transform: translate(0, 100px) scale(0.9); }
          75% { transform: translate(-100px, -100px) scale(1.2); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        .shiny-text {
            transition: text-shadow 0.2s ease-out;
            text-shadow: 0 0 1px rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default App;import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenTool, LayoutGrid, Globe, Code, ChevronRight, ChevronDown, X, Menu, Link, Search, FileText, BarChart2, Monitor, Users, Briefcase } from "lucide-react";

// --- Data for all sections ---
const navItems = [
  { id: "home", label: "Home", icon: <PenTool /> },
  { id: "about", label: "About", icon: <Code /> },
  { id: "projects", label: "Projects", icon: <LayoutGrid /> },
  { id: "skills", label: "Skills", icon: <Monitor /> },
  { id: "contact", label: "Contact", icon: <Globe /> },
];

const projects = [
  {
    id: "awaken",
    name: "AWAKEN",
    category: "Branding",
    subtitle: "Fashion house",
    description: "Creative direction for immersive AI-driven art experiences, blending fashion, technology, and art.",
    fullDescription: "As the creative director for AWAKEN, a cutting-edge fashion house, I guided the artistic vision for their immersive AI-driven art experiences. This involved conceptualizing and overseeing the development of interactive installations that blend fashion, technology, and art to explore themes of consciousness and perception, creating unique brand narratives.",
    imageUrl: "https://placehold.co/400x200/da4a44/FFFFFF?text=AWAKEN",
    backgroundColor: "#da4a44",
    technologies: ["Creative Direction", "AI Integration", "Interactive Design", "Event Production"],
    links: [
      { name: "Video Demo", url: "https://www.youtube.com/watch?v=exampleAWAKEN" },
      { name: "Press Kit", url: "https://www.example.com/awaken-press" },
    ],
    fontFamily: "'Anton', sans-serif",
    isLogo: false,
    textSizeClass: "text-4xl md:text-5xl", // Updated to match HORIZEN
    logoSizeClass: null,
    colors: ["#da4a44", "#fef9c3"],
  },
  {
    id: "kwality-klarity",
    name: "Kwality & Klarity",
    category: "Branding",
    subtitle: "Media & Publishing",
    description: "Comprehensive web design and brand development, including blog, newsletter, and overall web presence.",
    fullDescription: "For Kwality & Klarity, a dynamic media company, I spearheaded the complete web design and brand development. This involved crafting a cohesive visual identity, designing and implementing a user-friendly website, setting up an engaging blog, and integrating a newsletter system to enhance their digital outreach and audience engagement.",
    imageUrl: "https://i.ibb.co/v40Ndw3j/WHITEKWALITY-KLARITYDISTORTED.png",
    backgroundColor: "#000000",
    technologies: ["React", "Tailwind CSS", "Figma", "Adobe Illustrator", "Email Marketing Platform"],
    links: [
      { name: "Live Site", url: "https://kwalityandklarity.com" },
      { name: "Case Study", url: "https://www.example.com/kwalityklarity-case-study" },
    ],
    isLogo: true,
    textSizeClass: null,
    logoSizeClass: "max-h-[5rem]",
    colors: ["#ffffff", "#000000"],
  },
  {
    id: "v0id",
    name: "v0id",
    category: "AI Dev",
    subtitle: "Research initiative",
    description: "Personal R&D initiative focused on synthetic minds and advanced generative AI applications.",
    fullDescription: "v0id is my personal research initiative focused on the development of synthetic minds and advanced generative AI applications. This includes experimentation with large language models, neural networks, and creating AI that can exhibit emergent behaviors and creative outputs.",
    imageUrl: "https://i.ibb.co/p7297MR/vo0id-logo.png",
    backgroundColor: "#bdc0a7",
    technologies: ["Python", "TensorFlow", "PyTorch", "Google Cloud", "Adobe Photoshop", "React", "HTML"],
    links: [
      { name: "Mind.v0id.live", url: "https://mind.v0id.live" },
      { name: "Research Paper", url: "https://www.example.com/v0id-research" },
    ],
    isLogo: true,
    textSizeClass: null,
    logoSizeClass: "max-h-full",
    colors: ["#bdc0a7", "#ffffff" , "#1f2937" , "#fefe00"],
  },
  {
    id: "kopoai",
    name: "Kopoai",
    category: "UI/UX",
    subtitle: "Activewear brand",
    description: "Enhanced user experience across digital platforms for an innovative activewear brand.",
    fullDescription: "For Kopoai, an innovative activewear brand, I focused on enhancing the user experience across their digital platforms. This included optimizing the e-commerce website and mobile app for seamless navigation, intuitive product discovery, and a streamlined checkout process, ensuring a premium user journey that reflects the brand's quality.",
    imageUrl: "https://i.ibb.co/Gf3P2mfD/kopoai-logo.png",
    backgroundColor: "#f0ece0",
    technologies: ["Figma", "User Research", "Wireframing", "Prototyping", "E-commerce Platforms"],
    links: [
      { name: "Website UX", url: "https://www.example.com/kopoai-ux-case-study" },
      { name: "App Prototype", url: "https://www.figma.com/proto/exampleKopoaiMobile" },
    ],
    isLogo: true,
    textSizeClass: null,
    logoSizeClass: "max-h-[6rem]",
    colors: ["#f0ece0", "#5f6253", "#78543b", "#5e6352 "],
  },
  {
    id: "horizon",
    name: "HORIZEN",
    category: "UI/UX",
    subtitle: "Travel app",
    description: "Development of a cross-platform mobile application for outdoor enthusiasts, featuring GPS and offline maps.",
    fullDescription: "Horizon is a comprehensive travel mobile app designed for outdoor enthusiasts. I was responsible for the development of its cross-platform functionality, including GPS tracking for trails, offline map capabilities, and social features that allow users to share their adventures and connect with a community.",
    imageUrl: "https://placehold.co/150x100/4A4A4A/FFFFFF?text=Horizon",
    backgroundColor: "#1a1b2c",
    technologies: ["React Native", "Swift", "Firebase", "Mapbox API", "GPS Integration"],
    links: [
      { name: "App Store", url: "https://apps.apple.com/app/exampleHorizon" },
      { name: "Play Store", url: "https://play.google.com/store/apps/details?id=exampleHorizon" },
    ],
    isLogo: false,
    textSizeClass: "text-4xl md:text-5xl",
    logoSizeClass: null,
    fontFamily: "'Orbitron', sans-serif",
    colors: [ "#d97925" , "#ffffff", "#1a1b2c"],
  },
  {
    id: "onthewall",
    name: "OnTheWall",
    category: "SEO",
    subtitle: "Art marketplace",
    description: "Optimizing the user experience and visual design for an online art marketplace.",
    fullDescription: "Revamped the user experience and visual design of 'OnTheWall', an online marketplace for independent artists. Focused on improving discoverability, streamlining the purchase process, and enhancing the overall aesthetic to attract more users and artists.",
    imageUrl: "https://placehold.co/150x100/0033cc/FFFFFF?text=OnTheWall",
    backgroundColor: "#0033cc",
    technologies: ["Figma", "Shopify", "HTML", "CSS", "JavaScript"],
    links: [
      { name: "Live Site", url: "https://www.example.com/onthewall" },
      { name: "UX Case Study", url: "https://www.example.com/onthewall-ux-case-study" },
    ],
    fontFamily: "'Anton', sans-serif",
    isLogo: false,
    textSizeClass: "text-3xl md:text-4xl",
    logoSizeClass: null,
    colors: ["#0033cc", "#e5e7eb"],
  },
  {
    id: "clouds",
    name: "CLOUDS",
    category: "Graphic Design",
    subtitle: "Generative art project",
    description: "An experimental project exploring dynamic, cloud-like visual formations.",
    fullDescription: "CLOUDS is a generative art piece that uses Perlin noise and particle systems to create endlessly evolving, organic cloud formations. It's a real-time visualization designed for ambient display, exploring the beauty of natural phenomena through code.",
    imageUrl: "https://i.ibb.co/p6qLNCsw/clouds-banner.png",
    backgroundColor: "#fadd2a",
    technologies: ["JavaScript", "HTML5 Canvas", "Perlin Noise Algorithms"],
    links: [
      { name: "Live Demo", url: "https://www.example.com/clouds-demo" },
      { name: "CodePen", url: "https://codepen.io/yourusername/pen/exampleClouds" },
    ],
    isLogo: true,
    textSizeClass: null,
    logoSizeClass: "max-h-full",
    colors: ["#fadd2a", "#0982d1"],
  },
  {
    id: "vaulted",
    name: "VAULTED",
    category: "UI/UX",
    subtitle: "Encryption software",
    description: "Creating a secure and user-friendly interface for data encryption software.",
    fullDescription: "Designed the user interface for Vaulted, a desktop application for secure data encryption and management. Prioritized usability and clear communication of security features, ensuring a complex tool felt intuitive and trustworthy for everyday users.",
    imageUrl: "https://placehold.co/150x100/EF4444/FFFFFF?text=Vaulted",
    backgroundColor: "#646d83",
    technologies: ["Figma", "Electron", "React", "Node.js"],
    links: [
      { name: "Product Page", url: "https://www.example.com/vaulted" },
      { name: "Demo Video", url: "https://www.youtube.com/watch?v=exampleVaulted" },
    ],
    isLogo: false,
    textSizeClass: "text-4xl md:text-5xl",
    logoSizeClass: null,
    fontFamily: "'Anton', sans-serif",
    colors: ["#646d83", "#000000"],
  },
];

const experience = [
  {
    id: "clouds-dev",
    position: "Brand Design & Web Developer",
    company: "Clouds",
    duration: "June 2023 - August 2025",
    description: "Led brand design and full stack web development for Clouds, delivering e-commerce platforms, SEO strategies, and integrated email marketing systems. Built and launched scalable online stores with modern UX/UI, developed product design assets, and created content and ads to support digital campaigns. Helped grow online presence through cohesive branding, performance-optimized code, and targeted marketing assets.",
    technologies: ["Shopify", "React", "HTML/CSS", "JavaScript", "Figma", "Adobe Illustrator", "SEO"],
    backgroundColor: "#3b82f6",
    icon: <Briefcase className="w-12 h-12 text-white" />,
  },
  {
    id: "kwality-klarity-dev",
    position: "Full Stack Developer & UX/UI Designer",
    company: "Kwality & Klarity",
    duration: "October 2024 - May 2025",
    description: "Led full-stack website development for Kwality & Klarity including UX/UI design, API integration, branding strategy, custom blog & newsletter solutions. Delivered responsive, scalable, and user-centric digital products with a focus on performance and design cohesion.",
    technologies: ["React", "Node.js", "Express.js", "MongoDB", "Figma", "API Integration"],
    backgroundColor: "#7c3aed",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    id: "onthewall-dev",
    position: "Full Stack Developer & Digital Marketing Technologist",
    company: "On The Wall",
    duration: "February 2021 - Present",
    description: "Worked as a full stack developer and digital marketing tech specialist at On The Wall. Built and maintained scalable websites, integrated APIs, led SEO strategy, and delivered performance-driven UX/UI design. Contributed to brand visibility and growth through data-backed front-end and back-end development, marketing automation, and analytics integration.",
    technologies: ["HTML", "CSS", "JavaScript", "React", "Node.js", "REST APIs", "SEO", "Google Analytics"],
    backgroundColor: "#dc2626",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="2" rx="1" ry="1" />
      </svg>
    ),
  },
  {
    id: "pixelperfect-design",
    position: "Senior Graphic Designer",
    company: "PixelPerfect Studios",
    duration: "January 2018 - January 2021",
    description: "Led a team of designers in creating visually stunning and effective marketing materials. Specialized in brand identity, UI/UX, and print design.",
    technologies: ["Adobe Creative Suite", "Figma", "Sketch", "Print Design"],
    backgroundColor: "#16a34a",
    icon: <PenTool className="w-12 h-12 text-white" />,
  },
];


// --- Data for new Skills and SEO sections ---
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

const skillsData = [
  { name: "Figma", iconUrl: "https://www.vectorlogo.zone/logos/figma/figma-icon.svg", description: "Expert in UI/UX design, prototyping, and collaborative workflows." },
  { name: "Adobe Photoshop", iconUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Adobe_Photoshop_CC_icon.svg/1024px-Adobe_Photoshop_CC_icon.png", description: "Proficient in image manipulation, digital painting, and graphic design." },
  { name: "Adobe Illustrator", iconUrl: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Adobe_Illustrator_CC_icon.svg", description: "Skilled in vector graphics, logo design, and illustration." },
  { name: "React", iconUrl: "https://www.vectorlogo.zone/logos/reactjs/reactjs-icon.svg", description: "Experienced in building modern, responsive web applications." },
  { name: "HTML5", iconUrl: "https://www.vectorlogo.zone/logos/w3_html5/w3_html5-icon.svg", description: "Proficient in semantic HTML and web structure." },
  { name: "Swift", iconUrl: "https://cdn.jsdelivr.net/npm/simple-icons@5.15.0/icons/swift.svg", description: "Experienced in iOS and macOS application development." },
  { name: "Final Cut Pro", iconUrl: "https://help.apple.com/assets/673BE5C0E115654F7F097772/673BE5C41BAE7922D30F2CE1/en_US/97f5f4dfe6df84d78caacff68ec63538.png", description: "Skilled in professional video editing and post-production." },
  { name: "Python", iconUrl: "https://www.vectorlogo.zone/logos/python/python-icon.svg", description: "Proficient in scripting, data analysis, and AI/ML development." },
  { name: "TensorFlow", iconUrl: "https://www.vectorlogo.zone/logos/tensorflow/tensorflow-icon.svg", description: "Familiar with machine learning model development and deployment." },
  { name: "Tailwind CSS", iconUrl: "https://www.vectorlogo.zone/logos/tailwindcss/tailwindcss-icon.svg", description: "Adept at rapid UI development with utility-first CSS framework." },
  { name: "Three.js", iconUrl: "https://cdn.jsdelivr.net/npm/simple-icons@5.15.0/icons/threedotjs.svg", description: "Experience with 3D graphics and interactive web experiences." },
  { name: "Google Cloud", iconUrl: "https://www.vectorlogo.zone/logos/google_cloud/google_cloud-icon.svg", description: "Familiar with cloud services for deployment and data management." },
];

// --- Component Definitions ---

/**
 * ExpandablePhotosWidget Component
 * Manages the display of a collection of photos with an expand/collapse feature.
 */
const ExpandablePhotosWidget = ({ isExpanded, setIsExpanded, setSelectedImage, collapsedHeight }) => {
  const allPhotos = [
    "https://i.ibb.co/CK0tHVsB/awaken-eye-red.png",
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
  ];

  const collapsedCount = 6;
  const visiblePhotos = isExpanded ? allPhotos : allPhotos.slice(0, collapsedCount);
  const logoWrapperSize = 100;
  const gapSize = 24;
  const containerPadding = 12;
  const numRowsWhenExpanded = Math.ceil(allPhotos.length / 3);
  const actualGridContentHeightExpanded = (numRowsWhenExpanded * logoWrapperSize) + Math.max(0, (numRowsWhenExpanded - 1) * gapSize);
  const expandedContainerHeight = actualGridContentHeightExpanded + (containerPadding * 2);

  return (
    <motion.div
      className="glass-container p-4 flex flex-col"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex justify-between items-center cursor-pointer mb-2" onClick={() => setIsExpanded(!isExpanded)}>
        <div>
          <h3 className="text-white text-lg font-semibold shiny-text">Photos</h3>
          <p className="text-white text-sm shiny-text">Library · {allPhotos.length} Photos</p>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-white/50 transition-transform duration-300 transform rotate-180" />
        ) : (
          <ChevronRight className="w-4 h-4 text-white/50 transition-transform duration-300" />
        )}
      </div>
      <div
        className="rounded-xl overflow-hidden bg-white/10 px-3 py-3 flex items-center justify-center"
        style={{
          height: isExpanded ? `${expandedContainerHeight}px` : collapsedHeight,
          transition: 'height 0.3s ease-out',
        }}
      >
        <motion.div
          className="grid grid-cols-3 gap-6 w-full items-center justify-center"
          layout
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {visiblePhotos.map((url, i) => (
            <motion.div
              key={i}
              className="aspect-square w-full max-w-[100px] mx-auto cursor-pointer flex items-center justify-center"
              initial={false}
              animate={{ opacity: 1 }}
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
        </motion.div>
      </div>
      {isExpanded && allPhotos.length > collapsedCount && (
        <p className="text-white text-xs mt-2 text-center shiny-text">Click arrow to collapse</p>
      )}
    </motion.div>
  );
/**
 * LargeImageViewer Component
 * Displays a selected image in a compact, integrated view.
 */
const LargeImageViewer = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col items-center justify-center bg-white/10 shadow-2xl rounded-xl border-2 border-white/50 p-4 w-full max-w-sm md:max-w-2xl aspect-square"
        style={{ outline: 'none' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-2 left-2 w-10 h-10 bg-red-500/80 backdrop-blur-sm hover:bg-red-600/90 transition-all duration-200 z-10 rounded-full flex items-center justify-center shadow-lg" aria-label="Close image">
          <X className="w-6 h-6 text-white" />
        </button>
        <img
          src={imageUrl}
          alt="Large view"
          className="w-full h-full max-w-full max-h-full object-contain rounded-xl"
          style={{ border: 'none', outline: 'none', WebkitUserSelect: "none", MozUserSelect: "none", msUserSelect: "none", userSelect: "none", WebkitTouchCallout: "none" }}
          onContextMenu={(e) => e.preventDefault()}
        />
        <a href="https://www.behance.net/calvin-portfolio" target="_blank" rel="noopener noreferrer" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <span className="text-white text-7xl md:text-7xl font-bold opacity-20 hover:opacity-40 transition-opacity" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)', userSelect: 'none', }} >
            ©
          </span>
        </a>
      </div>
    </motion.div>
  );
};

// Reusable Project Card component with the new color palette circles
const ProjectCard = ({ project }) => {
  const imageClasses = `h-full w-auto object-contain ${project.logoSizeClass}`;
  
  return (
    <motion.div
      className="glass-container p-4 md:p-6 flex flex-col h-full min-h-[350px]"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className="h-24 md:h-32 rounded-2xl mb-4 flex items-center justify-center overflow-hidden p-2"
        style={{ backgroundColor: project.backgroundColor }}
      >
        {project.isLogo ? (
          <img src={project.imageUrl} alt={project.name + " logo"} className={imageClasses} />
        ) : (
          <h3
            className={`font-bold shiny-text ${project.textSizeClass} ${project.id === 'vaulted' ? 'text-black' : 'text-white'}`}
            style={project.fontFamily ? { fontFamily: project.fontFamily } : {}}
          >
            {project.name}
          </h3>
        )}
      </div>
      <div className="flex items-center gap-2 mb-1">
        <h4 className="text-lg font-semibold text-white shiny-text">{project.name}</h4>
        <div className="flex gap-1">
          {project.colors.map((color, index) => (
            <div
              key={index}
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            ></div>
          ))}
        </div>
      </div>
      <p className="text-sm text-white shiny-text">{project.subtitle}</p>
      <div className="text-sm text-white mb-4 flex-grow shiny-text">{project.description}</div>
      <div className="mt-auto">
        <h4 className="text-xs font-semibold text-white mb-2 shiny-text">Technologies:</h4>
        <div className="flex flex-wrap gap-2 mb-4">
          {project.technologies.map((tech, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-white/10 text-white text-xs rounded-full shiny-text"
            >
              {tech}
            </span>
          ))}
        </div>
        <h4 className="text-xs font-semibold text-white mb-2 shiny-text">Links:</h4>
        <div className="flex flex-wrap gap-4">
          {project.links.map((link, index) => (
            <motion.a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-white hover:underline"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <Link className="w-4 h-4" />
              <span className="shiny-text">{link.name}</span>
            </motion.a>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// A new Experience Card component
const ExperienceCard = ({ item }) => (
  <motion.div
    className="glass-container p-6 flex flex-col h-full"
    whileHover={{ scale: 1.05 }}
    transition={{ duration: 0.2 }}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center p-2 shadow-lg" style={{ backgroundColor: item.backgroundColor }}>
          <div className="text-white">
            {item.icon}
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold shiny-text">{item.position}</h3>
          <p className="text-md text-white/80 shiny-text">{item.company}</p>
        </div>
      </div>
      <span className="text-sm text-white/50 shiny-text">{item.duration}</span>
    </div>
    <p className="text-white shiny-text mb-4 flex-grow">{item.description}</p>
    <div className="mt-auto">
      <h4 className="text-sm font-semibold text-white mb-2 shiny-text">Technologies:</h4>
      <div className="flex flex-wrap gap-2">
        {item.technologies.map((tech, index) => (
          <span key={index} className="px-3 py-1 bg-white/10 text-white text-xs rounded-full shiny-text">
            {tech}
          </span>
        ))}
      </div>
    </div>
  </motion.div>
);

// A new Dynamic Quote Widget that uses a generative AI model
const DynamicQuoteWidget = () => {
  const [quote, setQuote] = useState({ text: "Loading quote...", author: "" });
  const [isLoading, setIsLoading] = useState(false);

  const fetchQuote = async () => {
    setIsLoading(true);
    try {
      const prompt = "Generate a very short, one-sentence, insightful quote about technology, design, or success from an iconic, famous person. Do not include their name in the quote text.";
      
      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      
      const payload = { 
        contents: chatHistory,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              "quote": { "type": "STRING" },
              "author": { "type": "STRING" }
            },
            "propertyOrdering": ["quote", "author"]
          }
        }
      };
      
      const apiKey = ""
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const json = result.candidates[0].content.parts[0].text;
        const parsedJson = JSON.parse(json);
        setQuote({ text: parsedJson.quote, author: parsedJson.author });
      } else {
        console.error("API response did not contain a valid quote.");
        setQuote({ text: "Failed to generate a quote.", author: "Error" });
      }
      
    } catch (error) {
      console.error("Error fetching quote:", error);
      setQuote({ text: "An error occurred.", author: "Error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <div className="glass-container p-6 rounded-3xl flex flex-col items-center text-center h-full">
      <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-white shiny-text">Visionary Quote</h2>
      <div className="text-white text-lg italic mb-4 min-h-[4rem] flex items-center justify-center flex-grow">
        {isLoading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <div className="shiny-text">
            <p className="text-xl mb-2">"{quote.text}"</p>
            <p className="text-sm font-light text-white">- {quote.author}</p>
          </div>
        )}
      </div>
      <button 
        onClick={fetchQuote} 
        disabled={isLoading}
        className={`glass-button px-4 py-2 mt-auto rounded-full font-semibold ${isLoading ? 'bg-white/10 text-white cursor-not-allowed' : 'bg-white/10 text-white hover:bg-white/20'}`}
      >
        {isLoading ? 'Generating...' : 'New Quote'}
      </button>
    </div>
  );
};

// Skill Card Component
const SkillCard = ({ skill }) => (
  <motion.div
    className="glass-container p-4 rounded-xl flex items-center space-x-4 h-full"
    whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(0,0,0,0.3)" }}
    transition={{ duration: 0.2 }}
  >
    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
      <img src={skill.iconUrl} alt={`${skill.name} icon`} className="w-10 h-10 object-contain filter invert" />
    </div>
    <div className="flex-grow">
      <h4 className="text-lg font-semibold text-white shiny-text">{skill.name}</h4>
      <p className="text-sm text-white shiny-text">{skill.description}</p>
    </div>
  </motion.div>
);

// New Skills and SEO section component
const SkillAndSEOSection = () => {
  return (
    <>
      <section id="seo-services" className="space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-white text-center shiny-text">SEO Services</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {seoServices.map((service, index) => (
            <motion.div
              key={index}
              className="glass-container p-4 rounded-xl flex flex-col items-center justify-center text-center space-y-2"
              whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(0,0,0,0.3)" }}
              transition={{ duration: 0.2 }}
            >
              {service.icon}
              <p className="text-white text-sm font-medium mt-2 shiny-text">{service.name}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="skills-list" className="space-y-6 mt-12">
        <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-white text-center shiny-text">Skills</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skillsData.map((skill, index) => (
            <SkillCard key={index} skill={skill} />
          ))}
        </div>
      </section>
    </>
  );
};

// Custom icons
const BehanceIcon = ({ size = 24, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M20.07 6.35H15.8v-1.4h4.27v1.4zm-3.4 3.54c.7 0 1.31-.29 1.68-.78.37-.49.51-1.12.41-1.76-.1-.65-.43-1.24-1.01-1.56-.58-.32-1.28-.32-1.86 0-.58.32-.91.91-1.01 1.56-.1.64.04 1.27.41 1.76.37.49.98.78 1.68.78zm3.4.52c0 1.48-.83 2.67-2.02 3.16-1.19.49-2.57.32-3.58-.44-1.01-.76-1.54-1.96-1.38-3.16.16-1.2.95-2.26 2.06-2.78 1.11-.52 2.41-.39 3.39.34.98.73 1.53 1.88 1.53 3.16v-.28zM9.52 8.51c-.3-.12-.64-.18-.98-.18H6.08v2.8h2.17c.49 0 .93-.19 1.22-.52.29-.33.43-.77.36-1.21-.07-.44-.27-.82-.56-1.08-.29-.26-.66-.37-1.08-.37l.33.56zm-.3 3.97c.49 0 .93.19 1.22.52.29.33.43.77.36 1.21-.07.44-.27.82-.56 1.08-.29.26-.66.37-1.08.37H6.08v-2.8h2.17c.34 0 .68-.06.98-.18l-.01-.2zM4.02 6.58v10.84h4.54c.86 0 1.68-.23 2.38-.67.7-.44 1.25-1.06 1.57-1.79.32-.73.4-1.54.22-2.32-.18-.78-.6-1.49-1.21-2.03.61-.54 1.03-1.25 1.21-2.03.18-.78.1-1.59-.22-2.32-.32-.73-.87-1.35-1.57-1.79-.7-.44-1.52-.67-2.38-.67H4.02v-.22z"/>
  </svg>
);

const TwitterIcon = ({ size = 24, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedInIcon = ({ size = 24, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const EmailIcon = ({ size = 24, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <path d="m22 6-10 7L2 6"/>
  </svg>
);

/**
 * AIDevWidget Component
 * Manages the display of the AI Dev content with an expand/collapse feature for its description.
 */
const AIDevWidget = ({ isExpanded, setIsExpanded, collapsedHeight }) => {
  const showAIDevDescription = isExpanded;
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let frame = 0;
    let animationFrameId;

    const draw = () => {
      const w = canvas.width = canvas.offsetWidth;
      const h = canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      const centerX = w / 2;
      const centerY = h / 2;
      const radius = Math.min(w, h) / 2 - 20;
      const numLines = 18;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.fillStyle = '#000000';

      for (let i = 0; i < numLines; i++) {
        const angle = (i / numLines) * 2 * Math.PI;
        const endX = centerX + radius * Math.cos(angle);
        const endY = centerY + radius * Math.sin(angle);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        const numDots = 4;
        for (let j = 1; j <= numDots; j++) {
          const baseRadius = radius * (j / (numDots + 1));
          const wavePhase = frame * 0.015;
          const dotPhase = wavePhase - (j * 0.5);
          const waveOffset = Math.sin(dotPhase + Math.PI) * 15;
          const dotRadius = baseRadius + waveOffset;
          const dotX = centerX + dotRadius * Math.cos(angle);
          const dotY = centerY + dotRadius * Math.sin(angle);
          const sizeMultiplier = Math.sin(dotPhase + Math.PI/2) * 0.5 + 1.2;
          const dotSize = 3 * sizeMultiplier;
          ctx.beginPath();
          ctx.arc(dotX, dotY, dotSize, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
      frame++;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <motion.div
      className="glass-container p-4 flex flex-col"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex justify-between items-center cursor-pointer mb-2" onClick={() => setIsExpanded(!isExpanded)}>
        <div>
          <h3 className="text-white text-lg font-semibold shiny-text">AI Dev</h3>
          <p className="text-white text-sm shiny-text">v0id - Synthetic Mind · Recents</p>
        </div>
        {showAIDevDescription ? (
          <ChevronDown className="w-4 h-4 text-white/50 transition-transform duration-300 transform rotate-180" />
        ) : (
          <ChevronRight className="w-4 h-4 text-white/50 transition-transform duration-300" />
        )}
      </div>
      <div
        className="rounded-xl overflow-hidden bg-[#bdc0a7] px-3 py-3 flex items-center justify-center"
        style={{
          height: collapsedHeight,
        }}
      >
        <canvas ref={canvasRef} className="w-[calc(100%-24px)] h-[calc(100%-24px)]"></canvas>
      </div>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: isExpanded ? 1 : 0, height: isExpanded ? 'auto' : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        {isExpanded && (
          <p className="text-white text-sm mt-4 shiny-text">
            The Synthetic Mind, a core project by v0id, is an interactive AI art piece designed to simulate complex cognitive processes. It maintains a dynamic semantic network of concepts, an episodic memory of past thoughts, and a set of internal drives (curiosity, purpose, etc.). This architecture allows the mind to generate reflective thoughts by prompting a large language model with rich context, including recent internal monologues, key focus concepts, and its evolving identity. It can also ingest external data, like Wikipedia summaries, to simulate continuous learning and growth. The result is a compelling, real-time display of an AI's internal world, inviting users to observe and interact with a truly evolving digital consciousness, offering a unique glimpse into an artificial mind's inner workings.
          </p>
        )}
      </motion.div>
    </motion.div>
  );
};

/**
 * TopNav Component
 * The fixed navigation bar at the top, now always visible and 50% smaller.
 */
const TopNav = ({ handleNavLinkClick }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  const formatDateTime = (date) => {
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    const weekday = date.toLocaleString('en-US', { weekday: 'short' });
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = hours.toString().padStart(2, '0');

    return `${month} ${day} ${weekday}, ${formattedHours}:${minutes} ${ampm}`;
  };

  return (
    <div className="fixed top-5 left-0 right-0 z-40 hidden md:block">
      <div className="flex justify-center p-2">
        <div className="glass-container flex gap-6 px-4 py-2 items-center">
          {navItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNavLinkClick(item.id)}
              className="flex items-center gap-1 text-white/70 hover:text-white transition-colors duration-200 cursor-pointer text-xs"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                {item.icon}
              </div>
              <span className="font-semibold shiny-text">{item.label}</span>
            </div>
          ))}
          <div className="h-4 w-px bg-white/20 mx-2"></div>
          <div className="text-white text-xs font-semibold shiny-text">
            {formatDateTime(time)}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * MobileNav Component
 * The collapsible navigation menu for mobile devices.
 */
const MobileNav = ({ isNavOpen, closeNav, handleNavLinkClick }) => {
  return (
    <AnimatePresence>
      {isNavOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: "0%" }}
          exit={{ x: "100%" }}
          transition={{ type: "tween", duration: 0.3 }}
          className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-lg md:hidden"
        >
          <div className="p-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-12">
              <span className="text-2xl font-bold shiny-text">Menu</span>
              <button onClick={closeNav} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <X />
              </button>
            </div>
            <ul className="flex-grow space-y-6">
              {navItems.map((item) => (
                <li
                  key={item.id}
                  onClick={() => {
                    handleNavLinkClick(item.id);
                    closeNav();
                  }}
                  className="flex items-center gap-4 text-xl py-2 rounded-md cursor-pointer text-white hover:text-white hover:bg-white/5"
                >
                  {item.icon} <span className="shiny-text">{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
