// Main UI and event logic

// Assumes modelLoader.js exposes: initScene, loadModel, toggleWireframe, toggleBones, cycleShaders, toggleLights, toggleSceneLights, playPauseAnimation, updateTimeline, showEmbedCodeDialog, applyBackground, updateBackgroundURLParams, loadBackgroundFromURL, etc.

window.addEventListener('DOMContentLoaded', () => {
    // Init scene
    initScene().then(() => {
        loadBackgroundFromURL();
        animate();
    });

    // UI event bindings
    document.getElementById('load-button').addEventListener('click', () => {
        document.getElementById('load-popup').style.display = 'block';
    });
    document.getElementById('close-load-popup').addEventListener('click', () => {
        document.getElementById('load-popup').style.display = 'none';
    });
    document.getElementById('file-input').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            loadModel(url);
            document.getElementById('load-popup').style.display = 'none';
        }
    });
    document.getElementById('load-url-btn').addEventListener('click', () => {
        const url = document.getElementById('url-input').value;
        if (url) {
            window.location.href = `?source=${encodeURIComponent(url)}`;
            document.getElementById('load-popup').style.display = 'none';
        }
    });

    document.getElementById('wireframe-btn').addEventListener('click', toggleWireframe);
    document.getElementById('bones-btn').addEventListener('click', toggleBones);
    document.getElementById('shaders-btn').addEventListener('click', cycleShaders);
    document.getElementById('lights-btn').addEventListener('click', toggleLights);
    document.getElementById('scene-lights-btn').addEventListener('click', toggleSceneLights);

    document.getElementById('play-pause-btn').addEventListener('click', playPauseAnimation);
    document.getElementById('timeline').addEventListener('input', updateTimeline);

    document.getElementById('embed-btn').addEventListener('click', showEmbedCodeDialog);
    document.getElementById('close-embed-dialog').addEventListener('click', () => {
        document.getElementById('embed-dialog').style.display = 'none';
    });

    document.getElementById('background-changer').addEventListener('click', () => {
        document.getElementById('background-popup').style.display = 'block';
    });
    document.getElementById('close-background-popup').addEventListener('click', () => {
        document.getElementById('background-popup').style.display = 'none';
    });
    document.getElementById('apply-background-btn').addEventListener('click', () => {
        applyBackground();
        updateBackgroundURLParams();
        document.getElementById('background-popup').style.display = 'none';
    });
});