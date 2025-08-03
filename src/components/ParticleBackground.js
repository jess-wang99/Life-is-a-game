import React, { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

const ParticleBackground = () => {
  const particlesInit = useCallback(async (main) => {
    // 初始化粒子效果
    await loadFull(main);
  }, []);

  return (
    <Particles
      className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20 z-0"
      init={particlesInit}
      options={{
        particles: {
          number: { value: 80, density: { enable: true, value_area: 800 } },
          color: { value: "#4f46e5" },
          shape: { type: "circle" },
          size: { value: 3, random: true },
          line_linked: {
            enable: true,
            distance: 150,
            color: "#4f46e5",
            opacity: 0.2,
            width: 1
          },
          move: {
            enable: true,
            speed: 1,
            direction: "none",
            random: false,
            straight: false,
            out_mode: "out",
            bounce: false
          }
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onhover: { enable: true, mode: "grab" },
            onclick: { enable: true, mode: "push" },
            resize: true
          },
          modes: {
            grab: { distance: 140, line_linked: { opacity: 0.5 } },
            push: { particles_nb: 3 }
          }
        },
        retina_detect: true
      }}
    />
  );
};

export default ParticleBackground;
    
