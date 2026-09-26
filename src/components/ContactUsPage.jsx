import React, { useState } from "react";
import { Send, Phone, Mail, MapPin, Users } from "lucide-react";

const ContactUsPage = () => {
  const [formData, setState] = useState({
    name: "",
    email: "",
    message: "",
  });

  return (
    <div className="relative w-full h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Glassmorphism container */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl">
        {/* Contact form section */}
        <div className="w-full md:w-3/5 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-8 border border-white border-opacity-20">
          <h2 className="text-3xl font-bold mb-6 text-white">Contact Us</h2>

          <form className="space-y-6">
            <div>
              <label className="block text-white mb-2">Name</label>
              <input
                type="text"
                className="w-full p-3 bg-white bg-opacity-10 rounded-lg border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-[#0066CC]" // Updated focus ring color
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-white mb-2">Email</label>
              <input
                type="email"
                className="w-full p-3 bg-white bg-opacity-10 rounded-lg border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-[#0066CC]" // Updated focus ring color
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-white mb-2">Message</label>
              <textarea
                className="w-full p-3 bg-white bg-opacity-10 rounded-lg border border-white border-opacity-20 text-white h-32 resize-none focus:outline-none focus:ring-2 focus:ring-[#0066CC]" // Updated focus ring color
                placeholder="How can we help you?"
              ></textarea>
            </div>

            <button className="w-full bg-[#0066CC] hover:bg-[#004C99] text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center">
              <Send className="mr-2 h-5 w-5" />
              Send Message
            </button>
          </form>
        </div>

        {/* Info section */}
        <div className="w-full md:w-2/5 bg-gradient-to-br from-[#0066CC] to-[#004C99] p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white mb-8">Get in touch</h3>

            <div className="space-y-6">
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 p-3 rounded-full mr-4">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white opacity-70">Email</p>
                  <p className="text-white font-semibold">medsai@gmail.com</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 p-3 rounded-full mr-4">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white opacity-70">Address</p>
                  <p className="text-white font-semibold">
                    Christ College of Engineering
                    <br />
                    Irinjalakuda, Kerala
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
