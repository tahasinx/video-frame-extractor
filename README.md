# Video Frame Extractor

A modern, mobile-friendly web app to extract frames from a video file and view them as images in a gallery.

## Features
- **Upload by drag-and-drop or browse:** Easily add a video file by dragging it onto the app or clicking the "browse" link.
- **No server upload:** All processing is local in your browser.
- **Optional start/end times:** Extract frames from a specific segment, or leave blank to use the full video.
- **Extracts at 5 frames per second.**
- **Responsive gallery:** View extracted frames in a grid, with lightbox zoom and download options.
- **Modern, accessible UI:** Uses the Inter font for a clean look, with clear feedback and error messages.
- **Mobile-friendly:** Controls and gallery adapt for touch and small screens.
- **Analysis overlay:** Shows an "Analyzing..." spinner overlay while extracting frames.
- **Stop button:** Cancel analysis and reset the form at any time.

## How to Use
1. Open `index.html` in your web browser.
2. Drag and drop a video file onto the upload area, or click "browse" to select a file (supported formats: mp4, webm, etc.).
3. (Optional) Enter start and end times (in seconds) to select a segment of the video.
4. Click the **Analyze Video** button.
5. While analyzing, you can click **Stop** to cancel and reset.
6. Extracted frames will appear in a gallery below. Click any frame to view it larger or download it.

## Tech Stack
- HTML, CSS (with [Inter](https://fonts.google.com/specimen/Inter) font), JavaScript (Vanilla)
- [LightGallery](https://www.lightgalleryjs.com/) for the image gallery and zoom functionality

## Notes
- All processing is done in the browser; no video data is uploaded to a server.
- Works best in modern browsers with good video format support.
- Designed for both desktop and mobile use.

