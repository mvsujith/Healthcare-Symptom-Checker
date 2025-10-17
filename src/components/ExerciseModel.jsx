import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export default function ExerciseModel() {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const mixerRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const animationRef = useRef(0);
  const [cameraInfo, setCameraInfo] = useState({
    x: 0,
    y: 0,
    z: 0,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    distance: 0
  });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return () => {};

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    // Fixed camera position for Cat-Cow model
    camera.position.set(-0.03, 0.74, 1.03);
    
    // Set camera rotation (convert degrees to radians)
    camera.rotation.set(
      -35.5 * Math.PI / 180,  // X rotation
      -0.6 * Math.PI / 180,   // Y rotation
      -0.4 * Math.PI / 180    // Z rotation
    );

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    // Set target to match the distance (1.06 units from camera)
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyEuler(camera.rotation);
    const target = camera.position.clone().add(direction.multiplyScalar(1.06));
    controls.target.copy(target);
    controls.update();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0x7dd3fc, 0.5);
    fillLight.position.set(-5, 3, -5);
    scene.add(fillLight);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Load Cat-Cow exercise model
    const loader = new GLTFLoader();
    loader.load(
      '/catcow.glb',
      (gltf) => {
        const model = gltf.scene;

        // Center and scale the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim; // Scale to 2 units
        model.scale.setScalar(scale);

        model.position.x = -center.x * scale;
        model.position.y = -box.min.y * scale; // Place on ground
        model.position.z = -center.z * scale;

        // Enable shadows
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(model);

        // Setup animation mixer if animations exist
        if (gltf.animations && gltf.animations.length > 0) {
          mixerRef.current = new THREE.AnimationMixer(model);
          
          // Play all animations
          gltf.animations.forEach((clip) => {
            const action = mixerRef.current.clipAction(clip);
            action.play();
          });

          console.log('✅ Cat-Cow exercise model loaded with', gltf.animations.length, 'animations');
        } else {
          console.log('✅ Cat-Cow exercise model loaded (no animations found)');
        }
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error) => {
        console.error('❌ Error loading cat-cow model:', error);
      }
    );

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      const delta = clockRef.current.getDelta();

      // Update animation mixer if it exists
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      // Update camera info for real-time display
      const distance = camera.position.distanceTo(controls.target);
      setCameraInfo({
        x: camera.position.x.toFixed(2),
        y: camera.position.y.toFixed(2),
        z: camera.position.z.toFixed(2),
        rotX: (camera.rotation.x * 180 / Math.PI).toFixed(1),
        rotY: (camera.rotation.y * 180 / Math.PI).toFixed(1),
        rotZ: (camera.rotation.z * 180 / Math.PI).toFixed(1),
        distance: distance.toFixed(2)
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!container) return;
      const { clientWidth, clientHeight } = container;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

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

  return (
    <div>
      {/* 3D Model Viewer */}
      <div 
        ref={mountRef} 
        style={{ 
          width: '100%', 
          height: '500px',
          borderRadius: '8px',
          overflow: 'hidden',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(94, 234, 212, 0.2)'
        }} 
      />
    </div>
  );
}
