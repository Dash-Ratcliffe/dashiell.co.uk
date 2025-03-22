document.getElementById("scanButton").addEventListener("click", function () {
    const scanButton = document.getElementById("scanButton");
    scanButton.disabled = true;
  
    // Get elements for animation
    const scanLine = document.querySelector(".scan-line");
    const staticYellowBlips = document.querySelectorAll(".scan-blip"); // existing yellow blips from HTML
    const staticRedTargets = document.querySelectorAll(".scan-target"); // existing red targets from HTML
    const scanAnimation = document.getElementById("scanAnimation");
  
    // Reset: Remove previous animation classes and inline styles from static blips
    scanLine.classList.remove("scan-line-move");
    staticYellowBlips.forEach((blip) => {
      blip.classList.remove("blip-appear");
      blip.style.left = "";
      blip.style.top = "";
    });
    staticRedTargets.forEach((target) => {
      target.classList.remove("target-pulse");
    });
  
    // Remove any extra dynamic blips from previous scans (if any)
    const extras = scanAnimation.querySelectorAll(".dynamic-blip");
    extras.forEach((extra) => extra.remove());
  
    // Force reflow so changes take effect
    void scanLine.offsetWidth;
    staticYellowBlips.forEach((blip) => void blip.offsetWidth);
    staticRedTargets.forEach((target) => void target.offsetWidth);
  
    // Start the scan line animation
    scanLine.classList.add("scan-line-move");
  
    const totalScanTime = 8000; // Updated total animation duration (8 seconds)
    const startTime = Date.now();
  
    // ===== Trigger Static Yellow Blips (scan-blip) =====
    let yellowDelays = [];
    staticYellowBlips.forEach(() => {
      yellowDelays.push(Math.random() * totalScanTime);
    });
    yellowDelays.sort((a, b) => a - b);
  
    staticYellowBlips.forEach((blip, index) => {
      setTimeout(() => {
        // Position the static yellow blip at a random location inside the container
        const containerWidth = scanAnimation.clientWidth;
        const containerHeight = scanAnimation.clientHeight;
        const posX = Math.floor(Math.random() * (containerWidth - 8));
        const posY = Math.floor(Math.random() * (containerHeight - 8));
        blip.style.left = posX + "px";
        blip.style.top = posY + "px";
  
        // Trigger the flash animation
        blip.classList.add("blip-appear");
      }, yellowDelays[index]);
    });
  
    // ===== Trigger Static Red Blips (scan-target) =====
    const containerWidth = scanAnimation.clientWidth;
    staticRedTargets.forEach((target) => {
      const targetRect = target.getBoundingClientRect();
      const containerRect = scanAnimation.getBoundingClientRect();
      const relativeX = targetRect.left - containerRect.left; // distance from left edge of container
      const delay = (relativeX / containerWidth) * totalScanTime;
      setTimeout(() => {
        target.classList.add("target-pulse");
      }, delay);
    });
  
    // ===== Dynamically Create Extra Yellow Blips =====
    const yellowExtraInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed < totalScanTime) {
        // Create a new yellow blip (dynamic)
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
        // Remove the extra yellow blip after its flash animation finishes (approx. 1s)
        setTimeout(() => {
          extraBlip.remove();
        }, 1000);
      } else {
        clearInterval(yellowExtraInterval);
      }
    }, 300); // creates an extra yellow blip every 300ms
  
    // ===== Dynamically Create Extra Red Blips =====
    const redExtraInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed < totalScanTime) {
        const containerWidth = scanAnimation.clientWidth;
        const containerHeight = scanAnimation.clientHeight;
        const posX = Math.floor(Math.random() * (containerWidth - 15));
        const posY = Math.floor(Math.random() * (containerHeight - 15));
        
        // Calculate the delay according to horizontal position
        const delay = (posX / containerWidth) * totalScanTime;
        // Only schedule if this extra red would appear before the animation ends.
        if (elapsed + delay < totalScanTime) {
          const extraRed = document.createElement("div");
          extraRed.classList.add("scan-target", "dynamic-blip");
          extraRed.style.left = posX + "px";
          extraRed.style.top = posY + "px";
          scanAnimation.appendChild(extraRed);
    
          setTimeout(() => {
            extraRed.classList.add("target-pulse");
          }, delay);
    
          // Remove the extra red blip after its pulse animation completes (~2s)
          setTimeout(() => {
            extraRed.remove();
          }, 2000);
        }
      } else {
        clearInterval(redExtraInterval);
      }
    }, 500); // creates an extra red blip every 500ms
  
    // Play the sound effect (ensure 'scan-sound.mp3' exists in the correct path)
    const audio = new Audio("scan-sound.mp3");
    audio.play();
  
    // Fetch IP address and other info, then display with staggered timing.
    fetch("https://api.ipify.org?format=json")
      .then((response) => response.json())
      .then((data) => {
        const ipAddress = data.ip;
        const browser = navigator.userAgent;
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const screenResolution = `${window.screen.width}x${window.screen.height}`;
        const operatingSystem = navigator.platform;
    
        const scanData = [
          `IP Address: ${ipAddress}`,
          `Browser: ${browser}`,
          `Time Zone: ${timeZone}`,
          `Screen Resolution: ${screenResolution}`,
          `Operating System: ${operatingSystem}`
        ];
    
        const scanResultsDiv = document.getElementById("scanResults");
        scanResultsDiv.innerHTML = ""; // Clear previous results
    
        // Increase delay multiplier for output info to better match the 8-second scan duration.
        scanData.forEach((item, index) => {
          setTimeout(() => {
            const p = document.createElement("p");
            p.textContent = item;
            p.classList.add("visible");
            scanResultsDiv.appendChild(p);
          }, index * 1000);
        });
    
        // Re-enable the button once the scan is complete.
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
