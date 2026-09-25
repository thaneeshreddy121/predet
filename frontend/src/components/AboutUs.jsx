


import React from 'react';

import { Link } from 'react-router-dom'

const AboutUs = () => {

  return (
    <div className="relative min-h-screen overflow-hidden p-5">
      {/* Light gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-300/30 to-blue-500/30 z-0"></div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen p-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col items-center mb-16">
            <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">About Us</h1>
            <div className="w-32 h-1 bg-white/80 rounded-full"></div>
          </div>

                    {/* Content Sections */}
                    <div className="grid md:grid-cols-12 gap-8 text-white">
            {/* Our Story */}
            <div className="md:col-span-7 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-[60px] shadow-xl"></div>
              <div className="relative p-10 z-10">
                <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                <strong>AI-Powered Health, One Step Ahead.</strong>
                <p className="text-lg">
                MEDS AI is revolutionizing healthcare with AI-driven disease prediction. By analyzing symptoms in real time, it connects users to accurate diagnoses and the right medical care—faster, smarter, and more precise than ever before.
                </p>
              </div>
            </div>

            {/* Our Mission */}
            <div className="md:col-span-5 relative group md:mt-16">
              <div className="absolute inset-0 bg-gradient-to-bl from-blue-500 to-indigo-600 rounded-[45px] shadow-xl"></div>
              <div className="relative p-8 z-10">
                <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                <p className="text-lg">
                  We're on a mission to revolutionize how people interact with technology. 
                </p>
              </div>
            </div>

            {/* Our Team */}
            <div className="md:col-span-5 relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-blue-400 rounded-[70px] shadow-xl"></div>
              <div className="relative p-8 z-10">
                <h2 className="text-3xl font-bold mb-4">Our Team</h2>
                <p className="text-lg">
                Our diverse team—Adhith K L, Ann Geo, and Tony K Seby, guided by Ms. Iris Jose—brings together expertise from various fields,
                 united by a shared passion for innovation. We believe in collaboration, creativity, and continuous learning, driving the future of AI-powered healthcare.
                </p>
              </div>
            </div>

            {/* Our Values */}
            <div className="md:col-span-7 relative group md:mt-8">
              <div className="absolute inset-0 bg-gradient-to-l from-cyan-500 to-blue-600 rounded-[55px] shadow-xl transform transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl"></div>
              <div className="relative p-10 z-10">
                <h2 className="text-3xl font-bold mb-4">Our Values</h2>
                <div className="grid grid-cols-2 gap-4 text-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                    <span>Innovation in everything</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                    <span>Integrity in relationships</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                    <span>Impact through solutions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                    <span>Inclusivity in community</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Rotating Crates Section */}
          <div className="mt-16 flex flex-col md:flex-row items-center justify-between">
            {/* Contact Section */}
            <div className="md:w-2/3 relative overflow-hidden group mb-8 md:mb-0">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[100px] shadow-xl"></div>
              <div className="relative p-8 text-white z-10">
                <h2 className="text-3xl font-bold mb-4 text-center">Get In Touch</h2>
                <p className="text-lg text-center mb-6">
                  We'd love to hear from you. Let's start a conversation.
                </p>
                <div className="flex justify-center">
                  <Link to ="/contact" className="px-8 py-3 bg-white text-blue-600 font-bold rounded-full hover:bg-opacity-90">
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>

            {/* Rotating Crates with Hover Effect */}
{/*             <div 
              ref={cratesRef} 
              className="md:w-1/3 h-48 relative z-30 flex justify-center"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {[
                { color1: "blue-400", color2: "cyan-300", id: 0, link: "https://www.linkedin.com/in/adhithkl/", img: adhiImage, name: "Adhith" },
                { color1: "cyan-400", color2: "blue-300", id: 2, link: "https://www.linkedin.com/in/anngeo/", img: annImage, name: "Ann" },
                { color1: "indigo-400", color2: "blue-300", id: 1, link: "https://www.linkedin.com/in/tonykseby/", img: tonyImage, name: "Tony" }
              ].map((colorSet) => (
                <a 
                  key={colorSet.id}
                  href={colorSet.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`crate absolute w-24 h-24 bg-gradient-to-br from-${colorSet.color1} to-${colorSet.color2} rounded-2xl shadow-lg opacity-80 transition-all duration-300 hover:opacity-100 hover:scale-110 flex items-center justify-center overflow-hidden`}
                >
               
                  <img 
                    src={colorSet.img} 
                    alt={colorSet.name} 
                    className="w-full h-full object-cover rounded-2xl"
                  />
                  
                
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-medium text-sm">{colorSet.name}</p>
                  </div>
                </a>
              ))}
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
