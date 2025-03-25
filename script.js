//////////////////////////
// Additional API Functions
//////////////////////////

// Function to get battery status:
async function getBatteryStatus() {
  if (navigator.getBattery) {
    try {
      const battery = await navigator.getBattery();
      // battery.level is a float between 0 and 1
      return {
        charging: battery.charging,
        level: battery.level,
        chargingTime: battery.chargingTime,     // seconds until fully charged (or Infinity if discharging)
        dischargingTime: battery.dischargingTime  // seconds until empty (or Infinity if charging)
      };
    } catch (error) {
      console.error('Error retrieving battery status:', error);
      return null;
    }
  } else {
    console.warn('Battery Status API is not supported on this browser.');
    return null;
  }
}

// Function to get graphics information via WebGL:
function getGraphicsInfo() {
  // Create an invisible canvas element
  const canvas = document.createElement('canvas');
  // Try to get a WebGL rendering context
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    console.warn('WebGL is not supported on this browser.');
    return null;
  }
  
  // Use the WEBGL_debug_renderer_info extension for detailed graphics info
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  let vendor = 'unknown';
  let renderer = 'unknown';
  
  if (debugInfo) {
    vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
  } else {
    console.warn('WEBGL_debug_renderer_info extension is not available.');
  }
  
  return { vendor, renderer };
}

//////////////////////////
// Existing Helper Functions
//////////////////////////

// Extracts browser information from user agent data
function getBrowserInfo() {
  let browserStr = "";

  if (navigator.userAgentData && navigator.userAgentData.brands) {
    // Filter out any brand that contains "Not A" or variations of it.
    let brands = navigator.userAgentData.brands.filter(item => {
      const normalisedBrand = item.brand.toLowerCase().replace(/[\s;:-]/g, ""); // Normalize: lowercase & remove spaces/punctuation.
      return !normalisedBrand.includes("nota"); // More robust "Not A" check
    });

    if (brands.length === 0) {
      browserStr = "Unknown";
    } else {
      //Reverse the remaining brands
      brands = brands.reverse();

      //  Build the string, handling potential whitespace.
      browserStr = brands
        .map(item => {
          const cleanBrand = item.brand.trim(); // Remove leading/trailing whitespace from the brand name
          return `${cleanBrand} v${item.version}`;
        })
        .join(" - ");
    }

  } else {
    browserStr = "Unkown";
  }

  return browserStr;
}

// Extracts a friendlier operating system name.
function getOperatingSystem() {
  let os = "";
  if (navigator.userAgentData && navigator.userAgentData.platform) {
    os = navigator.userAgentData.platform;
  } else {
    const platform = navigator.platform.toLowerCase();
    if (platform.indexOf("win") > -1) {
      os = "Windows";
    } else if (platform.indexOf("mac") > -1) {
      os = "macOS";
    } else if (platform.indexOf("linux") > -1) {
      os = "Linux";
    } else {
      os = navigator.platform;
    }
  }
  return os;
}

//////////////////////////
// Main Scan Code
//////////////////////////

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("scanButton").addEventListener("click", function () {
    const scanButton = document.getElementById("scanButton");
    scanButton.disabled = true;

    const scanLine = document.querySelector(".scan-line");
    const staticYellowBlips = document.querySelectorAll(".scan-blip");
    const staticRedTargets = document.querySelectorAll(".scan-target");
    const scanAnimation = document.getElementById("scanAnimation");

    // Reset static blips and targets
    scanLine.classList.remove("scan-line-move");
    staticYellowBlips.forEach((blip) => {
      blip.classList.remove("blip-appear");
      blip.style.left = "";
      blip.style.top = "";
    });
    staticRedTargets.forEach((target) => {
      target.classList.remove("target-pulse");
    });

    // Remove any previous dynamic blips
    const extras = scanAnimation.querySelectorAll(".dynamic-blip");
    extras.forEach((extra) => extra.remove());

    // Force reflow for resetting animations
    void scanLine.offsetWidth;
    staticYellowBlips.forEach((blip) => void blip.offsetWidth);
    staticRedTargets.forEach((target) => void target.offsetWidth);

    scanLine.classList.add("scan-line-move");

    const totalScanTime = 8000; // total duration in milliseconds
    const startTime = Date.now();

    // Static Yellow Blips
    let yellowDelays = [];
    staticYellowBlips.forEach(() => {
      yellowDelays.push(Math.random() * totalScanTime);
    });
    yellowDelays.sort((a, b) => a - b);
    staticYellowBlips.forEach((blip, index) => {
      setTimeout(() => {
        const containerWidth = scanAnimation.clientWidth;
        const containerHeight = scanAnimation.clientHeight;
        const posX = Math.floor(Math.random() * (containerWidth - 8));
        const posY = Math.floor(Math.random() * (containerHeight - 8));
        blip.style.left = posX + "px";
        blip.style.top = posY + "px";
        blip.classList.add("blip-appear");
      }, yellowDelays[index]);
    });

    // Static Red Blips (Targets)
    const containerWidth = scanAnimation.clientWidth;
    staticRedTargets.forEach((target) => {
      const targetRect = target.getBoundingClientRect();
      const containerRect = scanAnimation.getBoundingClientRect();
      const relativeX = targetRect.left - containerRect.left;
      const delay = (relativeX / containerWidth) * totalScanTime;
      setTimeout(() => {
        target.classList.add("target-pulse");
      }, delay);
    });

    // Dynamically create extra Yellow Blips
    const yellowExtraInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed < totalScanTime) {
        const extraBlip = document.createElement("div");
        extraBlip.classList.add("scan-blip", "dynamic-blip");
        const containerWidth = scanAnimation.clientWidth;
        const containerHeight = scanAnimation.clientHeight;
        const posX = Math.floor(Math.random() * (containerWidth - 8));
        const posY = Math.floor(Math.random() * (containerHeight - 8));
        extraBlip.style.left = posX + "px";
        extraBlip.style.top = posY + "px";
        scanAnimation.appendChild(extraBlip);
        extraBlip.classList.add("blip-appear");
        setTimeout(() => {
          extraBlip.remove();
        }, 1000);
      } else {
        clearInterval(yellowExtraInterval);
      }
    }, 300);

    // Dynamically create extra Red Blips
    const redExtraInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed < totalScanTime) {
        const containerWidth = scanAnimation.clientWidth;
        const containerHeight = scanAnimation.clientHeight;
        const posX = Math.floor(Math.random() * (containerWidth - 15));
        const posY = Math.floor(Math.random() * (containerHeight - 15));
        const delay = (posX / containerWidth) * totalScanTime;
        if (elapsed + delay < totalScanTime) {
          const extraRed = document.createElement("div");
          extraRed.classList.add("scan-target", "dynamic-blip");
          extraRed.style.left = posX + "px";
          extraRed.style.top = posY + "px";
          scanAnimation.appendChild(extraRed);
          setTimeout(() => {
            extraRed.classList.add("target-pulse");
          }, delay);
          setTimeout(() => {
            extraRed.remove();
          }, 2000);
        }
      } else {
        clearInterval(redExtraInterval);
      }
    }, 500);

    // Play sound effect
    const audio = new Audio("scan-sound.mp3");
    audio.play();

    // Fetch and display scan data
    fetch("https://api.ipify.org?format=json")
      .then((response) => response.json())
      .then(async (data) => {
        const ipAddress = data.ip;
        const browserInfo = getBrowserInfo();
        const operatingSystem = getOperatingSystem();
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const screenResolution = `${window.screen.width}x${window.screen.height}`;

        // NEW: Device Memory (in GB, if available)
        const deviceMemory = navigator.deviceMemory ? navigator.deviceMemory + " GB" : "Not available";

        // NEW: Battery Status
        const batteryStatus = await getBatteryStatus();
        let batteryInfo = "";
        if (batteryStatus) {
          batteryInfo = `Battery: Level ${Math.round(batteryStatus.level * 100)}% ${batteryStatus.charging ? "(Charging)" : "(Not charging)"}`;
        } else {
          batteryInfo = "Battery: Not available";
        }

        // NEW: Graphics Information
        const graphicsInfo = getGraphicsInfo();
        let graphicsStr = "";
        if (graphicsInfo) {
          graphicsStr = `Graphics: ${graphicsInfo.vendor} - ${graphicsInfo.renderer}`;
        } else {
          graphicsStr = "Graphics: Not available";
        }

        // Build the scan results array:
        const scanData = [
          `IP Address: ${ipAddress}`,
          `Browser: ${browserInfo}`,
          `Time Zone: ${timeZone}`,
          `Screen Resolution: ${screenResolution}`,
          `Operating System: ${operatingSystem}`,
          `Device Memory: ${deviceMemory}`,
          batteryInfo,
          graphicsStr
        ];

        // Output the scanData in the scanResults div with a delay between each line
        const scanResultsDiv = document.getElementById("scanResults");
        scanResultsDiv.innerHTML = "";
        scanData.forEach((item, index) => {
          setTimeout(() => {
            const p = document.createElement("p");
            p.textContent = item;
            p.classList.add("visible");
            scanResultsDiv.appendChild(p);
          }, index * 1000);
        });
        setTimeout(() => {
          scanButton.disabled = false;
        }, totalScanTime);
      })
      .catch((error) => {
        console.error("Error fetching IP address:", error);
        const scanResultsDiv = document.getElementById("scanResults");
        scanResultsDiv.innerHTML = "<p>Error: Could not retrieve IP address.</p>";
        setTimeout(() => {
          scanButton.disabled = false;
        }, totalScanTime);
      });
  });
});
