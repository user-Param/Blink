// style/star-background.js

export function startStarfield() {
    const CONTAINER_ID = 'starfield-background';

    // Prevent multiple instances
    if (document.getElementById(CONTAINER_ID)) {
        return () => {}; // already running
    }

    let scene, camera, renderer;
    let container, mouseX = 0, mouseY = 0;
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;
    let animationFrameId = null;

    function init() {
        container = document.createElement('div');
        container.id = CONTAINER_ID;
        document.body.appendChild(container);

        const WIDTH = window.innerWidth;
        const HEIGHT = window.innerHeight;

        camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 1, 1000);
        camera.position.z = 500;

        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.0003);

        // Star generation (unchanged from your original)
        const geometry = new THREE.SphereGeometry(1000, 100, 50);
        const material = new THREE.PointCloudMaterial({
            size: 1.0,
            transparency: true,
            opacity: 0.7
        });

        for (let i = 0; i < 45000; i++) {
            const vertex = new THREE.Vector3();
            vertex.x = Math.random() * 2000 - 1000;
            vertex.y = Math.random() * 2000 - 1000;
            vertex.z = Math.random() * 2000 - 1000;
            geometry.vertices.push(vertex);
        }

        const stars = new THREE.PointCloud(geometry, material);
        scene.add(stars);

        // Renderer
        const isWebGL = (() => {
            try {
                const canvas = document.createElement('canvas');
                return !!(window.WebGLRenderingContext &&
                    (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
            } catch (e) {
                return false;
            }
        })();

        renderer = isWebGL
            ? new THREE.WebGLRenderer({ alpha: true })
            : new THREE.CanvasRenderer();

        renderer.setClearColor(0x000011, 1);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(WIDTH, HEIGHT);
        container.appendChild(renderer.domElement);

        window.addEventListener('resize', onWindowResize);
        document.addEventListener('mousemove', onMouseMove);
    }

    function onWindowResize() {
        const WIDTH = window.innerWidth;
        const HEIGHT = window.innerHeight;
        camera.aspect = WIDTH / HEIGHT;
        camera.updateProjectionMatrix();
        renderer.setSize(WIDTH, HEIGHT);
    }

    function onMouseMove(e) {
        mouseX = e.clientX - windowHalfX;
        mouseY = e.clientY - windowHalfY;
    }

    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        camera.position.x += (mouseX - camera.position.x) * 0.005;
        camera.position.y += (-mouseY - camera.position.y) * 0.005;
        camera.lookAt(scene.position);
        renderer.render(scene, camera);
    }

    init();
    animate();

    // Return cleanup function
    return function cleanup() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        window.removeEventListener('resize', onWindowResize);
        document.removeEventListener('mousemove', onMouseMove);
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
        // Optional: dispose Three.js resources to prevent memory leaks
        if (renderer) {
            renderer.dispose?.();
        }
    };
}