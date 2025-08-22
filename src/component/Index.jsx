import React from "react";
import pexels from "../assets/pexels.jpeg";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="container mx-auto my-6 sm:my-10 px-4 sm:px-6 lg:px-8 overflow-y-auto">
      <section className="bg-gradient-to-br from-[#13072e] to-[#3e207f] text-white flex flex-col md:flex-row items-center justify-center p-6 sm:p-10 lg:p-16 rounded-[30px] sm:rounded-[50px] h-auto min-h-screen">
        {/* Left Section */}
        <div className="w-full sm:w-1/2 md:w-1/2 text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">Hello!</h1>
          <p className="mt-2 text-base sm:text-lg lg:text-xl">
            Welcome to the world of Andar Bahar
          </p>
          <Link
            to="/Login"
            className="inline-block mt-4 border-2 border-white px-5 sm:px-6 py-2 sm:py-3 rounded-full text-white text-base sm:text-lg transition duration-300 hover:bg-white hover:text-[#2e1e8c]"
          >
            →
          </Link>
        </div>

        {/* Right Section */}
        <div className="w-full md:w-1/2 flex justify-center mt-6 md:mt-0">
          <div
            className="w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] md:w-[250px] md:h-[250px] bg-[#C69C6D] rounded-[25%] flex justify-center items-center overflow-hidden"
            style={{
              clipPath:
                "polygon(29.8% 0%, 70.2% 0%, 100% 29.5%, 100% 70.5%, 70.2% 100%, 29.8% 100%, 0% 70.5%, 0% 29.5%)",
            }}
          >
            <img
              src={pexels}
              alt="Andar Bahar Game"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
