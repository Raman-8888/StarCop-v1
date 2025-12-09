import { useRef, useEffect } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';

import './LiquidChrome.css';

export const LiquidChrome = ({
    baseColor = [0.1, 0.1, 0.1],
    speed = 0.2,
    amplitude = 0.3,
    frequencyX = 3,
    frequencyY = 3,
    interactive = true,
    ...props
}) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        // 1. Handle DPR
        const dpr = window.devicePixelRatio || 1;
        const renderer = new Renderer({ antialias: true, dpr });
        const gl = renderer.gl;
        gl.clearColor(1, 1, 1, 1);

        const vertexShader = `
      attribute vec2 position;
      attribute vec2 uv;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

        const fragmentShader = `
      precision highp float;
      uniform float uTime;
      uniform vec3 uResolution;
      uniform vec3 uBaseColor;
      uniform float uAmplitude;
      uniform float uFrequencyX;
      uniform float uFrequencyY;
      uniform vec2 uMouse;
      varying vec2 vUv;

      vec4 renderImage(vec2 uvCoord) {
          vec2 fragCoord = uvCoord * uResolution.xy;
          // Calculate scale factor to keep feature size consistent across devices
          // Base constant 800.0 can be tweaked. 
          // On phone (min~400), scale < 1 (or clamped to 1). 
          // On desktop (min~1000), scale > 1 (zooms out -> smaller features).
          float minDim = min(uResolution.x, uResolution.y);
          float scale = max(1.0, minDim / 600.0);
          
          vec2 uv = ((2.0 * fragCoord - uResolution.xy) / minDim) * scale;

          for (float i = 1.0; i < 10.0; i++){
              uv.x += uAmplitude / i * cos(i * uFrequencyX * uv.y + uTime + uMouse.x * 3.14159);
              uv.y += uAmplitude / i * cos(i * uFrequencyY * uv.x + uTime + uMouse.y * 3.14159);
          }

          vec2 diff = (uvCoord - uMouse);
          float dist = length(diff);
          float falloff = exp(-dist * 20.0);
          float ripple = sin(10.0 * dist - uTime * 2.0) * 0.03;
          uv += (diff / (dist + 0.0001)) * ripple * falloff;

          vec3 color = uBaseColor / abs(sin(uTime - uv.y - uv.x));
          return vec4(color, 1.0);
      }

      void main() {
          gl_FragColor = renderImage(vUv);
      }
    `;

        const geometry = new Triangle(gl);
        const program = new Program(gl, {
            vertex: vertexShader,
            fragment: fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uResolution: {
                    value: new Float32Array([gl.drawingBufferWidth, gl.drawingBufferHeight, gl.drawingBufferWidth / gl.drawingBufferHeight])
                },
                uBaseColor: { value: new Float32Array(baseColor) },
                uAmplitude: { value: amplitude },
                uFrequencyX: { value: frequencyX },
                uFrequencyY: { value: frequencyY },
                uMouse: { value: new Float32Array([0, 0]) }
            }
        });
        const mesh = new Mesh(gl, { geometry, program });

        function resize() {
            // 2. Precise resizing
            const rect = container.getBoundingClientRect();
            renderer.setSize(rect.width, rect.height);
            const resUniform = program.uniforms.uResolution.value;
            resUniform[0] = gl.drawingBufferWidth;
            resUniform[1] = gl.drawingBufferHeight;
            resUniform[2] = gl.drawingBufferWidth / gl.drawingBufferHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        function handleMouseMove(event) {
            const rect = container.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width;
            const y = 1 - (event.clientY - rect.top) / rect.height;
            const mouseUniform = program.uniforms.uMouse.value;
            mouseUniform[0] = x;
            mouseUniform[1] = y;
        }

        function handleTouchMove(event) {
            if (event.touches.length > 0) {
                const touch = event.touches[0];
                const rect = container.getBoundingClientRect();
                const x = (touch.clientX - rect.left) / rect.width;
                const y = 1 - (touch.clientY - rect.top) / rect.height;
                const mouseUniform = program.uniforms.uMouse.value;
                mouseUniform[0] = x;
                mouseUniform[1] = y;
            }
        }

        if (interactive) {
            container.addEventListener('mousemove', handleMouseMove);
            container.addEventListener('touchmove', handleTouchMove);
        }

        let animationId;
        function update(t) {
            animationId = requestAnimationFrame(update);
            program.uniforms.uTime.value = t * 0.001 * speed;
            renderer.render({ scene: mesh });
        }
        animationId = requestAnimationFrame(update);

        container.appendChild(gl.canvas);
        // Force CSS to 100% to prevent canvas defaults
        gl.canvas.style.width = '100%';
        gl.canvas.style.height = '100%';

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
            if (interactive) {
                container.removeEventListener('mousemove', handleMouseMove);
                container.removeEventListener('touchmove', handleTouchMove);
            }
            if (gl.canvas.parentElement) {
                gl.canvas.parentElement.removeChild(gl.canvas);
            }
            gl.getExtension('WEBGL_lose_context')?.loseContext();
        };
    }, [baseColor, speed, amplitude, frequencyX, frequencyY, interactive]);

    return <div ref={containerRef} className="liquidChrome-container" {...props} />;
};

export default LiquidChrome;
