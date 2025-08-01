document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(CustomEase, SplitText);
  //   console.log(CustomEase, SplitText);
  CustomEase.create("hop", ".87, 0, .13, 1");

  const lenis = new Lenis();
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  const textContainers = document.querySelectorAll(".menu-col");
  console.log([...textContainers]);
  let splitTextByContainer = [];

  textContainers.forEach((container) => {
    console.log(container);
    const textElements = container.querySelectorAll("a, p");
    console.log(textElements);
    let containerSplits = [];

    textElements.forEach((element) => {
      const split = SplitText.create(element, {
        type: "lines",
        // mask: "lines",
        linesClass: "line",
      });
      containerSplits.push(split);

      gsap.set(split.lines, { y: "-110%" });
      console.log(containerSplits);
    });

    splitTextByContainer.push(containerSplits);
    console.log(splitTextByContainer);
  });

  const container = document.querySelector(".container");
  const menuToggleBtn = document.querySelector(".menu-toggle-btn");
  const menuOverlay = document.querySelector(".menu-overlay");
  const menuOverlayContainer = document.querySelector(".menu-overlay-content");
  const menuMediaWrapper = document.querySelector(".menu-media-wrapper");
  const copyContainers = document.querySelectorAll(".menu-col");
  const menuToggleLabel = document.querySelector(".menu-toggle-label p");
  const hamburgerIcon = document.querySelector(".menu-hamburger-icon");
  if (!menuToggleLabel) {
    console.error(
      "menuToggleLabel not found. Check the selector or DOM structure."
    );
    return; // Stop execution if critical element is missing
  }
  console.log(
    container,
    menuToggleBtn,
    menuOverlay,
    menuOverlayContainer,
    menuMediaWrapper,
    copyContainers,
    menuToggleLabel,
    hamburgerIcon
  );

  let isMenuOpen = false;
  let isAnimating = false;

  menuToggleBtn.addEventListener("click", () => {
    if (isAnimating) return;

    if (!isMenuOpen) {
      isAnimating = true;

      lenis.stop();

      const tl = gsap.timeline();

      tl.to(menuToggleLabel, {
        y: "-110%",
        duration: 1,
        ease: "hop",
      })
        .to(
          container,
          {
            y: "100svh",
            duration: 1,
            ease: "hop",
          },
          "<"
        )
        .to(
          menuOverlay,
          {
            // clipPath: "polygon(0% 0% , 100% 0%, 100%, 100%, 0% 100%)",
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 1,
            ease: "hop",
          },
          "<"
        )
        .to(
          menuOverlayContainer,
          {
            yPercent: 0,
            duration: 1,
            ease: "hop",
          },
          "<"
        )
        .to(
          menuMediaWrapper,
          {
            opacity: 1,
            duration: 0.75,
            ease: "power2.out",
            delay: 0.5,
          },
          "<"
        );

      splitTextByContainer.forEach((containerSplits) => {
        const copyLines = containerSplits.flatMap((split) => split.lines);

        tl.to(
          copyLines,
          {
            y: "0%",
            duration: 2,
            ease: "hop",
            stagger: -0.075,
          },
          -0.15
        );
      });

      hamburgerIcon.classList.add("active");

      tl.call(() => {
        isAnimating = false;
      });

      isMenuOpen = true;
    } else {
      isAnimating = true;

      hamburgerIcon.classList.remove("active");
      const tl = gsap.timeline();

      tl.to(container, {
        y: "0svh",
        duration: 1,
        ease: "hop",
      })
        .to(
          menuOverlay,
          {
            // polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
            duration: 1,
            ease: "hop",
          },
          "<"
        )
        .to(
          menuOverlayContainer,
          {
            yPercent: -50,
            duration: 1,
            ease: "hop",
          },
          "<"
        )
        .to(
          menuToggleLabel,
          {
            y: "0%",
            duration: 1,
            ease: "hop",
          },
          "<"
        )
        .to(
          copyContainers,
          {
            opacity: 0.25,
            duration: 1,
            ease: "hop",
          },
          "<"
        );

      tl.call(() => {
        splitTextByContainer.forEach((containerSplits) => {
          const copyLines = containerSplits.flatMap((split) => split.lines);

          gsap.set(copyLines, { y: "-110%" });
        });
        gsap.set(copyContainers, { opacity: 1 });
        gsap.set(menuMediaWrapper, { opacity: 0 });

        isAnimating = false;
        lenis.start();
      });

      isMenuOpen = false;
    }
  });
});
