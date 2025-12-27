import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Box, Circle, Hexagon, Triangle, Layers, Zap, Globe, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import HeroScene3D from '../components/3d/HeroScene3D';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxh6VbUelFd_e1HWSpz9K6D7w-il_i39BWdq5oXwy5SUraOhhsNKOKHY4LrIjbmd0ZghA/exec";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (GOOGLE_SCRIPT_URL === "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE") {
      toast.error("Contact form is not connected. Please configure the Google Script URL.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Using 'no-cors' mode because Google Apps Script doesn't return CORS headers for simple POSTs
      // We won't get a readable response, but the data will be sent.
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // Since we can't read the response in no-cors, we assume success if no network error thrown
      toast.success("Message sent successfully!");
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error("Form error:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const unfoldVariant = {
    hidden: { opacity: 0, rotateX: -15, y: 50, scale: 0.9, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      rotateX: 0,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 1, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  // Typewriter Text Logic
  const heroText = "WE BUILD";
  const heroAccent = "DIGITAL SOUL.";

  const sentenceVariant = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.5,
        staggerChildren: 0.08,
      },
    },
  };

  const letterVariant = {
    hidden: { opacity: 0, y: 0 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen font-sans selection:bg-purple-500 selection:text-white overflow-x-hidden perspective-1000">

      {/* 1. Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 md:px-20 overflow-hidden pt-20">
        {/* 3D Background */}
        <HeroScene3D />

        <div className="w-full z-10 flex flex-col items-start justify-center pointer-events-none px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-4 pointer-events-auto w-full flex flex-col items-start"
          >
            <div className="flex flex-col items-start justify-center text-left">
              <motion.h1
                className="font-black tracking-tighter text-white whitespace-nowrap"
                style={{ fontSize: '6vw', lineHeight: 0.9 }}
                variants={sentenceVariant}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {heroText.split("").map((char, index) => (
                  <motion.span key={index} variants={letterVariant}>
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </motion.h1>

              <motion.h1
                className="font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#b084ff] to-[#6d6aff] whitespace-nowrap"
                style={{ fontSize: '6vw', lineHeight: 0.9 }}
                variants={sentenceVariant}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {heroAccent.split("").map((char, index) => (
                  <motion.span key={index} variants={letterVariant}>
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </motion.h1>
            </div>

            <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-gray-400 max-w-2xl text-left leading-relaxed font-light pt-8">
              We bridge the gap between Startups and Investors. A premium network designed for the bold, the visionary, and the relentless.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex gap-6 pt-6">
              {!user && (
                <button
                  onClick={() => navigate('/signup')}
                  className="px-12 py-6 bg-white text-black font-bold text-xl rounded-full hover:bg-gray-200 transition-all flex items-center gap-3 group"
                >
                  Get Started <ArrowRight className="group-hover:translate-x-1 transition-transform w-6 h-6" />
                </button>
              )}
              <button
                onClick={() => navigate('/opportunities')}
                className="px-12 py-6 border border-white/20 text-white font-bold text-xl rounded-full hover:bg-white/5 hover:border-white/40 transition-all"
              >
                Explore
              </button>
            </motion.div>
          </motion.div>

          {/* Abstract Visual Removed in favor of full 3D Background */}
        </div>
      </section>

      {/* 2. Featured Work Section */}
      <section className="py-32 px-6 md:px-20 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={unfoldVariant}
            viewport={{ once: true, margin: "-100px" }}
            className="flex justify-between items-end mb-16 border-b border-white/10 pb-8"
          >
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">FEATURED <br /> OPPORTUNITIES</h2>
            <p className="text-gray-400 hidden md:block text-xl">Curated for high-growth potential.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                initial="hidden"
                whileInView="visible"
                variants={unfoldVariant}
                transition={{ delay: item * 0.1, duration: 0.8 }}
                viewport={{ once: true, margin: "-50px" }}
                className="group cursor-pointer"
              >
                <div className="aspect-[4/3] bg-gray-900 overflow-hidden relative mb-6 rounded-sm">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                    <span className="text-white font-bold text-xl tracking-wide flex items-center gap-2">View Project <ArrowRight size={20} /></span>
                  </div>
                  <img
                    src={`https://picsum.photos/seed/${item + 10}/800/600`} // Placeholder using picsum
                    alt="Project"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-[0.22,1,0.36,1] grayscale group-hover:grayscale-0"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-2">FinTech Revolution {item}</h3>
                <p className="text-sm text-gray-500 uppercase tracking-widest">Seed Round • $2M</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Services Section */}
      <section className="py-32 px-6 md:px-20">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            variants={unfoldVariant}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold mb-24 text-center"
          >
            OUR ECOSYSTEM
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-white/10 border border-white/10">
            {[
              { icon: Layers, title: "Strategy", desc: "Data-driven insights for startups." },
              { icon: Box, title: "Branding", desc: "Crafting identities that standout." },
              { icon: Globe, title: "Networking", desc: "Connecting global visionaries." },
              { icon: Zap, title: "Funding", desc: "Accelerating growth capital." }
            ].map((service, idx) => (
              <motion.div
                key={idx}
                initial="hidden"
                whileInView="visible"
                variants={unfoldVariant}
                transition={{ delay: idx * 0.1, duration: 0.8 }}
                viewport={{ once: true }}
                className="bg-[#0a0a0a] p-12 group hover:bg-[#111] transition-colors"
              >
                <service.icon className="w-12 h-12 mb-8 text-gray-500 group-hover:text-purple-400 transition-colors" />
                <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                <p className="text-base text-gray-500 leading-relaxed group-hover:text-gray-300 transition-colors">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. About Section */}
      <section className="py-24 px-6 md:px-20 bg-white text-black overflow-hidden relative">
        <motion.div
          initial={{ x: "100%" }}
          whileInView={{ x: "-100%" }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 whitespace-nowrap text-[200px] font-black text-gray-100 opacity-50 select-none pointer-events-none"
        >
          PLAYFUL SHARP FOCUSED
        </motion.div>

        <div className="max-w-4xl mx-auto relative z-10 text-center mt-20">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold mb-8 tracking-tighter"
          >
            WE ARE THE <br /> CATALYST.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-600 leading-relaxed font-medium"
          >
            Startups are messy. Investing is risky. We simplify the chaos.
            Our platform isn't just a tool; it's a meticulously crafted environment
            where ambition meets opportunity.
          </motion.p>
        </div>
      </section>

      {/* 5. Contact Section */}
      <section className="py-24 px-6 md:px-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-8">LET'S WORK <br /> TOGETHER.</h2>
            <p className="text-gray-400 text-lg mb-8">
              Have a groundbreaking idea? Or looking to invest in the next big thing?
              Drop us a line.
            </p>
            <a href="mailto:copstar902@gmail.com" className="text-2xl font-bold border-b border-white pb-1 inline-block hover:text-purple-400 hover:border-purple-400 transition-colors">
              copstar902@gmail.com
            </a>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
            onSubmit={handleSubmit}
          >
            <div>
              <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-gray-500">Name</label>
              <input
                type="text"
                className="w-full bg-transparent border-b border-white/20 py-3 text-xl focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-gray-500">Email</label>
              <input
                type="email"
                className="w-full bg-transparent border-b border-white/20 py-3 text-xl focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="jane@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-gray-500">Message</label>
              <textarea
                rows="4"
                className="w-full bg-transparent border-b border-white/20 py-3 text-xl focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Tell us about your vision..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-10 py-4 bg-white text-black font-bold text-lg rounded-full hover:bg-purple-500 hover:text-white transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </motion.form>
        </div>
      </section>

      <footer className="py-12 px-6 md:px-20 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
        <p>&copy; 2025 StartupConnect. All rights reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Twitter</a>
          <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
        </div>
      </footer>
    </div>
  );
};

export default Home;
