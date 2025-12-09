import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Float, Stars, OrbitControls } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingLines from './FloatingLines';
import GradientBlinds from './GradientBlinds';
import LiquidChrome from './LiquidChrome';

const AnimatedSphere = () => {
    const meshRef = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        // Subtle rotation
        if (meshRef.current) {
            meshRef.current.rotation.x = time * 0.2;
            meshRef.current.rotation.y = time * 0.3;
        }
    });

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
            <Sphere args={[1, 100, 200]} scale={2.4} ref={meshRef}>
                <MeshDistortMaterial
                    color="#8b5cf6" // Purple-500
                    attach="material"
                    distort={0.5} // Strength, 0 disables distortion (default 1)
                    speed={2} // Speed (default 1)
                    roughness={0.2}
                    metalness={0.8}
                />
            </Sphere>
        </Float>
    );
};

const SphereScene = () => {
    return (
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} color="blue" />
            <pointLight position={[-10, -10, -5]} intensity={1} color="purple" />

            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            <AnimatedSphere />
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
    );
};

const HeroScene3D = () => {
    const [sceneIndex, setSceneIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setSceneIndex((prev) => (prev + 1) % 4);
        }, 5000); // 5 seconds

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        console.log('Current Scene Index:', sceneIndex);
    }, [sceneIndex]);

    return (
        <div className="w-full h-full absolute inset-0 z-0 bg-[#0a0a0a]">
            {/* Removed mode="wait" to allow crossfade */}
            <AnimatePresence>
                {sceneIndex === 0 && (
                    <motion.div
                        key="sphere"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="w-full h-full absolute inset-0"
                    >
                        <SphereScene />
                    </motion.div>
                )}

                {sceneIndex === 1 && (
                    <motion.div
                        key="lines"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="w-full h-full absolute inset-0"
                    >
                        <FloatingLines
                            enabledWaves={['top', 'middle', 'bottom']}
                            lineCount={[10, 15, 20]}
                            lineDistance={[8, 6, 4]}
                            bendRadius={5.0}
                            bendStrength={-0.5}
                            interactive={true}
                            parallax={true}
                        />
                    </motion.div>
                )}

                {sceneIndex === 2 && (
                    <motion.div
                        key="liquid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="w-full h-full absolute inset-0"
                    >
                        <LiquidChrome
                            baseColor={[0.2, 0.1, 0.4]}
                            speed={1}
                            amplitude={0.3}
                            interactive={true}
                        />
                    </motion.div>
                )}

                {sceneIndex === 3 && (
                    <motion.div
                        key="blinds"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="w-full h-full absolute inset-0"
                    >
                        <GradientBlinds
                            gradientColors={['#FF9FFC', '#5227FF']}
                            angle={0}
                            noise={0.3}
                            blindCount={12}
                            blindMinWidth={50}
                            spotlightRadius={0.5}
                            spotlightSoftness={1}
                            spotlightOpacity={1}
                            mouseDampening={0.15}
                            distortAmount={0}
                            shineDirection="left"
                            mixBlendMode="lighten"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HeroScene3D;
