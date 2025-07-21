// import gsap from "gsap";
// import SplitText from "gsap/SplitText";

// gsap.registerPlugin(SplitText);

document.addEventListener("DOMContentLoaded", () => {
  const profileImagesContainer = document.querySelector(".profile-images");
  const profileImages = document.querySelectorAll(".profile-images .img");
  const nameElem = document.querySelectorAll(".profile-names .name");
  const cursor = document.querySelector("#cursor");
  const nameHeadings = document.querySelectorAll(".profile-names .name h1");

  nameHeadings.forEach((heading) => {
    const split = new SplitText(heading, { type: "chars" });
    split.chars.forEach((char) => {
      char.classList.add("letter");
    });
  });

  const defaultLetters = nameElem[0].querySelectorAll(".letter");
  gsap.set(defaultLetters, { y: "100%" });

  if (window.innerWidth > 900) {
    profileImages.forEach((img, index) => {
      const correspondingName = nameElem[index + 1];
      const letters = correspondingName.querySelectorAll(".letter");

      img.addEventListener("mousemove", (e) => {
        gsap.to(img, {
          width: 140,
          height: 140,
          duration: 0.5,
          ease: "power4.out",
        });

        gsap.to(letters, {
          y: "-100%",
          ease: "power4.out",
          duration: 0.75,
          stagger: {
            each: 0.025,
            from: "center",
          },
        });

        gsap.to(cursor, {
          opacity: 1,
          scale: 1,
          y: e.clientY,
          x: e.clientX,
          duration: 0.75,
          ease: "back.out",
        });
      });

      img.addEventListener("mouseleave", (e) => {
        gsap.to(img, {
          width: 70,
          height: 70,
          duration: 0.5,
          ease: "power4.out",
        });

        gsap.to(letters, {
          y: "0%",
          ease: "power4.out",
          duration: 0.75,
          stagger: {
            each: 0.025,
            from: "center",
          },
        });

        gsap.to(cursor, {
          opacity: 0,
          scale: 0,
          y: e.clientY,
          x: e.clientX,
          duration: 0.75,
          ease: "back.out",
        });
      });
    });

    profileImagesContainer.addEventListener("mouseenter", (e) => {
      gsap.to(defaultLetters, {
        y: "0%",
        ease: "power4.out",
        duration: 0.75,
        stagger: {
          each: 0.025,
          from: "center",
        },
      });
    });
    profileImagesContainer.addEventListener("mouseleave", () => {
      gsap.to(defaultLetters, {
        y: "100%",
        ease: "power4.out",
        duration: 0.75,
        stagger: {
          each: 0.025,
          from: "center",
        },
      });
    });
  }
});
