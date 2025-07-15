const videoInput = document.getElementById('videoInput');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const framesContainer = document.getElementById('frames');
const analyzeBtn = document.getElementById('analyzeBtn');
const startTimeInput = document.getElementById('startTime');
const endTimeInput = document.getElementById('endTime');

const ctx = canvas.getContext('2d');
let videoLoaded = false;

function isValidVideoFile(file) {
    return file && file.type.startsWith("video/");
}

videoInput.addEventListener('change', () => {
    const file = videoInput.files[0];
    if (!isValidVideoFile(file)) {
        alert("Please upload a valid video file.");
        videoInput.value = "";
        return;
    }
    video.src = URL.createObjectURL(file);
    videoLoaded = false;
    video.addEventListener('loadedmetadata', () => {
        videoLoaded = true;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    }, { once: true });
});

analyzeBtn.addEventListener('click', () => {
    if (!videoLoaded) {
        alert('Upload a valid video and wait for it to load.');
        return;
    }

    const duration = video.duration;
    const fps = 5;
    const interval = 1 / fps;

    let start = parseFloat(startTimeInput.value) || 0;
    let end = parseFloat(endTimeInput.value) || duration;
    start = Math.max(0, Math.min(duration, start));
    end = Math.max(start, Math.min(duration, end));

    framesContainer.innerHTML =
        `<p>Extracting frames from ${start.toFixed(2)}s to ${end.toFixed(2)}s...</p>`;

    framesContainer.innerHTML = '';
    let currentTime = start;

    const captureFrame = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL('image/jpeg');
        const anchor = document.createElement('a');
        anchor.href = dataURL;
        anchor.setAttribute('data-lg-size', `${canvas.width}-${canvas.height}`);
        anchor.className = 'frame-link';

        const img = document.createElement('img');
        img.src = dataURL;
        img.alt = `Frame at ${currentTime.toFixed(2)}s`;

        anchor.appendChild(img);
        framesContainer.appendChild(anchor);
    };

    const seekAndCapture = () => {
        if (currentTime > end) {
            lightGallery(framesContainer, {
                selector: '.frame-link',
                zoom: true,
            });
            return;
        }
        video.currentTime = currentTime;
    };

    video.addEventListener('seeked', function handler() {
        captureFrame();
        currentTime += interval;
        if (currentTime <= end) {
            seekAndCapture();
        } else {
            video.removeEventListener('seeked', handler);
            seekAndCapture();
        }
    });

    seekAndCapture();
});