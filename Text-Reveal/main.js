// Import GSAP and ScrollTrigger from Skypack (CDN for ES modules)
import { gsap } from "https://cdn.skypack.dev/gsap";
// Import ScrollTrigger plugin for scroll-based animations
import { ScrollTrigger } from "https://cdn.skypack.dev/gsap/ScrollTrigger";
// Import Lenis for smooth scrolling
import Lenis from "https://unpkg.com/lenis@1.3.8/dist/lenis.mjs";

// Register ScrollTrigger with GSAP to enable its functionality
gsap.registerPlugin(ScrollTrigger);

// Wait for the DOM to load before running the code
document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lenis for smooth scrolling
  const lenis = new Lenis();
  // Update ScrollTrigger when Lenis scrolls to sync animations
  lenis.on("scroll", ScrollTrigger.update);
  // Use GSAP's ticker for smooth animation updates with Lenis
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000); // Convert GSAP time to milliseconds for Lenis
  });
  // Disable lag smoothing for responsive animations
  gsap.ticker.lagSmoothing(0);

  // List of keywords to highlight with special styling
  const keywords = [
    "vibrant",
    "living",
    "clarity",
    "expression",
    "shape",
    "intuitive",
    "storytelling",
    "interactive",
    "vision",
  ];

  // Select all <p> elements inside .anime-text containers
  const animeTextParagraphs = document.querySelectorAll(".anime-text p");

  // Split each paragraph into words and wrap them in <div> and <span> for animation
  animeTextParagraphs.forEach((paragraph) => {
    const text = paragraph.textContent; // Get paragraph text
    const words = text.split(/\s+/).filter((word) => word.trim()); // Split into words, remove empty
    paragraph.innerHTML = ""; // Clear original text

    // Create a <div class="word"> for each word, with a <span> inside
    words.forEach((word) => {
      const wordContainer = document.createElement("div");
      wordContainer.className = "word"; // Add 'word' class for styling

      const wordText = document.createElement("span");
      wordText.textContent = word; // Set word text

      // Check if the word is a keyword (case-insensitive, ignoring punctuation)
      const normalizedWord = word.toLowerCase().replace(/[.,!?;:"]/g, "");
      if (keywords.includes(normalizedWord)) {
        wordContainer.classList.add("keyword-wrapper"); // Add class for keyword styling
        wordText.classList.add("keyword", normalizedWord); // Add keyword and specific word class
      }

      wordContainer.appendChild(wordText); // Add span to div
      paragraph.appendChild(wordContainer); // Add div to paragraph
    });
  });

  // Select all .anime-text-container sections (about, features)
  const animeTextContainers = document.querySelectorAll(
    ".anime-text-container"
  );

  // Create a ScrollTrigger for each container to animate words on scroll
  animeTextContainers.forEach((container) => {
    const words = container.querySelectorAll(".anime-text .word"); // Get all words
    const totalWords = words.length; // Total number of words

    ScrollTrigger.create({
      trigger: container, // Element that triggers the animation
      pin: true, // Pin the container to the top while scrolling
      start: "top top", // Start when container top hits viewport top
      end: `+=${window.innerHeight * 2}`, // End after scrolling 2x viewport height
      pinSpacing: true, // Add space so next section doesn’t overlap
      onUpdate: (self) => {
        const progress = self.progress; // Scroll progress (0 to 1)

        // Animate each word based on scroll progress
        words.forEach((word, index) => {
          const wordText = word.querySelector("span"); // Get the <span> inside word
          // Calculate when this word should start and end animating
          const wordStart = index / totalWords;
          const wordEnd = (index + 1) / totalWords;
          // Normalize progress for this word (0 to 1)
          const wordProgress = gsap.utils.clamp(
            0,
            1,
            (progress - wordStart) / (wordEnd - wordStart)
          );

          // Set word opacity (fades in from 0 to 1)
          word.style.opacity = wordProgress;

          // Set background opacity (fades in, then out after 90% progress)
          const backgroundOpacity =
            wordProgress < 0.9 ? wordProgress : 1 - (wordProgress - 0.9) / 0.1;
          word.style.backgroundColor = `rgba(60, 60, 60, ${backgroundOpacity})`;

          // Set text opacity (fades in with word)
          wordText.style.opacity = wordProgress;
        });
      },
    });
  });
});
