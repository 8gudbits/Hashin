const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const mobileButton = document.getElementById("mobileButton");
const filenameDisplay = document.getElementById("filename");
const filesizeDisplay = document.getElementById("filesize");
const hashDisplay = document.getElementById("hash");
const algorithmName = document.getElementById("algorithmName");
const resultsContainer = document.getElementById("results");
const copyButton = document.getElementById("copyButton");
const newFileButton = document.getElementById("newFileButton");
const spinner = document.getElementById("spinner");
const fileProgress = document.getElementById("fileProgress");
const fileProgressBar = document.getElementById("fileProgressBar");
const copyNotification = document.getElementById("copyNotification");

// Custom dropdown elements
const dropdownSelected = document.querySelector(".dropdown-selected");
const dropdownOptions = document.querySelector(".dropdown-options");
const dropdownOptionItems = document.querySelectorAll(".dropdown-option");
const dropdownChevron = document.querySelector(".dropdown-selected i");

// Set initial algorithm value
let selectedAlgorithm = "SHA256";

// Custom dropdown functionality
dropdownSelected.addEventListener("click", () => {
  dropdownOptions.classList.toggle("active");
  dropdownChevron.style.transform = dropdownOptions.classList.contains("active")
    ? "rotate(180deg)"
    : "rotate(0deg)";
});

// Handle option selection
dropdownOptionItems.forEach((option) => {
  option.addEventListener("click", () => {
    const value = option.getAttribute("data-value");
    const text = option.querySelector("span").textContent;

    // Update selected value
    selectedAlgorithm = value;
    algorithmName.textContent = text;

    // Update dropdown display
    dropdownSelected.querySelector("span").textContent = text;

    // Update selected class
    dropdownOptionItems.forEach((opt) => opt.classList.remove("selected"));
    option.classList.add("selected");

    // Close dropdown
    dropdownOptions.classList.remove("active");
    dropdownChevron.style.transform = "rotate(0deg)";

    // If there's already a file, re-calculate the hash with new algorithm
    if (filenameDisplay.textContent) {
      hashDisplay.textContent =
        "Select the file again to calculate with " + text;
    }
  });
});

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  if (
    !dropdownSelected.contains(e.target) &&
    !dropdownOptions.contains(e.target)
  ) {
    dropdownOptions.classList.remove("active");
    dropdownChevron.style.transform = "rotate(0deg)";
  }
});

// Handle drag and drop events
dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("dragover");
});

dropzone.addEventListener("dragleave", () => {
  dropzone.classList.remove("dragover");
});

dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("dragover");
  handleFile(e.dataTransfer.files[0]);
});

// Handle file selection via click on dropzone
dropzone.addEventListener("click", (e) => {
  if (e.target === dropzone) {
    fileInput.click();
  }
});

// Handle file selection via mobile button
mobileButton.addEventListener("click", () => {
  fileInput.click();
});

// Handle new file button
newFileButton.addEventListener("click", () => {
  fileInput.value = "";
  resultsContainer.classList.remove("visible");
});

// Handle file selection via input
fileInput.addEventListener("change", (e) => {
  if (e.target.files.length) {
    handleFile(e.target.files[0]);
  }
});

// Handle copy to clipboard
copyButton.addEventListener("click", () => {
  const hashText = hashDisplay.textContent;
  navigator.clipboard
    .writeText(hashText)
    .then(() => {
      copyNotification.classList.add("visible");
      setTimeout(() => {
        copyNotification.classList.remove("visible");
      }, 2000);
    })
    .catch((err) => {
      console.error("Failed to copy hash:", err);
    });
});

// Format file size
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " bytes";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  else return (bytes / 1048576).toFixed(1) + " MB";
}

// Process the selected file
function handleFile(file) {
  if (!file) return;

  // Show loading state
  spinner.style.display = "block";
  fileProgress.style.display = "block";
  resultsContainer.classList.remove("visible");
  dropzone.classList.add("hashing");

  filenameDisplay.textContent = file.name;
  filesizeDisplay.textContent = formatFileSize(file.size);

  // Simulate progress for large files
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += 5;
    fileProgressBar.style.width = `${progress}%`;
    if (progress >= 90) clearInterval(progressInterval);
  }, 100);

  const reader = new FileReader();
  reader.onload = function (event) {
    clearInterval(progressInterval);
    fileProgressBar.style.width = "100%";

    setTimeout(() => {
      const arrayBuffer = event.target.result;
      const uint8 = new Uint8Array(arrayBuffer);
      const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
      let hash;

      switch (selectedAlgorithm) {
        case "MD5":
          hash = CryptoJS.MD5(wordArray).toString();
          break;
        case "SHA1":
          hash = CryptoJS.SHA1(wordArray).toString();
          break;
        case "SHA256":
          hash = CryptoJS.SHA256(wordArray).toString();
          break;
        case "SHA384":
          hash = CryptoJS.SHA384(wordArray).toString();
          break;
        case "SHA512":
          hash = CryptoJS.SHA512(wordArray).toString();
          break;
        case "RIPEMD160":
          hash = CryptoJS.RIPEMD160(wordArray).toString();
          break;
        case "SHA3-224":
          hash = sha3_224(uint8);
          break;
        case "SHA3-256":
          hash = sha3_256(uint8);
          break;
        case "SHA3-384":
          hash = sha3_384(uint8);
          break;
        case "SHA3-512":
          hash = sha3_512(uint8);
          break;
        default:
          hash = "Unsupported algorithm";
      }

      // Display results
      hashDisplay.textContent = hash;
      resultsContainer.classList.add("visible");
      spinner.style.display = "none";
      dropzone.classList.remove("hashing");
      fileProgress.style.display = "none";
      fileProgressBar.style.width = "0%";
    }, 500);
  };

  reader.readAsArrayBuffer(file);
}

