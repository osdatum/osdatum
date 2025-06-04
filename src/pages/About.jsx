import React from 'react'
import shafa from "../assets/images/shafa.png"
import agung from "../assets/images/agung.png"
import nadine from "../assets/images/nadine.png"
import adhima from "../assets/images/adhima.png"
import atha from "../assets/images/atha.png"

const About = () => {
  return (
    <div className="About">
      <div className="container mx-auto px-4">
        <div className="box items-center">
          <section className="py-20 px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold mt-9">About Us</h1>
            </div>
          </section>

          <section className="py-16 px-18">
            <div className="mx-auto grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">About OSDATUM</h2>
                <p className="text-gray-600 leading-relaxed text-justify">
                  OSDATUM is a specialized platform designed to deliver precise vertical datum data for the OSES-ONWJ region in Indonesia. Developed to support hydrographic, geodetic, and offshore construction activities, OSDATUM ensures access to standardized, high-accuracy reference surfaces essential for reliable elevation control, structural alignment, and site development.
                </p>
                <p className="mt-4 text-gray-600 leading-relaxed text-justify">
                  The platform is committed to maintaining data integrity, consistency, and compliance with industry standards.
                </p>
                <p className="mt-4 text-gray-600 leading-relaxed text-justify">
                  <a 
                    href="/OSDATUM-MANUAL.pdf" 
                    download 
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Manual Book
                  </a>
                </p>
              </div>
              <img src="https://www.treehugger.com/thmb/zirXV1Ddz_c6vTekTTFAL07nwMU=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/__opt__aboutcom__coeus__resources__content_migration__mnn__images__2010__05__shutterstock_680239339-67a685cc223f41778a8009fef2bcbbc3.jpg" alt="Our Team" className="rounded-lg shadow-lg"/>
            </div>
          </section>

          {/* Team Section */}
          <section className="py-16 px-18">
            {/* Title Section */}
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-center">Our Development Team</h2>
            </div>
            <div className="mx-auto py-6 md:py-12">
              <div className="bg-white shadow-md p-3 md:p-5">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4">
                  {/* First Row */}
                  {/* Team Member 1 */}
                  <div className="flex flex-col items-center">
                    <div className="aspect-[4/5] w-36 md:w-50 mb-2 border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
                      <img src={shafa} alt="Shafa Nur Hafizah" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-xs md:text-sm font-semibold mb-1 text-center">Shafa Nur Hafizah</h3>
                    <p className="text-gray-600 mb-1 text-[10px] md:text-xs text-center">Team Leader</p>
                  </div>

                  {/* Team Member 2 */}
                  <div className="flex flex-col items-center">
                    <div className="aspect-[4/5] w-36 md:w-50 mb-2 border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
                      <img src={agung} alt="Moch. Agung P. Wibowo" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-xs md:text-sm font-semibold mb-1 text-center">Moch. Agung P. Wibowo</h3>
                    <p className="text-gray-600 mb-1 text-[10px] md:text-xs text-center">Web Developer</p>
                  </div>

                  {/* Team Member 3 */}
                  <div className="flex flex-col items-center">
                    <div className="aspect-[4/5] w-36 md:w-50 mb-2 border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
                      <img src={nadine} alt="Daiva Nadine Pratiwi" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-xs md:text-sm font-semibold mb-1 text-center">Daiva Nadine Pratiwi</h3>
                    <p className="text-gray-600 mb-1 text-[10px] md:text-xs text-center">Data Processor</p>
                  </div>

                  {/* Team Member 4 */}
                  <div className="flex flex-col items-center">
                    <div className="aspect-[4/5] w-36 md:w-50 mb-2 border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
                      <img src={adhima} alt="Adhima Al Azmy" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-xs md:text-sm font-semibold mb-1 text-center">Adhima Al Azmy</h3>
                    <p className="text-gray-600 mb-1 text-[10px] md:text-xs text-center">Data Processor</p>
                  </div>

                  {/* Team Member 5 */}
                  <div className="flex flex-col items-center">
                    <div className="aspect-[4/5] w-36 md:w-50 mb-2 border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
                      <img src={atha} alt="Atha Helmizahran" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-xs md:text-sm font-semibold mb-1 text-center">Atha Helmizahran</h3>
                    <p className="text-gray-600 mb-1 text-[10px] md:text-xs text-center">Engineer</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Supervisor Section */}
          <section className="py-16 px-18">
            {/* Title Section */}
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-center">Our Supervisor</h2>
            </div>
            <div className="mx-auto py-6 md:py-12">
              <div className="bg-white shadow-md p-3 md:p-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 justify-items-center">
                  {/* Supervisor 1 */}
                  <div className="flex flex-col items-center">
                    <div className="aspect-[4/5] w-36 md:w-50 mb-2 border border-gray-200 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24 md:w-32 md:h-32 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                    <h3 className="text-xs md:text-sm font-semibold mb-1 text-center">Prof. Dr.rer.nat. Poerbandono, S.T., M.M.</h3>
                    <p className="text-gray-600 mb-1 text-[10px] md:text-xs text-center">Supervisor 1</p>
                  </div>

                  {/* Supervisor 2 */}
                  <div className="flex flex-col items-center">
                    <div className="aspect-[4/5] w-36 md:w-50 mb-2 border border-gray-200 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24 md:w-32 md:h-32 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                    <h3 className="text-xs md:text-sm font-semibold mb-1 text-center">Gabriella Alodia, S.T., M.Sc., Ph.D.</h3>
                    <p className="text-gray-600 mb-1 text-[10px] md:text-xs text-center">Supervisor 2</p>
                  </div>

                  {/* Supervisor 3 */}
                  <div className="flex flex-col items-center">
                    <div className="aspect-[4/5] w-36 md:w-50 mb-2 border border-gray-200 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24 md:w-32 md:h-32 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                    <h3 className="text-xs md:text-sm font-semibold mb-1 text-center">Dr. techn. Dudy Darmawan Wijaya, S.T, M.Sc.</h3>
                    <p className="text-gray-600 mb-1 text-[10px] md:text-xs text-center">Supervisor 3</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default About;