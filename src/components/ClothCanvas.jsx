import { useEffect, useRef, useCallback } from 'react'

// ── GLSL shaders ─────────────────────────────────────────────────────
const VS = /* glsl */`
  attribute vec2 aPosition;
  varying vec2   vUv;
  void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`

const FS = /* glsl */`
  precision mediump float;
  uniform float uTime;
  uniform vec2  uMouse;
  uniform vec2  uResolution;
  varying vec2  vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1,0)), u.x),
      mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0, amp = 0.5, freq = 1.0;
    for (int i = 0; i < 5; i++) {
      v    += amp * noise(p * freq + uTime * 0.16);
      amp  *= 0.5;
      freq *= 2.1;
    }
    return v;
  }

  void main() {
    // Aspect-correct UV
    vec2 uv = vUv;
    uv.x *= uResolution.x / uResolution.y;

    // FBM fabric texture
    float fabric = fbm(uv * 2.8 + uTime * 0.10);

    // Mouse ripple
    vec2  mouseUV = vec2(uMouse.x * uResolution.x / uResolution.y, uMouse.y);
    float dist    = distance(uv, mouseUV);
    float ripple  = sin(dist * 9.0 - uTime * 2.6) * exp(-dist * 5.0) * 0.55;

    float intensity = (fabric * 0.5 + ripple) * 0.5 + 0.5;

    // Dark silk base + gold sheen
    vec3 base  = vec3(0.10, 0.075, 0.045);
    float weave = pow(abs(sin(vUv.x * 14.0 + uTime * 0.15)), 12.0);
    vec3 gold  = vec3(0.80, 0.64, 0.31) * weave * 0.32;

    // Brightness from intensity + gold sheen
    float bright = (intensity - 0.5) * 0.38;
    vec3 color  = base + bright + gold;

    // Vignette — softer so center stays visible
    float vig = 1.0 - smoothstep(0.35, 1.2, length(vUv - 0.5) * 1.4);
    color *= vig * 0.88 + 0.12;

    gl_FragColor = vec4(color, 1.0);
  }
`

function createShader(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src)
  gl.compileShader(s)
  return s
}

function createProgram(gl, vs, fs) {
  const prog = gl.createProgram()
  gl.attachShader(prog, createShader(gl, gl.VERTEX_SHADER, vs))
  gl.attachShader(prog, createShader(gl, gl.FRAGMENT_SHADER, fs))
  gl.linkProgram(prog)
  return prog
}

export default function ClothCanvas({ className = '' }) {
  const canvasRef = useRef(null)
  const mouseRef  = useRef({ x: 0.5, y: 0.5 })
  const rafRef    = useRef(null)

  const isMobile = typeof window !== 'undefined'
    ? window.matchMedia('(pointer: coarse)').matches
    : false

  const handleMouseMove = useCallback((e) => {
    if (isMobile) return
    const rect = e.currentTarget.getBoundingClientRect()
    mouseRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: 1 - (e.clientY - rect.top) / rect.height,
    }
  }, [isMobile])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { alpha: true, antialias: true })
    if (!gl) return

    const prog = createProgram(gl, VS, FS)
    gl.useProgram(prog)

    // Full-screen quad
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW)

    const aPos = gl.getAttribLocation(prog, 'aPosition')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uTime  = gl.getUniformLocation(prog, 'uTime')
    const uMouse = gl.getUniformLocation(prog, 'uMouse')
    const uRes   = gl.getUniformLocation(prog, 'uResolution')

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width  = width  * dpr
      canvas.height = height * dpr
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.useProgram(prog)
      gl.uniform2f(uRes, canvas.width, canvas.height)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    const start = performance.now()
    const tick = () => {
      const t = (performance.now() - start) / 1000
      gl.useProgram(prog)
      gl.uniform1f(uTime, t)
      gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      rafRef.current = requestAnimationFrame(tick)
    }

    tick()

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      gl.deleteProgram(prog)
      gl.deleteBuffer(buf)
    }
  }, [])

  return (
    <div className={`w-full h-full ${className}`} onMouseMove={handleMouseMove}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', background: 'transparent' }}
      />
    </div>
  )
}
