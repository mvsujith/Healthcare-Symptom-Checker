import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const GRID_SIZE = 20;
const GRID_DIVISIONS = 20;
const CAMERA_POSITION = new THREE.Vector3(0, 10, 15);
const SHADOW_MAP_SIZE = 2048;

export default function WorkspacePlane() {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const animationRef = useRef(0);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return () => {};

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.Fog(0x020617, 40, 120);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      200
    );
    camera.position.copy(CAMERA_POSITION);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      logarithmicDepthBuffer: true,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = true;
    controls.screenSpacePanning = true;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minDistance = 4;
    controls.maxDistance = 40;
    controls.target.set(0, 0, 0);
    controls.update();
    controlsRef.current = controls;

    // Grid plane
    const gridHelper = new THREE.GridHelper(
      GRID_SIZE,
      GRID_DIVISIONS,
      new THREE.Color(0x38bdf8),
      new THREE.Color(0x0ea5e9)
    );
    gridHelper.material.opacity = 0.4;
    gridHelper.material.transparent = true;
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE),
      new THREE.MeshStandardMaterial({
        color: 0x0b1220,
        roughness: 0.95,
        metalness: 0.05,
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x7dd3fc, 1.1);
    directionalLight.position.set(12, 18, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = SHADOW_MAP_SIZE;
    directionalLight.shadow.mapSize.height = SHADOW_MAP_SIZE;
    directionalLight.shadow.camera.near = 2;
    directionalLight.shadow.camera.far = 60;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    scene.add(directionalLight);

    const rimLight = new THREE.PointLight(0x5eead4, 0.65, 60);
    rimLight.position.set(-8, 10, -6);
    scene.add(rimLight);

    const pulseLight = new THREE.PointLight(0x1d4ed8, 0.45, 50);
    pulseLight.position.set(6, 4, -2);
    scene.add(pulseLight);

    // Animation setup
    const clock = new THREE.Clock();

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      pulseLight.intensity = 0.35 + Math.sin(elapsed * 1.4) * 0.2;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const { clientWidth, clientHeight } = container;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };

    let resizeObserver;
    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(() => handleResize());
      resizeObserver.observe(container);
    }
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationRef.current);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);

      scene.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => material.dispose());
          } else if (child.material) {
            child.material.dispose();
          }
        }
      });
    };
  }, []);

  return <div ref={mountRef} className="three-workspace" />;
}
