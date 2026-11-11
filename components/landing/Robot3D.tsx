'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

type V3 = [number, number, number];

/** Procedural mascot (no external files), ported from robot-3d.html. */
function createRobot() {
  const M = {
    shell: new THREE.MeshPhysicalMaterial({ color: 0xf3f1fb, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12 }),
    orange: new THREE.MeshPhysicalMaterial({ color: 0xff7f1a, roughness: 0.32, clearcoat: 0.8, clearcoatRoughness: 0.2 }),
    lilac: new THREE.MeshPhysicalMaterial({ color: 0x8f86ff, roughness: 0.35, clearcoat: 0.7, clearcoatRoughness: 0.2 }),
    visor: new THREE.MeshPhysicalMaterial({ color: 0x15164a, roughness: 0.06, metalness: 0.3, clearcoat: 1, clearcoatRoughness: 0.02 }),
    glow: new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x5ff2ff, emissiveIntensity: 1.6, toneMapped: false }),
    flame: new THREE.MeshBasicMaterial({ color: 0x5ff2ff, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false }),
  };
  const mesh = (geo: THREE.BufferGeometry, mat: THREE.Material, pos: V3 = [0, 0, 0], scale: V3 = [1, 1, 1], rot: V3 = [0, 0, 0]) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...pos);
    m.scale.set(...scale);
    m.rotation.set(...rot);
    return m;
  };
  const sphere = () => new THREE.SphereGeometry(1, 64, 48);

  const robot = new THREE.Group();
  robot.name = 'Robot';

  // Head
  const head = new THREE.Group();
  head.name = 'Head';
  head.position.y = 0.75;
  robot.add(head);
  head.add(mesh(sphere(), M.shell, [0, 0, 0], [1.08, 0.97, 1]));
  head.add(mesh(new THREE.SphereGeometry(1.035, 64, 32, 0, Math.PI * 2, 0, 0.95), M.orange, [0, 0, 0], [1.08, 0.97, 1], [-0.55, 0, 0]));
  head.add(mesh(sphere(), M.lilac, [0, -0.05, 0.78], [0.9, 0.68, 0.32]));
  head.add(mesh(sphere(), M.visor, [0, -0.05, 0.84], [0.82, 0.6, 0.32]));
  const eyes = [-1, 1].map((s) => {
    const e = mesh(new THREE.CapsuleGeometry(0.085, 0.17, 8, 24), M.glow, [s * 0.3, 0, 1.12], [1, 1, 0.45], [0, s * 0.25, 0]);
    head.add(e);
    return e;
  });
  head.add(mesh(new THREE.CapsuleGeometry(0.045, 0.16, 6, 16), M.glow, [0, 0.68, 0.74], [1, 1, 1], [-0.75, 0, Math.PI / 2]));
  const earShape = (r: number, h: number) =>
    new THREE.LatheGeometry(
      ([[0, 0], [r, 0], [r * 0.95, h * 0.2], [r * 0.75, h * 0.5], [r * 0.42, h * 0.8], [r * 0.16, h * 0.97], [0, h]] as [number, number][]).map(
        ([x, y]) => new THREE.Vector2(x, y)
      ),
      48
    );
  const ears = [-1, 1].map((s) => {
    const g = new THREE.Group();
    g.name = s < 0 ? 'EarL' : 'EarR';
    g.position.set(s * 0.58, 0.7, -0.05);
    g.rotation.z = -s * 0.38;
    g.add(mesh(earShape(0.38, 0.85), M.orange, [0, 0, 0], [1, 1, 0.5]));
    g.add(mesh(earShape(0.24, 0.6), M.lilac, [0, 0.06, 0.1], [1, 1, 0.35]));
    head.add(g);
    return g;
  });
  for (const s of [-1, 1]) {
    head.add(mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.16, 48), M.lilac, [s * 1.04, -0.05, 0], [1, 1, 1], [0, 0, Math.PI / 2]));
    head.add(mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.04, 32), M.glow, [s * 1.13, -0.05, 0], [1, 1, 1], [0, 0, Math.PI / 2]));
  }

  // Body
  const body = new THREE.Group();
  body.name = 'Body';
  body.position.y = -0.28;
  robot.add(body);
  body.add(mesh(new THREE.CylinderGeometry(0.3, 0.36, 0.3, 48), M.lilac, [0, 0.12, 0]));
  body.add(mesh(new THREE.TorusGeometry(0.42, 0.1, 24, 72), M.orange, [0, -0.02, 0], [1, 1, 1], [Math.PI / 2, 0, 0]));
  body.add(mesh(sphere(), M.shell, [0, -0.6, 0], [0.62, 0.72, 0.56]));
  body.add(mesh(new THREE.TorusGeometry(0.17, 0.04, 16, 48), M.lilac, [0, -0.5, 0.54]));
  body.add(mesh(new THREE.TorusGeometry(0.12, 0.03, 16, 48), M.glow, [0, -0.5, 0.56]));
  body.add(mesh(sphere(), M.visor, [0, -0.5, 0.53], [0.11, 0.11, 0.05]));
  const arms = [-1, 1].map((s) => {
    const p = new THREE.Group();
    p.name = s < 0 ? 'ArmL' : 'ArmR';
    p.position.set(s * 0.55, -0.3, 0);
    p.rotation.z = s * 0.35;
    p.add(mesh(sphere(), M.orange, [0, 0, 0], [0.16, 0.16, 0.16]));
    p.add(mesh(new THREE.CapsuleGeometry(0.11, 0.28, 8, 24), M.shell, [0, -0.26, 0]));
    p.add(mesh(sphere(), M.orange, [0, -0.52, 0], [0.14, 0.14, 0.14]));
    body.add(p);
    return p;
  });
  for (const s of [-1, 1]) {
    body.add(mesh(new RoundedBoxGeometry(0.5, 0.16, 0.7, 4, 0.07), M.orange, [s * 0.48, -0.85, -0.32], [1, 1, 1], [0, s * 0.4, -s * 0.5]));
  }
  body.add(mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.18, 32), M.lilac, [0, -1.3, 0]));
  const flame = mesh(new THREE.ConeGeometry(0.17, 0.6, 32, 1, true), M.flame, [0, -1.68, 0], [1, 1, 1], [Math.PI, 0, 0]);
  body.add(flame);

  return { robot, head, body, eyes, ears, arms, flame, materials: M };
}

const easeOutBack = (p: number) => 1 + 2.2 * Math.pow(p - 1, 3) + 1.2 * Math.pow(p - 1, 2);

/** Transparent WebGL mascot that fills its container. Click / Enter makes it wave. */
export default function Robot3D({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    // ---------- Scene
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const canvas = renderer.domElement;
    canvas.className = 'block h-full w-full cursor-grab active:cursor-grabbing';
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const envTex = pmrem.fromScene(room, 0.04).texture;
    scene.environment = envTex;

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0.8, 10.5);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, -0.05, 0);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.minPolarAngle = Math.PI * 0.32;
    controls.maxPolarAngle = Math.PI * 0.62;
    // On touch screens, keep the page scrollable: no drag-to-orbit, tap still waves.
    if (window.matchMedia('(pointer: coarse)').matches) {
      controls.enabled = false;
      canvas.style.touchAction = 'pan-y';
    }

    scene.add(new THREE.HemisphereLight(0xc9ceff, 0x2a2f9e, 1.2));
    const key = new THREE.DirectionalLight(0xffffff, 2.6);
    key.position.set(-3, 5, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x9a8cff, 3);
    rim.position.set(4, 2, -4);
    scene.add(rim);
    const warm = new THREE.DirectionalLight(0xffb070, 0.8);
    warm.position.set(4, -2, 3);
    scene.add(warm);

    const R = createRobot();
    scene.add(R.robot);
    const eyeLight = new THREE.PointLight(0x4fe8ff, 1.5, 3, 2);
    eyeLight.position.set(0, 0, 1.6);
    R.head.add(eyeLight);

    // Soft contact shadow
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = shadowCanvas.height = 128;
    const g = shadowCanvas.getContext('2d');
    if (g) {
      const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      grd.addColorStop(0, 'rgba(10,12,60,0.55)');
      grd.addColorStop(1, 'rgba(10,12,60,0)');
      g.fillStyle = grd;
      g.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -2.45;
    scene.add(shadow);

    // ---------- Responsive size
    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.zoom = Math.min(1, camera.aspect * 1.25);
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    // ---------- Interaction
    const pointer = { x: 0, y: 0 };
    const look = { x: 0, y: 0 };
    let elapsed = 0;
    let helloStart = -1;
    const hello = () => {
      if (helloStart < 0) helloStart = elapsed;
    };

    const onPointerMove = (e: PointerEvent) => {
      const r = container.getBoundingClientRect();
      pointer.x = THREE.MathUtils.clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
      pointer.y = THREE.MathUtils.clamp(-((e.clientY - r.top) / r.height) * 2 + 1, -1, 1);
    };
    const raycaster = new THREE.Raycaster();
    let down: [number, number] | null = null;
    const onPointerDown = (e: PointerEvent) => {
      down = [e.clientX, e.clientY];
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return; // drag = orbit, not click
      const r = canvas.getBoundingClientRect();
      raycaster.setFromCamera(
        new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1),
        camera
      );
      if (raycaster.intersectObject(R.robot, true).length) {
        hello();
        window.dispatchEvent(new CustomEvent('syva:robot-click')); // opens the chat
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        hello();
        window.dispatchEvent(new CustomEvent('syva:robot-click'));
      }
    };
    window.addEventListener('syva:hello', hello); // the chat asks the robot to wave
    window.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);
    container.addEventListener('keydown', onKeyDown);

    // ---------- Animation
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.3 : 1;
    let last = -1;
    let nextBlink = 1.5;
    let blinkT = -1;
    let nextTwitch = 3;
    const twitch = [0, 0];

    const animate = (time: number) => {
      const dt = last < 0 ? 0 : Math.min((time - last) / 1000, 0.05);
      last = time;
      elapsed += dt;
      const t = elapsed;
      controls.update();

      const k = 1 - Math.exp(-dt * 5);
      look.x += (pointer.x - look.x) * k;
      look.y += (pointer.y - look.y) * k;

      // float
      const bob = Math.sin(t * 1.5) * 0.12 * motion;
      R.robot.position.y = bob;
      R.robot.rotation.z = Math.sin(t * 0.8) * 0.035 * motion - look.x * 0.06;
      shadow.scale.setScalar(1 - bob * 0.8);
      shadowMat.opacity = 0.9 - bob * 1.5;

      // follow cursor
      R.head.rotation.y = look.x * 0.55;
      R.head.rotation.x = -look.y * 0.3;
      R.body.rotation.y = look.x * 0.2;

      // blink
      if (t > nextBlink) {
        blinkT = 0;
        nextBlink = t + 2 + Math.random() * 3.5;
      }
      let eyeY = 1;
      if (blinkT >= 0) {
        blinkT += dt;
        const p = Math.min(blinkT / 0.18, 1);
        eyeY = 1 - Math.sin(Math.PI * p) * 0.9;
        if (p >= 1) blinkT = -1;
      }
      R.eyes.forEach((e) => (e.scale.y = eyeY));

      // ear twitch
      if (t > nextTwitch) {
        twitch[Math.random() < 0.5 ? 0 : 1] = 0.35;
        nextTwitch = t + 2.5 + Math.random() * 4;
      }
      R.ears.forEach((e, i) => {
        twitch[i] *= Math.exp(-dt * 6);
        e.rotation.x = Math.sin(t * 2 + i) * 0.04 * motion - twitch[i] * Math.sin(t * 40);
      });

      // eye glow + thruster flame
      R.materials.glow.emissiveIntensity = 1.5 + Math.sin(t * 3) * 0.25;
      R.flame.scale.set(1, 0.85 + Math.sin(t * 25) * 0.08 + Math.random() * 0.06, 1);

      // hello: spin 360° + wave
      let wave = 0;
      if (helloStart >= 0) {
        const p = Math.min((t - helloStart) / 1.6, 1);
        R.robot.rotation.y = easeOutBack(p) * Math.PI * 2;
        wave = Math.sin(Math.PI * p);
        if (p >= 1) {
          helloStart = -1;
          R.robot.rotation.y = 0;
        }
      }
      R.arms[1].rotation.z = 0.35 + wave * (2.2 + Math.sin(t * 14) * 0.35);
      R.arms[0].rotation.z = -0.35 - Math.sin(t * 1.5 + 1) * 0.05 * motion;

      renderer.render(scene, camera);
    };

    // Save battery: only render while on screen.
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      last = -1;
      renderer.setAnimationLoop(entry.isIntersecting ? animate : null);
    });
    intersectionObserver.observe(container);

    return () => {
      renderer.setAnimationLoop(null);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('syva:hello', hello);
      window.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('keydown', onKeyDown);
      controls.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) obj.geometry.dispose();
      });
      Object.values(R.materials).forEach((m) => m.dispose());
      shadowMat.dispose();
      shadowTex.dispose();
      envTex.dispose();
      room.dispose();
      pmrem.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label="Maskot robot 3D SYVA. Tekan Enter untuk menyapa dan membuka obrolan."
      className={`rounded-3xl outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow ${className}`}
    />
  );
}
