// Import the image data (an array of objects with titles and image paths) from a local file.
import collection from "./collection.js";

// Wait for the HTML document to be fully loaded and parsed before running the script.
document.addEventListener("DOMContentLoaded", () => {
  // --- DOM ELEMENT SELECTORS ---
  // Select the main container for the individual image cards.
  const gallery = document.querySelector(".gallery");
  // Select the parent container that will have the 3D perspective and parallax effect applied.
  const galleryContainer = document.querySelector(".gallery-container");
  // Select the container where the title of the active card will be displayed.
  const titleContainer = document.querySelector(".title-container");

  // --- STATE MANAGEMENT ---
  // Array to hold all the card DOM elements for easy access.
  const cards = [];
  // Array to hold the animation state for each card (e.g., rotation, position, scale).
  const transformState = [];

  // Variables to track the current state of the gallery.
  let currentTitle = null; // Holds the DOM element of the currently displayed title.
  let isPreviewActive = false; // Flag to check if a card is in the zoomed-in "preview" mode.
  let isTransitioning = false; // Flag to prevent interactions while an animation is running.

  // --- CONFIGURATION OBJECT ---
  // A central place for "magic numbers" to easily tweak the gallery's behavior.
  const config = {
    imgCount: 25, // Total number of cards to create.
    radius: 275, // The radius of the circular gallery layout.
    sensitivity: 500, // Mouse distance from a card to trigger the hover effect.
    effectFalloff: 250, // How quickly the hover effect diminishes with distance.
    cardMoveAmount: 50, // How far a card moves outwards on hover.
    lerpFactor: 0.15, // The speed of the smooth "lerp" animations (lower is smoother/slower).
    isMobile: window.innerWidth < 1000, // A flag to check if the user is on a mobile-sized screen.
  };

  // --- PARALLAX STATE OBJECT ---
  // Stores the target and current rotation values for the main gallery's parallax effect.
  const parallaxState = {
    targetX: 0,
    targetY: 0,
    targetZ: 0,
    currentX: 0,
    currentY: 0,
    currentZ: 0,
  };

  // --- GALLERY CREATION LOOP ---
  // This loop dynamically creates the cards and positions them in a circle.
  for (let i = 0; i < config.imgCount; i++) {
    // Calculate the angle for each card to distribute them evenly around a circle.
    // Math.PI * 2 is a full circle in radians.
    const angle = (i / config.imgCount) * Math.PI * 2;

    // Use trigonometry (cosine and sine) to calculate the x and y coordinates on the circle.
    const x = config.radius * Math.cos(angle);
    const y = config.radius * Math.sin(angle);

    // Use the modulo operator (%) to loop through the imported `collection` data
    // if `imgCount` is greater than the number of available images.
    const cardIndex = i % 20;

    // Create the card element.
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.index = i; // Store the unique index.
    card.dataset.title = collection[cardIndex].title; // Store the title.

    // Create the image element and set its source.
    const img = document.createElement("img");
    img.src = collection[cardIndex].img;
    card.appendChild(img);

    // Use GSAP's `set` method to instantly apply the initial transformations.
    // This is more performant than setting CSS properties directly in a loop.
    gsap.set(card, {
      x, // Position horizontally.
      y, // Position vertically.
      rotation: (angle * 180) / Math.PI + 90, // Rotate the card to face outwards from the center.
      transformPerspective: 800, // Adds depth for 3D rotations.
      transformOrigin: "center center", // Sets the point around which transformations occur.
    });

    // Add the newly created card to the DOM and our state arrays.
    gallery.appendChild(card);
    cards.push(card);
    transformState.push({
      currentRotation: 0,
      targetRotation: 0,
      currentX: 0,
      targetX: 0,
      currentY: 0,
      targetY: 0,
      currentScale: 1,
      targetScale: 1,
      angle, // Store the original angle for later use.
    });

    // Add a click event listener to each card to trigger the preview mode.
    card.addEventListener("click", (e) => {
      // Only allow clicking if not already in preview and not currently animating.
      if (!isPreviewActive && !isTransitioning) {
        togglePreview(parseInt(card.dataset.index));
        e.stopPropagation(); // Prevents the click from bubbling up to the document listener.
      }
    });
  }

  // --- FUNCTION to enter PREVIEW MODE ---
  function togglePreview(index) {
    // Set state flags to indicate we are entering preview and an animation is starting.
    isPreviewActive = true;
    isTransitioning = true;

    // Get the angle of the clicked card.
    const angle = transformState[index].angle;
    // Define the target position for the clicked card (top of the circle).
    const targetPosition = (Math.PI * 3) / 2;

    // Calculate the shortest rotation needed to move the clicked card to the target position.
    let rotationRadians = targetPosition - angle;
    if (rotationRadians > Math.PI) rotationRadians -= Math.PI * 2;
    else if (rotationRadians < -Math.PI) rotationRadians += Math.PI * 2;

    // Reset any active hover effects on all cards before starting the main animation.
    transformState.forEach((state) => {
      state.currentRotation = state.targetRotation = 0;
      state.currentScale = state.targetScale = 1;
      state.currentX = state.targetX = state.currentY = state.targetY = 0;
    });

    // Main GSAP animation for the entire gallery.
    gsap.to(gallery, {
      onStart: () => {
        // As the main animation starts, ensure individual cards are in their default state.
        cards.forEach((card, i) => {
          gsap.to(card, {
            x: config.radius * Math.cos(transformState[i].angle),
            y: config.radius * Math.sin(transformState[i].angle),
            rotationY: 0,
            scale: 1,
            duration: 1.25,
            ease: "power4.out",
          });
        });
      },
      scale: 5, // Zoom into the gallery.
      y: 1300, // Move it down.
      rotation: (rotationRadians * 180) / Math.PI + 360, // Rotate the gallery to position the card.
      duration: 2,
      ease: "power4.inOut",
      onComplete: () => (isTransitioning = false), // Once done, set transitioning flag to false.
    });

    // Reset the main parallax effect smoothly.
    gsap.to(parallaxState, {
      currentX: 0,
      currentY: 0,
      currentZ: 0,
      duration: 0.5,
      ease: "power2.out",
      onUpdate: () => {
        // During the animation, update the gallery container's rotation.
        gsap.set(galleryContainer, {
          rotateX: parallaxState.currentX,
          rotateY: parallaxState.currentY,
          rotateZ: parallaxState.currentZ,
          transformOrigin: "center center",
        });
      },
    });

    // --- TITLE ANIMATION ---
    const titleText = cards[index].dataset.title;
    const p = document.createElement("p");
    p.textContent = titleText;
    titleContainer.appendChild(p);
    currentTitle = p;

    // Use GSAP's SplitText plugin to break the title into words for a staggered animation.
    const splitText = new SplitText(p, { type: "words", wordsClass: "word" });
    const words = splitText.words;

    // Animate the words into view from below.
    gsap.set(words, { y: "125%" });
    gsap.to(words, {
      y: "0%",
      duration: 0.75,
      delay: 1.25, // Delay to sync with the main gallery animation.
      stagger: 0.1, // Animate each word one after another.
      ease: "power4.out",
    });
  }

  // --- FUNCTION to exit PREVIEW MODE ---
  function resetGallery() {
    // Prevent action if an animation is already in progress.
    if (isTransitioning) return;
    isTransitioning = true;

    // Animate the title out if it exists.
    if (currentTitle) {
      const words = currentTitle.querySelectorAll(".word");
      gsap.to(words, {
        y: "-125%",
        duration: 0.75,
        delay: 0.5,
        stagger: 0.1,
        ease: "power4.out",
        onComplete: () => {
          // Remove the title element from the DOM after it animates out.
          currentTitle.remove();
          currentTitle = null;
        },
      });
    }

    // Determine the correct scale for the gallery based on the current viewport width.
    const viewportWidth = window.innerWidth;
    let galleryScale = 1;
    if (viewportWidth < 768) galleryScale = 0.6;
    else if (viewportWidth < 1200) galleryScale = 0.8;

    // Animate the gallery back to its original position and scale.
    gsap.to(gallery, {
      scale: galleryScale,
      y: 0,
      x: 0,
      rotation: 0,
      duration: 2.5,
      ease: "power4.inOut",
      onComplete: () => {
        // Reset all state flags and parallax values once the animation is complete.
        isPreviewActive = isTransitioning = false;
        Object.assign(parallaxState, {
          targetX: 0,
          targetY: 0,
          targetZ: 0,
          currentX: 0,
          currentY: 0,
          currentZ: 0,
        });
      },
    });
  }

  // --- FUNCTION to handle WINDOW RESIZE ---
  function handleResize() {
    const viewportWidth = window.innerWidth;
    config.isMobile = viewportWidth < 1000;

    // Determine the correct responsive scale.
    let galleryScale = 1;
    if (viewportWidth < 768) galleryScale = 0.6;
    else if (viewportWidth < 1200) galleryScale = 0.8;

    // Instantly set the gallery scale.
    gsap.set(gallery, { scale: galleryScale });

    // If not in preview mode, reset all animation states to their defaults.
    if (!isPreviewActive) {
      Object.assign(parallaxState, {
        targetX: 0,
        targetY: 0,
        targetZ: 0,
        currentX: 0,
        currentY: 0,
        currentZ: 0,
      });
      transformState.forEach((state) => {
        Object.assign(state, {
          targetRotation: 0,
          currentRotation: 0,
          targetScale: 1,
          currentScale: 1,
          targetX: 0,
          currentX: 0,
          targetY: 0,
          currentY: 0,
        });
      });
    }
  }

  // --- EVENT LISTENERS ---
  window.addEventListener("resize", handleResize);
  handleResize(); // Call it once on load to set the initial size.

  // Clicking anywhere on the document (background) while in preview will reset the gallery.
  document.addEventListener("click", () => {
    if (isPreviewActive && !isTransitioning) resetGallery();
  });

  // Main mouse move listener for parallax and hover effects.
  document.addEventListener("mousemove", (e) => {
    // Ignore if in preview, transitioning, or on mobile.
    if (isPreviewActive || isTransitioning || config.isMobile) return;

    // Calculate mouse position as a percentage from the center of the screen.
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const percentX = (e.clientX - centerX) / centerX;
    const percentY = (e.clientY - centerY) / centerY;

    // Update the target rotation for the main gallery parallax effect.
    parallaxState.targetY = percentX * 15;
    parallaxState.targetX = -percentY * 15;
    parallaxState.targetZ = (percentX + percentY) * 5;

    // Check each card for mouse proximity to trigger the hover effect.
    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);

      // If the mouse is close enough, calculate the effect strength.
      if (distance < config.sensitivity && !config.isMobile) {
        const flipFactor = Math.max(0, 1 - distance / config.effectFalloff);
        const angle = transformState[index].angle;
        const moveAmount = config.cardMoveAmount * flipFactor;

        // Set the target values for the card's animation.
        transformState[index].targetRotation = 180 * flipFactor; // Flip effect.
        transformState[index].targetScale = 1 + 0.3 * flipFactor; // Scale up.
        transformState[index].targetX = moveAmount * Math.cos(angle); // Move outwards.
        transformState[index].targetY = moveAmount * Math.sin(angle);
      } else {
        // If the mouse is not close, set targets back to the default state.
        transformState[index].targetRotation = 0;
        transformState[index].targetScale = 1;
        transformState[index].targetX = 0;
        transformState[index].targetY = 0;
      }
    });
  });

  // --- CORE ANIMATION LOOP ---
  function animate() {
    // This loop runs on every frame, creating smooth animations.
    // It only runs when not in preview mode to save performance.
    if (!isPreviewActive && !isTransitioning) {
      // --- LERP (Linear Interpolation) ---
      // Smoothly move the 'current' value towards the 'target' value by a small fraction each frame.
      // This creates the "floaty" and non-instant animation feel.
      parallaxState.currentX +=
        (parallaxState.targetX - parallaxState.currentX) * config.lerpFactor;
      parallaxState.currentY +=
        (parallaxState.targetY - parallaxState.currentY) * config.lerpFactor;
      parallaxState.currentZ +=
        (parallaxState.targetZ - parallaxState.currentZ) * config.lerpFactor;

      // Apply the interpolated parallax rotation to the gallery container.
      gsap.set(galleryContainer, {
        rotateX: parallaxState.currentX,
        rotateY: parallaxState.currentY,
        rotation: parallaxState.currentZ,
      });

      // Lerp each card's properties for the hover effect.
      cards.forEach((card, index) => {
        const state = transformState[index];
        state.currentRotation +=
          (state.targetRotation - state.currentRotation) * config.lerpFactor;
        state.currentScale +=
          (state.targetScale - state.currentScale) * config.lerpFactor;
        state.currentX += (state.targetX - state.currentX) * config.lerpFactor;
        state.currentY += (state.targetY - state.currentY) * config.lerpFactor;

        // Recalculate the base position on the circle.
        const angle = state.angle;
        const x = config.radius * Math.cos(angle);
        const y = config.radius * Math.sin(angle);

        // Apply all transformations: base position + hover position + rotations/scale.
        gsap.set(card, {
          x: x + state.currentX,
          y: y + state.currentY,
          rotationY: state.currentRotation,
          scale: state.currentScale,
          rotation: (angle * 180) / Math.PI + 90, // Keep the base rotation.
          transformPerspective: 1000,
        });
      });
    }
    // Request the next animation frame, creating an infinite loop.
    requestAnimationFrame(animate);
  }
  // Start the animation loop.
  animate();
});
