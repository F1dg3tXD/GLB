// This file contains functions related to loading 3D models into the viewer. 
// It includes functions to load models from files or URLs, manage animations, 
// and update the materials and lights based on the loaded model.

let model, mixer, animations = [], materials = [];
let wireframeHelper, skeletonHelper;
let modelLights = [];

// Function to load a model from a URL
function loadModel(url, bonesEnabled = true) {
    const loader = new THREE.GLTFLoader();
    loader.load(url, (gltf) => {
        if (model) scene.remove(model);
        if (wireframeHelper) scene.remove(wireframeHelper);
        if (skeletonHelper) scene.remove(skeletonHelper);

        model = gltf.scene;
        scene.add(model);

        modelLights = [];
        let hasModelLights = false;
        model.traverse((child) => {
            if (child.isLight) {
                hasModelLights = true;
                modelLights.push(child);
                let urlParams = new URLSearchParams(window.location.search);
                const sceneLightsEnabled = urlParams.get('sceneLights') !== 'false';
                child.visible = sceneLightsEnabled;
            }
        });

        animations = gltf.animations;
        if (animations.length) {
            mixer = new THREE.AnimationMixer(model);
            let urlParams = new URLSearchParams(window.location.search);
            const startAnim = parseInt(urlParams.get('animation')) || 0;
            if (startAnim >= 0 && startAnim < animations.length) {
                playAnimation(startAnim);
            } else if (animations.length > 0) {
                playAnimation(0);
            }
        }

        materials = [];
        model.traverse((child) => {
            if (child.isMesh && child.material) {
                materials.push(child.material);
            }
        });
        updateMaterialsList();

        model.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.side = THREE.DoubleSide;
                if (child.material.map && child.material.transparent) {
                    // Additional material settings can be applied here
                }
            }
        });

        let meshForWireframe;
        model.traverse((child) => {
            if (child.isMesh && !meshForWireframe) {
                meshForWireframe = child;
            }
        });

        if (meshForWireframe) {
            const wireframeGeometry = new THREE.WireframeGeometry(meshForWireframe.geometry);
            const wireframeMaterial = new THREE.LineBasicMaterial({
                color: 0xffffff,
                depthTest: false
            });
            wireframeHelper = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
            wireframeHelper.visible = false;
            model.add(wireframeHelper);
        }
        skeletonHelper = new THREE.SkeletonHelper(model);
        skeletonHelper.visible = bonesEnabled;
        scene.add(skeletonHelper);

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 5 / maxDim;

        model.scale.setScalar(scale);
        model.position.sub(center.multiplyScalar(scale));

        const fov = camera.fov * (Math.PI / 180);
        const distance = Math.abs(maxDim / Math.sin(fov / 2)) * 1.5;

        camera.position.set(0, 0, distance);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        controls.target.copy(new THREE.Vector3(0, 0, 0));
        controls.maxDistance = distance * 3;
        controls.minDistance = distance * 0.1;
        controls.update();

        camera.lookAt(model.position);
    }, undefined, function (error) {
        console.error(error);
    });
}

// Function to play a specific animation
function playAnimation(index) {
    if (mixer) {
        mixer.stopAllAction();
        currentAnimation = mixer.clipAction(animations[index]);
        currentAnimation.play();
        isPlaying = true;
        document.getElementById('play-pause-btn').textContent = 'Pause';

        const timeline = document.getElementById('timeline');
        timeline.value = 0;

        const duration = animations[index].duration;
        document.getElementById('time-display').textContent =
            `0.00 / ${duration.toFixed(2)}`;

        mixer.setTime(0);

        updateAnimationsList();
    }
}

// Function to update the materials list in the UI
function updateMaterialsList() {
    const materialsList = document.getElementById('materials-list');
    materialsList.innerHTML = '<h4>Materials:</h4>';

    const materialSelect = document.getElementById('material-select');
    materialSelect.innerHTML = '<option value="">Select a material</option>';

    if (materials.length === 0) {
        materialsList.innerHTML += '<p>No materials found</p>';
    } else {
        const ul = document.createElement('ul');
        materials.forEach((material, index) => {
            const li = document.createElement('li');
            li.textContent = `Material ${index + 1}: ${material.name || material.type}`;
            ul.appendChild(li);

            const option = document.createElement('option');
            option.value = index;
            option.textContent = material.name || `Material ${index + 1}`;
            materialSelect.appendChild(option);
        });
        materialsList.appendChild(ul);
    }
}