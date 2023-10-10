document.addEventListener("DOMContentLoaded", function () {
    const downloadButton = document.getElementById("downloadButton");
    const webpToPngText = document.getElementById("webpToPngText");

    // Disable the download button and the text initially
    downloadButton.disabled = true;
    webpToPngText.classList.add("disabledText");

    const fileInput = document.getElementById("fileInput");

    fileInput.addEventListener("change", function () {
        console.log("File input change event fired");
        handleFileSelection();
    });

    downloadButton.addEventListener("click", function () {
        console.log("Download button click event fired");
        downloadConvertedImage();
    });

    let convertedBlob; // Variable to store the converted image blob
	
	 const supportedFormats = ['AVIF', 'SVG', 'PDF'];

    // Initial format index
    let currentFormatIndex = 0;

    // Function to change the text
    function changeFormatText() {
    const nextFormatIndex = (currentFormatIndex + 1) % supportedFormats.length;
    const currentFormat = supportedFormats[currentFormatIndex];
    const nextFormat = supportedFormats[nextFormatIndex];

    // Add class to initiate the fade-out animation
    webpToPngText.classList.add("fadeOut");

    // Set a timeout to update the text and remove the fade-out class after the fade-out animation
    setTimeout(() => {
        // Update the text
        webpToPngText.innerHTML = `<span class="currentFormat">${nextFormat}</span> to PNG`;

        // Force a reflow to apply the changes immediately
        void webpToPngText.offsetWidth;

        // Remove the fade-out class
        webpToPngText.classList.remove("fadeOut");

        // Increment the format index
        currentFormatIndex = nextFormatIndex;
    }, 500); // Adjust the time based on your preference
}

// Set an interval to change the text every 3 seconds (adjust as needed)
setInterval(changeFormatText, 3000);
	

    async function handleFileSelection() {
        const fileInput = document.getElementById("fileInput");
        const downloadButton = document.getElementById("downloadButton");
        const outputImage = document.getElementById("outputImage");
        const webpToPngText = document.getElementById("webpToPngText");
        const formatSelect = document.getElementById("formatSelect");

        downloadButton.disabled = true;
        webpToPngText.classList.add("disabledText");
        webpToPngText.style.display = "none";

        const file = fileInput.files[0];
        const selectedFormat = formatSelect.value;

        if (file && (file.type === "image/webp" || file.type === "image/avif")) {
            try {
                console.log("Starting conversion...");

                const imageBitmap = await createImageBitmap(file);
                
                const canvas = document.createElement("canvas");
                canvas.width = imageBitmap.width;
                canvas.height = imageBitmap.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(imageBitmap, 0, 0);

                const dataURL = canvas.toDataURL(`image/${selectedFormat}`);

                const blob = await fetch(dataURL).then(res => res.blob());

                convertedBlob = blob;
                displayConvertedImage(convertedBlob);

                downloadButton.disabled = false;
                webpToPngText.classList.remove("disabledText");
                webpToPngText.style.display = "block";
            } catch (error) {
                console.error("Conversion failed:", error);
                alert("Conversion failed. Please try again.");
                fileInput.value = "";
                outputImage.style.display = "none";
            }
        } else {
            alert("Please select a valid WebP or AVIF file.");
            fileInput.value = "";
            outputImage.style.display = "none";
        }
    }

    function displayConvertedImage(imageBlob) {
        console.log("Displaying converted image...");
        const outputImage = document.getElementById("outputImage");

        // Set the source of the output image
        outputImage.src = URL.createObjectURL(imageBlob);

        // Show the output image
        outputImage.style.display = "inline"; // or "inline-block" or "block"
    }

    function downloadConvertedImage() {
        console.log("Downloading converted image...");
        if (convertedBlob) {
            const downloadLink = document.createElement("a");
            downloadLink.href = URL.createObjectURL(convertedBlob);
            downloadLink.download = "converted_image." + formatSelect.value;
            downloadLink.click();
        }
    }
});
