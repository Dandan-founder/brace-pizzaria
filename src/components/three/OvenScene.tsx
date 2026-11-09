"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Forno a lenha em 3D, todo procedural (sem modelos externos):
 * cúpula de tijolos (InstancedMesh), argamassa com a boca recortada, interior aceso,
 * chamas e brasas em partículas (shader próprio) e base de pedra.
 * `progress` (0→1) vem da rolagem: a câmera se aproxima da boca e o fogo aumenta.
 */

const R = 1.95; // raio da cúpula
const ARCH_W = 0.78; // meia largura da boca
const ARCH_Y0 = 0.42; // altura onde começa o arco
const inMouth = (x: number, y: number, z: number, pad = 0) =>
  z > 0 && Math.abs(x) < ARCH_W + pad && (y < ARCH_Y0 || x * x + (y - ARCH_Y0) ** 2 < (ARCH_W + pad) ** 2);

const BRICKS = ["#a24a2b", "#b45a35", "#8f3f24", "#bf6a42", "#9a4a2f", "#7f3a22", "#c07850"];

function Dome() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const bricks = useMemo(() => {
    const list: { m: THREE.Matrix4; c: THREE.Color }[] = [];
    const rows = 17;
    const dPhi = (Math.PI / 2) * 0.93 / rows;
    const o = new THREE.Object3D();
    for (let j = 0; j < rows; j++) {
      const phi = (j + 0.5) * dPhi;
      const ring = R * Math.cos(phi);
      const y = R * Math.sin(phi);
      const n = Math.max(6, Math.floor((2 * Math.PI * ring) / 0.27));
      const len = ((2 * Math.PI * ring) / n) * 0.975;
      for (let i = 0; i < n; i++) {
        const th = ((i + (j % 2 ? 0.5 : 0)) / n) * Math.PI * 2;
        const x = ring * Math.sin(th);
        const z = ring * Math.cos(th);
        if (inMouth(x, y, z, 0.16)) continue;
        o.position.set(x, y, z);
        o.lookAt(0, 0, 0);
        o.rotateY(Math.PI);
        o.scale.set(len, R * dPhi * 0.95, 0.16);
        o.updateMatrix();
        const base = new THREE.Color(BRICKS[(i * 7 + j * 3) % BRICKS.length]);
        // Fuligem acima da boca: tijolos mais escuros
        const soot = z > 0 && Math.abs(x) < 1.1 && y > 0.9 && y < 1.9 ? 0.45 : 0;
        base.lerp(new THREE.Color("#1c1210"), soot * 0.8 + ((i * 13 + j * 5) % 7) * 0.03);
        list.push({ m: o.matrix.clone(), c: base });
      }
    }
    // Pedras do arco (aduelas), saltadas da cúpula
    const steps = 15;
    for (let k = 0; k <= steps; k++) {
      const a = Math.PI * (k / steps);
      const cx = Math.cos(a) * (ARCH_W + 0.1);
      const cy = ARCH_Y0 + Math.sin(a) * (ARCH_W + 0.1);
      const cz = Math.sqrt(Math.max(0, R * R - cx * cx - cy * cy)) + 0.06;
      o.position.set(cx, cy, cz);
      o.rotation.set(0, 0, a - Math.PI / 2);
      o.scale.set(0.17, 0.3, 0.32);
      o.updateMatrix();
      list.push({ m: o.matrix.clone(), c: new THREE.Color(BRICKS[k % 3 + 2]).lerp(new THREE.Color("#140c0a"), 0.35) });
    }
    for (const side of [-1, 1])
      for (let k = 0; k < 2; k++) {
        const cx = side * (ARCH_W + 0.1);
        const cy = 0.1 + k * 0.22;
        o.position.set(cx, cy, Math.sqrt(R * R - cx * cx - cy * cy) + 0.06);
        o.rotation.set(0, 0, 0);
        o.scale.set(0.3, 0.2, 0.32);
        o.updateMatrix();
        list.push({ m: o.matrix.clone(), c: new THREE.Color(BRICKS[k + 1]).lerp(new THREE.Color("#140c0a"), 0.3) });
      }
    return list;
  }, []);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    bricks.forEach((b, i) => {
      mesh.setMatrixAt(i, b.m);
      mesh.setColorAt(i, b.c);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [bricks]);

  // Argamassa: meia esfera logo abaixo dos tijolos, com a boca recortada por um alphaMap gerado aqui
  const mortarAlpha = useMemo(() => {
    const W = 512, H = 256;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const g = c.getContext("2d")!;
    const img = g.createImageData(W, H);
    const r = R - 0.13;
    for (let py = 0; py < H; py++)
      for (let px = 0; px < W; px++) {
        // mesmo mapeamento UV da SphereGeometry (thetaLength = π/2)
        const u = px / W, v = 1 - py / H;
        const phi = u * Math.PI * 2;
        const theta = (1 - v) * (Math.PI / 2);
        const x = -r * Math.cos(phi) * Math.sin(theta);
        const y = r * Math.cos(theta);
        const z = r * Math.sin(phi) * Math.sin(theta);
        const k = (py * W + px) * 4;
        const a = inMouth(x, y, z) ? 0 : 255;
        img.data[k] = img.data[k + 1] = img.data[k + 2] = a;
        img.data[k + 3] = 255;
      }
    g.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c);
    return t;
  }, []);

  return (
    <group>
      <instancedMesh ref={ref} args={[undefined, undefined, bricks.length]} castShadow={false}>
        <boxGeometry />
        <meshStandardMaterial roughness={0.82} metalness={0} />
      </instancedMesh>
      <mesh>
        <sphereGeometry args={[R - 0.13, 96, 48, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#6b5a4c" roughness={1} alphaMap={mortarAlpha} alphaTest={0.5} />
      </mesh>
      {/* topo da cúpula */}
      <mesh position={[0, R * 0.985, 0]}>
        <sphereGeometry args={[0.34, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#5c2615" roughness={0.9} />
      </mesh>
    </group>
  );
}

/** Interior: parede de dentro (vista pela boca), piso de pedra e a lenha no fundo. */
function Interior() {
  return (
    <group>
      {/* girada para a emenda da esfera ficar na frente (escondida), não no fundo visto pela boca */}
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <sphereGeometry args={[R - 0.3, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#6a3020" roughness={0.95} side={THREE.BackSide} emissive="#5a1606" emissiveIntensity={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]}>
        <circleGeometry args={[R - 0.28, 48]} />
        <meshStandardMaterial color="#3b2a22" roughness={1} />
      </mesh>
      {[
        [-0.35, 0.09, -0.85, 0.5],
        [0.05, 0.09, -0.95, -0.3],
        [-0.15, 0.24, -0.9, 0.1],
        [0.4, 0.09, -0.75, 1.1],
      ].map(([x, y, z, ry], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, ry, Math.PI / 2]}>
          <cylinderGeometry args={[0.09, 0.1, 0.9, 10]} />
          <meshStandardMaterial color="#1a0f0b" roughness={1} emissive="#ff4a10" emissiveIntensity={0.25} />
        </mesh>
      ))}
    </group>
  );
}

/** Base de alvenaria com tampo de pedra e a "boca" de apoio na frente. */
function Base() {
  return (
    <group>
      <mesh position={[0, -0.76, 0]}>
        <boxGeometry args={[5.2, 1.32, 4.8]} />
        <meshStandardMaterial color="#26201c" roughness={0.95} />
      </mesh>
      <mesh position={[0, -0.04, 0.15]}>
        <boxGeometry args={[5.5, 0.08, 5.3]} />
        <meshStandardMaterial color="#4a413a" roughness={0.75} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.43, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#0e0c0a" roughness={1} />
      </mesh>
    </group>
  );
}

const fireVertex = /* glsl */ `
  uniform float uTime;
  uniform float uHeat;
  uniform float uPixel;
  attribute vec4 aSeed; // x,z de origem, fase, velocidade
  varying float vLife;
  varying float vSeed;
  void main() {
    float life = fract(aSeed.z + uTime * aSeed.w);
    vLife = life;
    vSeed = aSeed.z;
    vec3 p = position;
    p.x = aSeed.x * (1.0 - life * 0.75) + sin(uTime * 4.0 + aSeed.z * 20.0 + life * 6.0) * 0.08 * life;
    p.z = aSeed.y;
    p.y += life * life * (0.7 + 0.8 * uHeat) + life * 0.15;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float size = (1.0 - life * 0.7) * (1.1 + 1.1 * uHeat);
    gl_PointSize = min(size * uPixel / -mv.z, 90.0);
  }
`;
const fireFragment = /* glsl */ `
  uniform float uHeat;
  varying float vLife;
  varying float vSeed;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float a = 1.0 - smoothstep(0.0, 0.5, d);
    if (d > 0.5) discard;
    vec3 hot = vec3(1.0, 0.36, 0.07);
    vec3 mid = vec3(0.85, 0.12, 0.02);
    vec3 cold = vec3(0.5, 0.05, 0.01);
    vec3 col = mix(hot, mid, smoothstep(0.0, 0.45, vLife));
    col = mix(col, cold, smoothstep(0.45, 1.0, vLife));
    gl_FragColor = vec4(col * (0.5 + uHeat * 0.3), a * a * (1.0 - vLife) * 0.32);
  }
`;

const emberVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixel;
  attribute vec4 aSeed;
  varying float vLife;
  void main() {
    float life = fract(aSeed.z + uTime * aSeed.w);
    vLife = life;
    vec3 p = vec3(aSeed.x, 0.4, ${(R - 0.1).toFixed(2)});
    p.x += sin(uTime * 0.9 + aSeed.z * 30.0) * 0.35 * life + aSeed.y * life * 1.6;
    p.y += life * 3.6;
    p.z += life * (0.9 + aSeed.y);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (0.05 + 0.05 * fract(aSeed.z * 7.0)) * uPixel / -mv.z;
  }
`;
const emberFragment = /* glsl */ `
  varying float vLife;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.1, d) * smoothstep(0.0, 0.1, vLife) * (1.0 - vLife);
    gl_FragColor = vec4(1.0, 0.55 + 0.3 * (1.0 - vLife), 0.15, a);
  }
`;

function seeds(n: number, fn: (i: number) => [number, number, number, number]) {
  const arr = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) arr.set(fn(i), i * 4);
  return arr;
}
const rand = (i: number, k: number) => {
  const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return s - Math.floor(s);
};

function Fire({ heat, uniforms }: { heat: { current: number }; uniforms: { uTime: { value: number }; uHeat: { value: number }; uPixel: { value: number } } }) {
  const flameSeeds = useMemo(() => seeds(360, (i) => [(rand(i, 1) - 0.5) * 1.3, -0.8 + (rand(i, 2) - 0.5) * 0.45, rand(i, 3), 0.5 + rand(i, 4) * 0.55]), []);
  const emberSeeds = useMemo(() => seeds(70, (i) => [(rand(i, 5) - 0.5) * 1.2, (rand(i, 6) - 0.5) * 0.6, rand(i, 7), 0.08 + rand(i, 8) * 0.1]), []);
  const positions = useMemo(() => new Float32Array(360 * 3).fill(0), []);
  const emberPositions = useMemo(() => new Float32Array(70 * 3).fill(0), []);
  void heat;
  return (
    <>
      <points position={[0, 0.12, 0]} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-aSeed" args={[flameSeeds, 4]} />
        </bufferGeometry>
        <shaderMaterial vertexShader={fireVertex} fragmentShader={fireFragment} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </points>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[emberPositions, 3]} />
          <bufferAttribute attach="attributes-aSeed" args={[emberSeeds, 4]} />
        </bufferGeometry>
        <shaderMaterial vertexShader={emberVertex} fragmentShader={emberFragment} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </points>
    </>
  );
}

function Rig({ progress, animate }: { progress: { current: number }; animate: boolean }) {
  const { camera, size, gl } = useThree();
  const inner = useRef<THREE.PointLight>(null);
  const mouth = useRef<THREE.PointLight>(null);
  const heat = useRef(0.5);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uHeat: { value: 0.5 }, uPixel: { value: 300 } }), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const from = useMemo(() => ({ pos: new THREE.Vector3(4.2, 2.9, 8.6), look: new THREE.Vector3(0, 0.75, 0) }), []);
  const to = useMemo(() => ({ pos: new THREE.Vector3(0.3, 1.05, 5.4), look: new THREE.Vector3(0, 0.6, 0) }), []);
  const smooth = useRef(progress.current);

  useEffect(() => {
    // tamanho dos pontos proporcional à altura do canvas em pixels de tela
    // proporcional à tela, mas menor no retrato (celular), onde a câmera fica mais longe
    uniforms.uPixel.value = Math.min(size.height, size.width * 1.4) * gl.getPixelRatio() * 0.75;
    // no retrato (celular) a câmera recua para o forno caber
    const portrait = size.width / size.height < 0.9;
    from.pos.set(portrait ? 3.6 : 4.2, portrait ? 3.4 : 2.9, portrait ? 12.5 : 8.6);
    to.pos.set(0.25, 1.05, portrait ? 7.4 : 5.4);
  }, [size, gl, uniforms, from, to]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    smooth.current += (progress.current - smooth.current) * Math.min(1, dt * 6);
    const p = THREE.MathUtils.smootherstep(smooth.current, 0, 1);
    camera.position.lerpVectors(from.pos, to.pos, p);
    look.lerpVectors(from.look, to.look, p);
    camera.lookAt(look);

    heat.current = 0.35 + 0.65 * p;
    if (animate) uniforms.uTime.value = t;
    uniforms.uHeat.value = heat.current;
    const flicker = animate ? 0.82 + Math.sin(t * 11) * 0.06 + Math.sin(t * 23.3) * 0.05 + Math.sin(t * 5.1) * 0.07 : 1;
    if (inner.current) inner.current.intensity = (8 + 20 * heat.current) * flicker;
    if (mouth.current) mouth.current.intensity = (2 + 9 * heat.current) * flicker;
  });

  return (
    <>
      <pointLight ref={inner} position={[0, 1.05, 0.15]} color="#ff6a1f" distance={5} decay={1.6} />
      <pointLight ref={mouth} position={[0, 0.5, R + 0.6]} color="#ff8c3a" distance={5.5} decay={1.8} />
      <Fire heat={heat} uniforms={uniforms} />
    </>
  );
}

export default function OvenScene({ progress, active, reduced }: { progress: { current: number }; active: boolean; reduced: boolean }) {
  return (
    <Canvas
      frameloop={active && !reduced ? "always" : "demand"}
      dpr={[1, 1.6]}
      camera={{ position: [4.2, 2.9, 8.6], fov: 34, near: 0.6, far: 40 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.1;
        scene.background = new THREE.Color("#0e0c0a");
        scene.fog = new THREE.Fog("#0e0c0a", 9, 22);
      }}
      aria-hidden
    >
      <hemisphereLight args={["#5a5560", "#1a1210", 0.55]} />
      <directionalLight position={[-6, 7, 5]} intensity={1.7} color="#f3e2c7" />
      <directionalLight position={[5, 3, -6]} intensity={0.7} color="#6f7fa0" />
      <directionalLight position={[7, 2.5, 6]} intensity={0.55} color="#c98a5a" />
      <ambientLight intensity={0.12} color="#b07a55" />
      <Base />
      <Interior />
      <Dome />
      <Rig progress={progress} animate={!reduced} />
    </Canvas>
  );
}
