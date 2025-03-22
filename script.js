// Helper function to extract the browser information
function getBrowserInfo() {
    let browserStr = "";
    if (navigator.userAgentData && navigator.userAgentData.brands) {
      // Filter out entries like "Not A(Brand"
      let brands = navigator.userAgentData.brands.filter(item => !item.brand.includes("Not A"));
      // Reverse the order if desired (sample output shows OperaGX first then Chromium)
      brands = brands.reverse();
      // Map the brands to a friendly format, removing spaces from names (e.g., "Opera GX" becomes "OperaGX")
      browserStr = brands
        .map(item => `${item.brand.replace(/\s+/g, '')} v${item.version}`)
        .join(" - ");
    } else {
      // Fallback using navigator.userAgent with a crude detection
      const ua = navigator.userAgent;
      let browserName = "";
      let version = "";
      if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) {
        browserName = "Opera";
        let res = ua.match(/(?:Opera|OPR)\/(\d+)/);
        version = res ? res[1] : "";
      } else if (ua.indexOf("Chrome") > -1) {
        browserName = "Chrome";
        let res = ua.match(/Chrome\/(\d+)/);
        version = res ? res[1] : "";
      } else if (ua.indexOf("Safari") > -1) {
        browserName = "Safari";
        let res = ua.match(/Version\/(\d+)/);
        version = res ? res[1] : "";
      } else if (ua.indexOf("Firefox") > -1) {
        browserName = "Firefox";
        let res = ua.match(/Firefox\/(\d+)/);
        version = res ? res[1] : "";
      } else {
        browserName = "Unknown";
        version = "";
      }
      browserStr = `${browserName} v${version}`;
    }
    return browserStr;
  }
  
  // Helper function to extract a friendlier operating system name
  function getOperatingSystem() {
    let os = "";
    if (navigator.userAgentData && navigator.userAgentData.platform) {
      // Use userAgentData's platform if available
      os = navigator.userAgentData.platform;
    } else {
      // Fallback: map navigator.platform to a cleaner OS name
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
  
      const totalScanTime = 8000; // 8 seconds total duration
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
  
      // Static Red Blips
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
  
      // Dynamically Create Extra Yellow Blips
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
  
      // Dynamically Create Extra Red Blips
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
        .then((data) => {
          const ipAddress = data.ip;
  
          // Get just the browser details using getBrowserInfo(), e.g., "OperaGX v117 - Chromium v132"
          const browserInfo = getBrowserInfo();
          // Get the friendly operating system string, e.g., "Windows"
          const operatingSystem = getOperatingSystem();
  
          const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const screenResolution = `${window.screen.width}x${window.screen.height}`;
  
          const scanData = [
            `IP Address: ${ipAddress}`,
            `Browser: ${browserInfo}`,
            `Time Zone: ${timeZone}`,
            `Screen Resolution: ${screenResolution}`,
            `Operating System: ${operatingSystem}`
          ];
  
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
