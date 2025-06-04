import React from 'react';
import heroImage from "../assets/images/heroImage.png";
import InteractiveImageMap from "../components/InteractiveImageMap";
import mapImage from "../assets/images/map.jpg";
import datumImage from "../assets/images/datum.jpg";
import heroImage2 from "../assets/images/heroImage2.png";
import Wave from "../components/Wave.jsx";
import HomeNavbar from '../components/HomeNavbar';
import { useNavigate } from 'react-router-dom';
import { FaInfoCircle } from 'react-icons/fa';
import { IoInformation } from 'react-icons/io5';

const Home = () => {
    const navigate = useNavigate();

    return (
        <>
        <HomeNavbar />
        <div id='home' className='home'>
            <div className="container mx-auto px-4">
                {/* Interactive Image Map Section */}
                <div id="map" className="hero grid md:grid grid-cols-1 items-center gap-5 pt-19 mb-20 hidden md:block">
                    <div className="h-[700px]">
                    <InteractiveImageMap />
                    </div>
                </div>
            </div>

            {/* Section Features */}
            <div id="features" className="w-full min-h-screen bg-cover bg-top bg-no-repeat relative" style={{backgroundImage: `url(${heroImage})`}}>
                <div className="container mx-auto px-18 relative z-10 h-full flex items-center py-20 md:py-45">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-white">
                        <div className="flex flex-col justify-center">
                            <h2 className="text-5xl md:text-8xl font-bold mb-2 md:mb-4">OUR</h2>
                            <h2 className="text-5xl md:text-8xl font-bold mb-8 md:mb-4">SERVICES</h2>
                        </div>

                        <div className="flex flex-col gap-6 md:gap-8">
                            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                                {/* Feature 1 */}
                                <div 
                                className="rounded-2xl p-6 bg-cover bg-center bg-no-repeat relative h-[250px] md:h-[400px] w-full md:w-1/2 cursor-pointer transition-transform duration-300 transform hover:scale-105"
                                style={{
                                    backgroundImage: `url(${mapImage})`
                                }}
                                onClick={() => navigate('/services/map')}
                                >
                                    <div className="relative z-10 h-full flex flex-col justify-end">
                                        <h3 className="text-xl md:text-2xl font-semibold mb-2 text-white">MAP</h3>
                                        <p className="text-sm md:text-base text-gray-200 mb-2">A visualization of grids across OSES-ONWJ</p>
                                    </div>
                                </div>

                                {/* Feature 2 */}
                                <div 
                                className="rounded-2xl p-6 bg-cover bg-center bg-no-repeat relative h-[250px] md:h-[400px] w-full md:w-1/2 cursor-pointer transition-transform duration-300 transform hover:scale-105"
                                style={{
                                    backgroundImage: `url(${datumImage})`
                                }}
                                onClick={() => navigate('/services/datum')}
                                >
                                    <div className="relative z-10 h-full flex flex-col justify-end">
                                        <h3 className="text-xl md:text-2xl font-semibold mb-2 text-white">DATUM</h3>
                                        <p className="text-sm md:text-base text-gray-200 mb-2">Providing datum information and graphs across OSES-ONWJ</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Wave Overlay */}
                <div className="absolute bottom-0 left-0 w-full">
                    <Wave />
                </div>
            </div>

            {/* About Section */}
            <div id="about" className="w-full min-h-screen px-18 bg-cover bg-no-repeat relative" style={{backgroundImage: `url(${heroImage2})`, backgroundPosition: 'center -100px'}}>
                <div className="container grid grid-cols-1 lg:grid-cols-2 mx-auto px-4 h-full py-20 md:py-50">
                    <div className="text-white flex items-center">
                        <div>
                            <h2 className="text-4xl md:text-7xl font-bold mb-4">WHY US?</h2>
                            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-amber-300">ACCESSIBLE, AFFORDABLE, HIGH-QUALITY DATA</h2>
                            <p className="text-base md:text-xl text-gray-300">We believe that access to reliable data should be easy, cost-effective, and uncompromising in quality. Our integrated platform delivers vertical datum information across 5,667.11 km² in the OSES area and 8,300 km² in the ONWJ region. 
                                Designed with precision and usability in mind, our solution empowers better decisions, faster workflows, and long-term value for every client.</p>
                                <button className="bg-white text-black mt-5 px-4 py-2 rounded-4xl hover:bg-gray-300 transition-colors duration-300 flex items-center gap-2" onClick={() => navigate('/about')}>
                                    <FaInfoCircle className="text-lg" />About Us
                                </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
    };

export default Home;