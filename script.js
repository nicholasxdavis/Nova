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
        darkIcon.style.display = 'none';
        lightIcon.style.display = 'inline-block';
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        whitelogoContainer.style.display = 'block';
        logoContainer.style.display = 'none';
        darkIcon.style.display = 'none';
        lightIcon.style.display = 'inline-block';
        webpToPngText.classList.add("dark-mode-text");
        localStorage.setItem('darkMode', 'dark');
    }

    function applyLightMode() {
        lightIcon.style.display = 'none';
        darkIcon.style.display = 'inline-block';
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
        whitelogoContainer.style.display = 'none';
        logoContainer.style.display = 'block';
        lightIcon.style.display = 'none';
        darkIcon.style.display = 'inline-block';
        webpToPngText.classList.remove("dark-mode-text");
        localStorage.setItem('darkMode', 'light');
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
                blob = new Blob([file], { type: "image/svg+xml" });
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
            fileInput.value = "";
            outputImage.style.display = "none";
        }
    } else {
        alert("Please select a valid WebP, AVIF, or SVG file.");
        fileInput.value = "";
        outputImage.style.display = "none";
    }
}

async function convertToPNG(dataURL) {
    const response = await fetch(dataURL);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = function () {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            // Set canvas dimensions to image dimensions
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw the image on the canvas
            context.drawImage(img, 0, 0);

            // Convert the canvas content to a PNG blob
            canvas.toBlob(
                (blob) => {
                    resolve(blob);
                },
                'image/png',
                1 // Quality (from 0 to 1)
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
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

     function downloadConvertedImage() {
        console.log("Downloading converted image...");
        if (convertedBlob) {
            try {
                const downloadLink = document.createElement("a");
                downloadLink.href = URL.createObjectURL(convertedBlob);

                // Set the appropriate file extension based on the selected format
                const fileExtension = formatSelect.value.toLowerCase();
                downloadLink.download = `converted_image.${fileExtension}`;

                // Trigger the download
                downloadLink.click();

                // Clean up
                URL.revokeObjectURL(downloadLink.href);

                // Update the display text
                webpToPngText.classList.add("display-text");
                webpToPngText.innerHTML = `File Saved`;
            } catch (error) {
                console.error("Error during download:", error);
                alert("Error during download. Please try again.");
            }
        }
    }

    // ... (unchanged part)

});
