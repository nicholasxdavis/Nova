document.addEventListener("DOMContentLoaded", function () {
    const downloadButton = document.getElementById("downloadButton");
    const webpToPngText = document.getElementById("webpToPngText");
    const formatSelect = document.getElementById("formatSelect");
    const fileInput = document.getElementById("fileInput");
    const outputImage = document.getElementById("outputImage");

    downloadButton.disabled = true;
    webpToPngText.classList.add("disabledText");

    fileInput.addEventListener("change", handleFileSelection);
    downloadButton.addEventListener("click", downloadConvertedImage);

    let convertedBlob;
    const supportedFormats = ['AVIF', 'SVG', 'PDF'];
    let currentFormatIndex = 0;

    function changeFormatText() {
        const nextFormatIndex = (currentFormatIndex + 1) % supportedFormats.length;
        const currentFormat = supportedFormats[currentFormatIndex];
        const nextFormat = supportedFormats[nextFormatIndex];

        const darkModePreference = localStorage.getItem('darkMode');
        const isDarkMode = darkModePreference === 'dark';
        const isLightMode = darkModePreference === 'light-mode';

        webpToPngText.classList.toggle("dark-mode-text", isDarkMode);
        webpToPngText.classList.add("erase");

        setTimeout(() => {
            webpToPngText.innerHTML = `<span class="currentFormat">${nextFormat.toUpperCase()}</span> to ${formatSelect.value.toUpperCase()}`;

            setTimeout(() => {
                webpToPngText.classList.remove("erase");
                webpToPngText.classList.add("type");

                if (isDarkMode) {
                    webpToPngText.classList.add("dark-mode-text");
                }

                setTimeout(() => {
                    webpToPngText.classList.remove("type");

                    if (isLightMode) {
                        setTimeout(() => {
                            webpToPngText.classList.remove("dark-mode-text");
                        }, 0);
                    }

                    currentFormatIndex = nextFormatIndex;
                }, 500);
            }, 10);
        }, 500);
    }

    setInterval(changeFormatText, 4000);

    const logoContainer = document.getElementById("logo-container");
    const logo2 = document.getElementById("logo2");
    const logo = document.getElementById("logo");
    const whitelogoContainer = document.getElementById("whitelogo-container");
    const wlogo2 = document.getElementById("wlogo2");
    const wlogo = document.getElementById("wlogo");
    const darkIcon = document.getElementById('dark');
    const lightIcon = document.getElementById('light');

    const darkModePreference = localStorage.getItem('darkMode');

    if (darkModePreference === 'dark') {
        applyDarkMode();
    } else {
        applyLightMode();
    }

    logoContainer.addEventListener("mouseenter", () => {
        logo2.style.display = "block";
        wlogo2.style.display = "none";
    });

    logoContainer.addEventListener("mouseleave", () => {
        logo2.style.display = "none";
    });

    whitelogoContainer.addEventListener("mouseenter", () => {
        wlogo2.style.display = "block";
        logo2.style.display = "none";
    });

    whitelogoContainer.addEventListener("mouseleave", () => {
        wlogo2.style.display = "none";
    });

    darkIcon.addEventListener('click', applyDarkMode);
    lightIcon.addEventListener('click', applyLightMode);

    function applyDarkMode() {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        whitelogoContainer.style.display = 'block';
        logoContainer.style.display = 'none';
        webpToPngText.classList.add("dark-mode-text");
        localStorage.setItem('darkMode', 'dark');
        toggleIconVisibility();
    }

    function applyLightMode() {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
        whitelogoContainer.style.display = 'none';
        logoContainer.style.display = 'block';
        webpToPngText.classList.remove("dark-mode-text");
        localStorage.setItem('darkMode', 'light');
        toggleIconVisibility();
    }

    function toggleIconVisibility() {
        darkIcon.style.display = (document.body.classList.contains('dark-mode')) ? 'none' : 'inline-block';
        lightIcon.style.display = (document.body.classList.contains('dark-mode')) ? 'inline-block' : 'none';
    }

    let conversionStartTime;

    async function handleFileSelection() {
        downloadButton.disabled = true;
        webpToPngText.classList.add("disabledText");
        webpToPngText.style.display = "none";

        const file = fileInput.files[0];

        if (file && (file.type === "image/webp" || file.type === "image/avif" || file.type === "image/svg+xml")) {
            try {
                console.log("Starting conversion...");
                conversionStartTime = performance.now();

                let blob;

                 if (file.type === "image/svg+xml") {
                const svgData = await readFileAsDataURL(file);
                blob = await convertToPNGFromSVG(svgData);
                } else {
                    const dataURL = await readFileAsDataURL(file);
                    const convertedData = await convertToPNG(dataURL);
                    blob = new Blob([convertedData], { type: "image/png" });
                }

                convertedBlob = blob;
                displayConvertedImage(convertedBlob);

                downloadButton.disabled = false;
                webpToPngText.style.display = "block";
                const conversionEndTime = performance.now();
                const conversionTime = conversionEndTime - conversionStartTime;
                console.log("Conversion took " + conversionTime.toFixed(2) + " milliseconds");
                webpToPngText.classList.add("display-text");
                webpToPngText.innerHTML = `Conversion took ${conversionTime.toFixed(2)} milliseconds`;
            } catch (error) {
                console.error("Conversion failed:", error);
                alert("Conversion failed. Please try again.");
                resetFileInputAndOutput();
            }
        } else if (file && file.type === "application/pdf") {
            try {
                console.log("Rendering PDF...");
                conversionStartTime = performance.now();

                // Make sure to include pdfjsLib
                const pdfjsLib = window['pdfjs-dist/build/pdf'];
                const workerSrc = 'pdf.worker.js'; // Adjust the path to your pdf.worker.js file
                pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

                const pdfData = await readFileAsArrayBuffer(file);
                const pdfDocument = await pdfjsLib.getDocument({ data: pdfData }).promise;
                const pdfBlob = await renderPDF(pdfDocument);

                convertedBlob = pdfBlob;
                displayConvertedImage(convertedBlob);

                downloadButton.disabled = false;
                webpToPngText.style.display = "block";
                const conversionEndTime = performance.now();
                const conversionTime = conversionEndTime - conversionStartTime;
                console.log("Rendering took " + conversionTime.toFixed(2) + " milliseconds");
                webpToPngText.classList.add("display-text");
                webpToPngText.innerHTML = `Rendering took ${conversionTime.toFixed(2)} milliseconds`;
            } catch (error) {
                console.error("PDF rendering failed:", error);
                alert("PDF rendering failed. Please try again.");
                resetFileInputAndOutput();
            }
        } else {
            alert("Please select a valid file (WebP, AVIF, SVG, or PDF).");
            resetFileInputAndOutput();
        }
    }

    async function renderPDF(pdfDocument) {
    try {
        const firstPage = await pdfDocument.getPage(1);
        const viewport = firstPage.getViewport({ scale: 1.5 });

        // Create a canvas to render the PDF page
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Render the PDF page onto the canvas
        await firstPage.render({
            canvasContext: context,
            viewport: viewport
        }).promise;

        // Convert the canvas to a Blob representing the image
        return new Promise(resolve => {
            canvas.toBlob(blob => {
                resolve(blob);
            }, 'image/png');
        });
    } catch (error) {
        console.error('PDF rendering failed:', error);
        throw error; // Rethrow the error to handle it in the calling function
    }
}

    // Function to read a file as an ArrayBuffer
    function readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                resolve(reader.result);
            };

            reader.onerror = reject;

            reader.readAsArrayBuffer(file);
        });
    }

    async function readPDFAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    function displayPDF(pdfBlob) {
        console.log("Displaying PDF...");
        const pdfViewer = document.createElement('iframe');
        pdfViewer.src = URL.createObjectURL(pdfBlob);
        pdfViewer.style.width = '100%';
        pdfViewer.style.height = '500px';
        document.body.appendChild(pdfViewer);
    }

    function resetFileInputAndOutput() {
        fileInput.value = "";
        outputImage.style.display = "none";
    }

    function downloadPDF() {
        console.log("Downloading PDF...");
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(pdfBlob);
        downloadLink.download = "document.pdf";
        downloadLink.click();
        URL.revokeObjectURL(downloadLink.href);
    }
	async function convertToPNGFromSVG(svgData) {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = function () {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            canvas.width = img.width;
            canvas.height = img.height;

            context.drawImage(img, 0, 0);

            canvas.toBlob(
                (blob) => {
                    resolve(blob);
                },
                'image/png',
                1
            );
        };

        img.onerror = function (error) {
            reject(error);
        };

        img.src = `data:image/svg+xml,${encodeURIComponent(svgData)}`;
    });
}

    async function convertToPNG(dataURL) {
        const response = await fetch(dataURL);
        const blob = await response.blob();

        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = function () {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                canvas.width = img.width;
                canvas.height = img.height;

                context.drawImage(img, 0, 0);

                canvas.toBlob(
                    (blob) => {
                        resolve(blob);
                    },
                    'image/png',
                    1
                );
            };

            img.onerror = function (error) {
                reject(error);
            };

            img.src = URL.createObjectURL(blob);
        });
    }

    function displayConvertedImage(imageBlob) {
        console.log("Displaying converted image...");
        outputImage.src = URL.createObjectURL(imageBlob);
        outputImage.style.cursor = "pointer";
        outputImage.style.display = "inline";
        const miniLogo = document.getElementById("miniLogo");
        miniLogo.style.display = "none";

        outputImage.addEventListener("click", openImageViewer);
    }

    function openImageViewer() {
        const viewerWindow = window.open(outputImage.src, "_blank");

        if (!viewerWindow || viewerWindow.closed || typeof viewerWindow.closed === "undefined") {
            alert("Popup blocked. Please allow popups for this site to view the image.");
        }
    }

    async function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            if (file.type === "image/svg+xml") {
                // For SVG files, resolve with the raw text content
                resolve(reader.result);
            } else {
                // For other file types, resolve with the data URL
                resolve(reader.result);
            }
        };

        reader.onerror = reject;

        if (file.type === "image/svg+xml") {
            // For SVG files, read as text
            reader.readAsText(file);
        } else {
            // For other file types, read as data URL
            reader.readAsDataURL(file);
        }
    });
}

    function downloadConvertedImage() {
        console.log("Downloading converted image...");
        if (convertedBlob) {
            try {
                const downloadLink = document.createElement("a");
                downloadLink.href = URL.createObjectURL(convertedBlob);

                const fileExtension = formatSelect.value.toLowerCase();
                downloadLink.download = `converted_image.${fileExtension}`;

                downloadLink.click();
                URL.revokeObjectURL(downloadLink.href);

                webpToPngText.classList.add("display-text");
                webpToPngText.innerHTML = `File Saved`;
            } catch (error) {
                console.error("Error during download:", error);
                alert("Error during download. Please try again.");
            }
        }
    }
});
