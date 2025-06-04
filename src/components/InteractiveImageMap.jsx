import { useState } from 'react';
import sumatraImage from '../assets/images/sumatra.png';
import javaImage from '../assets/images/java.png';
import osesImage from '../assets/images/OSES.png';
import onwjImage from '../assets/images/ONWJ.png';
const InteractiveImageMap = () => {
  const [hoveredArea, setHoveredArea] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const areas = [
    {
      id: 'oses',
      image: osesImage,
      link: '/services/map',
      position: {
        top: '45%',
        left: '14%',
        width: '35%',
        height: '15%'
      },
      tooltip: 'OSES Area',
      zIndex: 35
    },
    {
      id: 'onwj',
      image: onwjImage,
      link: '/services/map',
      position: {
        top: '55%',
        left: '11.8%',
        width: '65%',
        height: '22%'
      },
      tooltip: 'ONWJ Area',
      zIndex: 30
    },
    {
      id: 'sumatra',
      image: sumatraImage,
      position: {
        top: '-100%',
        left: '-60%',
        width: '128%',
        height: '165%'
      },
      tooltip: 'Sumatera Island',
      zIndex: 10
    },
    {
      id: 'java',
      image: javaImage,
      position: {
        top: '60%',
        left: '22%',
        width: '80%',
        height: '57%'
      },
      tooltip: 'Java Island',
      zIndex: 10
    }
  ];

  const handleAreaClick = (area) => {
    window.location.href = area.link;
  };

  const handleAreaHover = (area, e) => {
    setHoveredArea(area);
    // Tooltip position relative to mouse
    const parentRect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - parentRect.left,
      y: e.clientY - parentRect.top
    });
  };

  const handleAreaLeave = () => {
    setHoveredArea(null);
  };

  return (
    <div className="relative w-full h-[700px] px-18 overflow-hidden" style={{maxWidth: '1500px', margin: '0 auto'}}>
      <h2 className="text-8xl font-semibold text-right mt-32">OSES-ONWJ</h2>
      <p className="text-base/8 text-right">
        Click on the areas below to explore detailed hydrographic data <br /> 
        for Offshore South East Sumatra and Offshore North West Java (OSES-ONWJ).
      </p>
      {/* Islands */}
      <div className="hidden md:block">
        {areas.map((area) => (
          <div 
            key={area.id}
            className="absolute group cursor-pointer transition-all duration-300"
            style={{
              top: area.position.top,
              left: area.position.left,
              width: area.position.width,
              height: area.position.height,
              zIndex: hoveredArea?.id === area.id ? area.zIndex + 10 : area.zIndex,
              overflow: 'visible',
              pointerEvents: 'none'
            }}
          >
            <div 
              className="relative w-full h-full overflow-visible"
              onClick={() => handleAreaClick(area)}
              onMouseMove={(e) => area.id !== 'sumatra' && area.id !== 'java' && handleAreaHover(area, e)}
              onMouseLeave={handleAreaLeave}
              style={{ pointerEvents: area.id === 'sumatra' || area.id === 'java' ? 'none' : 'auto' }}
            >
              <img 
                src={area.image} 
                alt=""
                className={`w-full h-full object-contain mix-blend-multiply opacity-100 transition-transform duration-300 ${hoveredArea?.id === area.id ? 'scale-110 z-30' : ''}`}
                draggable="false"
              />
              {/* Tooltip Pop-up */}
              {hoveredArea?.id === area.id && (
                <div 
                  className="absolute px-4 py-2 rounded-lg shadow-lg text-sm font-medium bg-white/90 text-gray-900 border border-gray-200"
                  style={{
                    left: tooltipPos.x + 10,
                    top: tooltipPos.y - 40,
                    pointerEvents: 'none',
                    minWidth: '180px',
                    zIndex: 40
                  }}
                >
                  {area.tooltip}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InteractiveImageMap; 