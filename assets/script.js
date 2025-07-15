const videoInput = document.getElementById('videoInput');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const framesContainer = document.getElementById('frames');
const analyzeBtn = document.getElementById('analyzeBtn');
const startTimeInput = document.getElementById('startTime');
const endTimeInput = document.getElementById('endTime');
const dropArea = document.getElementById('dropArea');
const uploadFeedback = document.getElementById('uploadFeedback');
const inputFeedback = document.getElementById('inputFeedback');
const analyzingOverlay = document.getElementById('analyzingOverlay');
const stopBtn = document.getElementById('stopBtn');

const ctx = canvas.getContext('2d');
let videoLoaded = false;
let analysisInProgress = false;
let stopRequested = false;
let seekedHandler = null;

function isValidVideoFile(file) {
    return file && file.type.startsWith("video/");
}

function showFeedback(message, isError = false) {
    uploadFeedback.textContent = message;
    uploadFeedback.style.color = isError ? '#d9534f' : '#28a745';
}

function clearFeedback() {
    uploadFeedback.textContent = '';
}

function validateInputs() {
    analyzeBtn.disabled = !videoLoaded;
}

[startTimeInput, endTimeInput].forEach(input => {
    input.addEventListener('input', validateInputs);
    input.addEventListener('blur', validateInputs);
});

// Update button state when video is loaded
video.addEventListener('loadedmetadata', validateInputs);

// Initial state
analyzeBtn.disabled = true;

// Drag-and-drop events
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropArea.classList.add('dragover');
    });
});
['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropArea.classList.remove('dragover');
    });
});
dropArea.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files[0];
    handleFile(file);
});

videoInput.addEventListener('change', () => {
    const file = videoInput.files[0];
    handleFile(file);
});

function handleFile(file) {
    if (!isValidVideoFile(file)) {
        showFeedback('Please upload a valid video file.', true);
        videoInput.value = '';
        return;
    }
    video.src = URL.createObjectURL(file);
    videoLoaded = false;
    showFeedback('Loading video...');
    video.addEventListener('loadedmetadata', () => {
        videoLoaded = true;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        showFeedback(`Loaded: ${file.name} (${video.duration.toFixed(2)}s)`);
        validateInputs();
    }, { once: true });
}

function resetForm() {
    video.src = '';
    videoInput.value = '';
    videoLoaded = false;
    startTimeInput.value = '';
    endTimeInput.value = '';
    framesContainer.innerHTML = '';
    showFeedback('', false);
    inputFeedback.textContent = '';
    analyzingOverlay.style.display = 'none';
    analyzeBtn.textContent = 'Analyze Video';
    analyzeBtn.disabled = true;
}

stopBtn.addEventListener('click', () => {
    stopRequested = true;
    if (seekedHandler) video.removeEventListener('seeked', seekedHandler);
    resetForm();
});

analyzeBtn.addEventListener('click', () => {
    if (!videoLoaded) return;
    clearFeedback();
    analyzeBtn.textContent = 'Extracting...';
    analyzeBtn.disabled = true;
    analyzingOverlay.style.display = 'flex';
    analysisInProgress = true;
    stopRequested = false;
    setTimeout(() => {
        const duration = video.duration;
        const fps = 5;
        const interval = 1 / fps;

        let start = parseFloat(startTimeInput.value);
        let end = parseFloat(endTimeInput.value);
        start = (!isNaN(start) && start >= 0 && start <= duration) ? start : 0;
        end = (!isNaN(end) && end >= 0 && end <= duration) ? end : duration;
        if (start > end) [start, end] = [end, start];

        framesContainer.innerHTML =
            `<p>Extracting frames from ${start.toFixed(2)}s to ${end.toFixed(2)}s...</p>`;

        framesContainer.innerHTML = '';
        let currentTime = start;

        const captureFrame = () => {
            if (stopRequested) return;
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
            if (stopRequested) {
                analyzingOverlay.style.display = 'none';
                analyzeBtn.textContent = 'Analyze Video';
                validateInputs();
                return;
            }
            if (currentTime > end) {
                lightGallery(framesContainer, {
                    selector: '.frame-link',
                    zoom: true,
                });
                analyzingOverlay.style.display = 'none';
                analyzeBtn.textContent = 'Analyze Video';
                validateInputs();
                return;
            }
            video.currentTime = currentTime;
        };

        seekedHandler = function handler() {
            if (stopRequested) {
                video.removeEventListener('seeked', seekedHandler);
                return;
            }
            captureFrame();
            currentTime += interval;
            if (currentTime <= end) {
                seekAndCapture();
            } else {
                video.removeEventListener('seeked', seekedHandler);
                seekAndCapture();
            }
        };
        video.addEventListener('seeked', seekedHandler);
        seekAndCapture();
    }, 100);
});