import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// Suppress the KHR_materials_pbrSpecularGlossiness warning
// This is an older GLTF extension that's been superseded but the models still render fine
const originalWarn = console.warn;
console.warn = function(...args) {
  if (args[0]?.includes('KHR_materials_pbrSpecularGlossiness')) {
    return; // Suppress this specific warning
  }
  originalWarn.apply(console, args);
};

const GRID_SIZE = 20;
const GRID_DIVISIONS = 20;
const CAMERA_POSITION = new THREE.Vector3(5, 8, 12); // Adjusted for operating room view
const SHADOW_MAP_SIZE = 2048;

export default function WorkspacePlane({ selectedSection, hasAnalysisData }) {
  const mountRef = useRef(null);
  const videoRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);
  const animationRef = useRef(0);
  const sceneRef = useRef(null);
  const hospitalModelRef = useRef(null);
  const ayurvedicModelRef = useRef(null);
  const homeModelRef = useRef(null);
  const dietaryModelRef = useRef(null);
  const meditationModelRef = useRef(null);
  const ayurvedicMixerRef = useRef(null);
  const homeMixerRef = useRef(null);
  const dietaryMixerRef = useRef(null);
  const meditationMixerRef = useRef(null);
  const clockRef = useRef(null);
  
  // Store camera positions for each model
  const cameraPositions = useRef({
    hospital: { position: new THREE.Vector3(5, 8, 12), target: new THREE.Vector3(0, 0, 0) },
    ayurvedic: { position: new THREE.Vector3(5, 8, 12), target: new THREE.Vector3(0, 0, 0) },
    home: { position: new THREE.Vector3(5, 8, 12), target: new THREE.Vector3(0, 0, 0) },
    dietary: { position: new THREE.Vector3(5, 8, 12), target: new THREE.Vector3(0, 0, 0) },
    meditation: { position: new THREE.Vector3(5, 8, 12), target: new THREE.Vector3(0, 0, 0) }
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState({ hospital: false, ayurvedic: false, home: false, dietary: false, meditation: false });
  const [showVideo, setShowVideo] = useState(false);
  const currentModelType = useRef('hospital'); // Track which model is currently showing

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
    cameraRef.current = camera;

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

    // Store scene reference
    sceneRef.current = scene;

    // Helper functions to save and restore camera positions
    const saveCameraPosition = (modelType) => {
      if (cameraRef.current && controlsRef.current) {
        cameraPositions.current[modelType] = {
          position: cameraRef.current.position.clone(),
          target: controlsRef.current.target.clone()
        };
        console.log(`📸 Saved ${modelType} camera position:`, {
          position: cameraPositions.current[modelType].position,
          target: cameraPositions.current[modelType].target
        });
      }
    };

    const restoreCameraPosition = (modelType) => {
      if (cameraRef.current && controlsRef.current && cameraPositions.current[modelType]) {
        cameraRef.current.position.copy(cameraPositions.current[modelType].position);
        controlsRef.current.target.copy(cameraPositions.current[modelType].target);
        controlsRef.current.update();
        console.log(`📷 Restored ${modelType} camera position:`, {
          position: cameraPositions.current[modelType].position,
          target: cameraPositions.current[modelType].target
        });
      }
    };

    // Make functions accessible outside
    window.saveCameraPosition = saveCameraPosition;
    window.restoreCameraPosition = restoreCameraPosition;

    // Helper function to prepare a loaded model
    const prepareModel = (model, modelType, customScale = 25) => {
      model.userData.modelType = modelType;
      
      // Center and scale the model
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      // Scale model to fit nicely in view - increased for better zoom
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = customScale / maxDim; // Use custom scale parameter
      model.scale.setScalar(scale);
      
      // Center the model
      model.position.x = -center.x * scale;
      model.position.y = -center.y * scale;
      model.position.z = -center.z * scale;
      
      // Enable shadows
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      return model;
    };

    // Preload all models
    const loader = new GLTFLoader();
    let loadedCount = 0;
    const totalModels = 5; // hospital, ayurvedic, home, dietary, meditation
    
    // Load hospital model
    loader.load(
      '/hos.glb',
      (gltf) => {
        const model = prepareModel(gltf.scene, 'hospital');
        model.visible = false; // Hide by default, show only when needed
        model.traverse((child) => {
          if (child.isMesh) {
            child.visible = false;
          }
        });
        scene.add(model);
        hospitalModelRef.current = model;
        loadedCount++;
        setModelsLoaded(prev => ({ ...prev, hospital: true }));
        if (loadedCount === totalModels) setIsLoading(false);
        console.log('✅ Hospital model preloaded');
      },
      (xhr) => {
        const progress = (xhr.loaded / xhr.total * 100).toFixed(0);
        console.log(`Hospital: ${progress}% loaded`);
      },
      (error) => {
        console.error('❌ Error loading hospital model:', error);
        loadedCount++;
        if (loadedCount === totalModels) setIsLoading(false);
      }
    );
    
    // Load ayurvedic model
    loader.load(
      '/Ay.glb',
      (gltf) => {
        const model = prepareModel(gltf.scene, 'ayurvedic');
        model.visible = false; // Hide ayurvedic initially
        model.traverse((child) => {
          if (child.isMesh) {
            child.visible = false;
          }
        });
        scene.add(model);
        ayurvedicModelRef.current = model;
        
        // Setup animations if present
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          ayurvedicMixerRef.current = mixer;
          
          // Play all animations
          gltf.animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            action.play();
          });
          
          console.log(`✅ Ayurvedic model has ${gltf.animations.length} animation(s)`);
        } else {
          console.log('ℹ️ Ayurvedic model has no animations');
        }
        
        loadedCount++;
        setModelsLoaded(prev => ({ ...prev, ayurvedic: true }));
        if (loadedCount === totalModels) setIsLoading(false);
        console.log('✅ Ayurvedic model preloaded');
      },
      (xhr) => {
        const progress = (xhr.loaded / xhr.total * 100).toFixed(0);
        console.log(`Ayurvedic: ${progress}% loaded`);
      },
      (error) => {
        console.error('❌ Error loading ayurvedic model:', error);
        loadedCount++;
        if (loadedCount === totalModels) setIsLoading(false);
      }
    );
    
    // Load home model
    loader.load(
      '/home.glb',
      (gltf) => {
        const model = prepareModel(gltf.scene, 'home');
        model.visible = false; // Hide home initially
        model.traverse((child) => {
          if (child.isMesh) {
            child.visible = false;
          }
        });
        scene.add(model);
        homeModelRef.current = model;
        
        // Setup animations if present
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          homeMixerRef.current = mixer;
          
          // Play all animations
          gltf.animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            action.play();
          });
          
          console.log(`✅ Home model has ${gltf.animations.length} animation(s)`);
        } else {
          console.log('ℹ️ Home model has no animations');
        }
        
        loadedCount++;
        setModelsLoaded(prev => ({ ...prev, home: true }));
        if (loadedCount === totalModels) setIsLoading(false);
        console.log('✅ Home model preloaded');
      },
      (xhr) => {
        const progress = (xhr.loaded / xhr.total * 100).toFixed(0);
        console.log(`Home: ${progress}% loaded`);
      },
      (error) => {
        console.error('❌ Error loading home model:', error);
        loadedCount++;
        if (loadedCount === totalModels) setIsLoading(false);
      }
    );
    
    // Load dietary model
    loader.load(
      '/fruit_muzli.glb',
      (gltf) => {
        const model = prepareModel(gltf.scene, 'dietary');
        model.visible = false; // Hide dietary initially
        model.traverse((child) => {
          if (child.isMesh) {
            child.visible = false;
          }
        });
        scene.add(model);
        dietaryModelRef.current = model;
        
        // Setup animations if present
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          dietaryMixerRef.current = mixer;
          
          // Play all animations
          gltf.animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            action.play();
          });
          
          console.log(`✅ Dietary model has ${gltf.animations.length} animation(s)`);
        } else {
          console.log('ℹ️ Dietary model has no animations');
        }
        
        loadedCount++;
        setModelsLoaded(prev => ({ ...prev, dietary: true }));
        if (loadedCount === totalModels) setIsLoading(false);
        console.log('✅ Dietary model preloaded');
      },
      (xhr) => {
        const progress = (xhr.loaded / xhr.total * 100).toFixed(0);
        console.log(`Dietary: ${progress}% loaded`);
      },
      (error) => {
        console.error('❌ Error loading dietary model:', error);
        loadedCount++;
        if (loadedCount === totalModels) setIsLoading(false);
      }
    );
    
    // Load meditation model
    loader.load(
      '/med.glb',
      (gltf) => {
        const model = prepareModel(gltf.scene, 'meditation', 80); // Increased zoom to 40
        model.visible = false; // Hide meditation initially
        model.traverse((child) => {
          if (child.isMesh) {
            child.visible = false;
          }
        });
        scene.add(model);
        meditationModelRef.current = model;
        
        // Setup animations if present
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          meditationMixerRef.current = mixer;
          
          // Play all animations
          gltf.animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            action.play();
          });
          
          console.log(`✅ Meditation model has ${gltf.animations.length} animation(s)`);
        } else {
          console.log('ℹ️ Meditation model has no animations');
        }
        
        loadedCount++;
        setModelsLoaded(prev => ({ ...prev, meditation: true }));
        if (loadedCount === totalModels) setIsLoading(false);
        console.log('✅ Meditation model preloaded');
      },
      (xhr) => {
        const progress = (xhr.loaded / xhr.total * 100).toFixed(0);
        console.log(`Meditation: ${progress}% loaded`);
      },
      (error) => {
        console.error('❌ Error loading meditation model:', error);
        loadedCount++;
        if (loadedCount === totalModels) setIsLoading(false);
      }
    );
    
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
    clockRef.current = clock;

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      
      pulseLight.intensity = 0.35 + Math.sin(elapsed * 1.4) * 0.2;

      // Update ayurvedic model animation if present
      if (ayurvedicMixerRef.current) {
        ayurvedicMixerRef.current.update(delta);
      }

      // Update home model animation if present
      if (homeMixerRef.current) {
        homeMixerRef.current.update(delta);
      }

      // Update dietary model animation if present
      if (dietaryMixerRef.current) {
        dietaryMixerRef.current.update(delta);
      }

      // Update meditation model animation if present
      if (meditationMixerRef.current) {
        meditationMixerRef.current.update(delta);
      }

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

  // Helper function to hide all models
  const hideAllModels = () => {
    [hospitalModelRef, ayurvedicModelRef, homeModelRef, dietaryModelRef, meditationModelRef].forEach(ref => {
      if (ref.current) {
        ref.current.visible = false;
        ref.current.traverse((child) => {
          if (child.isMesh) {
            child.visible = false;
          }
        });
      }
    });
  };

  // Effect to toggle between video and 3D models based on selected section
  useEffect(() => {
    console.log('🔄 Section changed to:', selectedSection);
    console.log('📊 Has analysis data:', hasAnalysisData);
    console.log('📦 Models loaded:', modelsLoaded);
    
    if (!modelsLoaded.hospital || !modelsLoaded.ayurvedic || !modelsLoaded.home || !modelsLoaded.dietary || !modelsLoaded.meditation) {
      console.log('⏳ Models not fully loaded yet, waiting...');
      return;
    }
    
    console.log('✅ All models loaded, processing section:', selectedSection);
    
    // Only show video if analysis data exists AND Probable Conditions is selected
    if (hasAnalysisData && selectedSection === 'probable_conditions') {
      console.log('🎥 Showing video for Probable Conditions');
      setShowVideo(true);
      
      // Hide both 3D models
      if (hospitalModelRef.current) {
        hospitalModelRef.current.visible = false;
        hospitalModelRef.current.traverse((child) => {
          if (child.isMesh) child.visible = false;
        });
      }
      if (ayurvedicModelRef.current) {
        ayurvedicModelRef.current.visible = false;
        ayurvedicModelRef.current.traverse((child) => {
          if (child.isMesh) child.visible = false;
        });
      }
      if (homeModelRef.current) {
        homeModelRef.current.visible = false;
        homeModelRef.current.traverse((child) => {
          if (child.isMesh) child.visible = false;
        });
      }
      if (dietaryModelRef.current) {
        dietaryModelRef.current.visible = false;
        dietaryModelRef.current.traverse((child) => {
          if (child.isMesh) child.visible = false;
        });
      }
      if (meditationModelRef.current) {
        meditationModelRef.current.visible = false;
        meditationModelRef.current.traverse((child) => {
          if (child.isMesh) child.visible = false;
        });
      }
      
      // Play video when shown
      if (videoRef.current) {
        videoRef.current.play().catch(err => {
          console.log('Video autoplay prevented:', err);
        });
      }
    } else if (selectedSection === 'ayurvedic_medicines') {
      console.log('Showing Ayurvedic model');
      setShowVideo(false);
      
      // Save current model's camera position before switching
      if (window.saveCameraPosition && currentModelType.current !== 'ayurvedic') {
        window.saveCameraPosition(currentModelType.current);
      }
      
      // Hide all models first
      hideAllModels();
      
      // Show ONLY Ayurvedic model
      if (ayurvedicModelRef.current) {
        ayurvedicModelRef.current.visible = true;
        ayurvedicModelRef.current.traverse((child) => {
          if (child.isMesh) child.visible = true;
        });
      }
      
      // Restore ayurvedic camera position
      if (window.restoreCameraPosition) {
        window.restoreCameraPosition('ayurvedic');
      }
      currentModelType.current = 'ayurvedic';
      
      // Pause video
      if (videoRef.current) {
        videoRef.current.pause();
      }
    } else if (selectedSection === 'home_remedies') {
      console.log('Showing Home model');
      setShowVideo(false);
      
      // Save current model's camera position before switching
      if (window.saveCameraPosition && currentModelType.current !== 'home') {
        window.saveCameraPosition(currentModelType.current);
      }
      
      // Hide all models first
      hideAllModels();
      
      // Show ONLY home model
      if (homeModelRef.current) {
        homeModelRef.current.visible = true;
        homeModelRef.current.traverse((child) => {
          if (child.isMesh) child.visible = true;
        });
      }
      
      // Restore home camera position
      if (window.restoreCameraPosition) {
        window.restoreCameraPosition('home');
      }
      currentModelType.current = 'home';
      
      // Pause video
      if (videoRef.current) {
        videoRef.current.pause();
      }
    } else if (selectedSection === 'dietary_recommendations') {
      console.log('Showing Dietary model');
      setShowVideo(false);
      
      // Save current model's camera position before switching
      if (window.saveCameraPosition && currentModelType.current !== 'dietary') {
        window.saveCameraPosition(currentModelType.current);
      }
      
      // Hide all models first
      hideAllModels();
      
      // Show ONLY dietary model
      if (dietaryModelRef.current) {
        dietaryModelRef.current.visible = true;
        dietaryModelRef.current.traverse((child) => {
          if (child.isMesh) child.visible = true;
        });
      }
      
      // Restore dietary camera position
      if (window.restoreCameraPosition) {
        window.restoreCameraPosition('dietary');
      }
      currentModelType.current = 'dietary';
      
      // Pause video
      if (videoRef.current) {
        videoRef.current.pause();
      }
    } else if (selectedSection === 'exercise') {
      console.log('Showing Meditation model');
      setShowVideo(false);
      
      // Save current model's camera position before switching
      if (window.saveCameraPosition && currentModelType.current !== 'meditation') {
        window.saveCameraPosition(currentModelType.current);
      }
      
      // Hide all models first
      hideAllModels();
      
      // Show ONLY meditation model
      if (meditationModelRef.current) {
        meditationModelRef.current.visible = true;
        meditationModelRef.current.traverse((child) => {
          if (child.isMesh) child.visible = true;
        });
      }
      
      // Restore meditation camera position
      if (window.restoreCameraPosition) {
        window.restoreCameraPosition('meditation');
      }
      currentModelType.current = 'meditation';
      
      // Pause video
      if (videoRef.current) {
        videoRef.current.pause();
      }
    } else if (selectedSection === 'risk_assessment' || selectedSection === 'conventional_treatments') {
      console.log('🏥 Showing Hospital model');
      setShowVideo(false);
      
      // Save current model's camera position before switching
      if (window.saveCameraPosition && currentModelType.current !== 'hospital') {
        window.saveCameraPosition(currentModelType.current);
      }
      
      // Show Hospital model, hide others
      if (hospitalModelRef.current) {
        hospitalModelRef.current.visible = true;
        hospitalModelRef.current.traverse((child) => {
          if (child.isMesh) child.visible = true;
        });
      }
      if (ayurvedicModelRef.current) {
        ayurvedicModelRef.current.visible = false;
        ayurvedicModelRef.current.traverse((child) => {
          if (child.isMesh) child.visible = false;
        });
      }
      if (homeModelRef.current) {
        homeModelRef.current.visible = false;
        homeModelRef.current.traverse((child) => {
          if (child.isMesh) child.visible = false;
        });
      }
      if (dietaryModelRef.current) {
        dietaryModelRef.current.visible = false;
        dietaryModelRef.current.traverse((child) => {
          if (child.isMesh) child.visible = false;
        });
      }
      if (meditationModelRef.current) {
        meditationModelRef.current.visible = false;
        meditationModelRef.current.traverse((child) => {
          if (child.isMesh) child.visible = false;
        });
      }
      
      // Restore hospital camera position
      if (window.restoreCameraPosition) {
        window.restoreCameraPosition('hospital');
      }
      currentModelType.current = 'hospital';
      
      // Pause video
      if (videoRef.current) {
        videoRef.current.pause();
      }
    } else {
      // Default state or initial load - show hospital model
      console.log('🏥 Showing Hospital model (default)');
      setShowVideo(false);
      
      // Save current model's camera position before switching
      if (window.saveCameraPosition && currentModelType.current !== 'hospital') {
        window.saveCameraPosition(currentModelType.current);
      }
      
      // Show Hospital model, hide others
      if (hospitalModelRef.current) {
        hospitalModelRef.current.visible = true;
        hospitalModelRef.current.traverse((child) => {
          if (child.isMesh) child.visible = true;
        });
      }
      if (ayurvedicModelRef.current) {
        ayurvedicModelRef.current.visible = false;
        ayurvedicModelRef.current.traverse((child) => {
          if (child.isMesh) child.visible = false;
        });
      }
      if (homeModelRef.current) {
        homeModelRef.current.visible = false;
        homeModelRef.current.traverse((child) => {
          if (child.isMesh) child.visible = false;
        });
      }
      if (dietaryModelRef.current) {
        dietaryModelRef.current.visible = false;
        dietaryModelRef.current.traverse((child) => {
          if (child.isMesh) child.visible = false;
        });
      }
      if (meditationModelRef.current) {
        meditationModelRef.current.visible = false;
        meditationModelRef.current.traverse((child) => {
          if (child.isMesh) child.visible = false;
        });
      }
      
      // Restore hospital camera position
      if (window.restoreCameraPosition) {
        window.restoreCameraPosition('hospital');
      }
      currentModelType.current = 'hospital';
      
      // Pause video
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
  }, [selectedSection, hasAnalysisData, modelsLoaded]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(15, 23, 42, 0.9)',
          padding: '1rem 2rem',
          borderRadius: '8px',
          border: '1px solid rgba(94, 234, 212, 0.3)',
          color: '#5eead4',
          zIndex: 10,
          fontFamily: 'monospace'
        }}>
          Loading 3D models...
        </div>
      )}
      
      {/* Video Background - Show only for Probable Conditions */}
      <video
        ref={videoRef}
        style={{
          display: showVideo ? 'block' : 'none',
          width: '100%',
          height: '100%',
          objectFit: 'contain', // Changed from 'cover' to 'contain' to show full video
          position: 'absolute',
          top: 0,
          left: 0,
          backgroundColor: '#0f172a' // Match the app background
        }}
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src="/Recording%202025-10-17%20061950.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* 3D Model - Show for all other sections */}
      <div 
        ref={mountRef} 
        className="three-workspace"
        style={{ display: showVideo ? 'none' : 'block' }}
      />
    </div>
  );
}
