// Emil Kowalski Motion Crafting Configuration

export const EASINGS = {
  materialEntrance: [0.16, 1, 0.3, 1],
  subtleOvershoot: [0.34, 1.56, 0.64, 1],
  gentleDeceleration: [0.25, 1, 0.5, 1],
};

export const VIEWPORT_CONFIG = {
  once: true,
  margin: "-10% 0px",
};

export const containerStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
      ease: EASINGS.gentleDeceleration,
    },
  },
};

export const itemFadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: EASINGS.materialEntrance,
    },
  },
};

export const interactiveHover = {
  scale: 1.03,
  transition: {
    duration: 0.25,
    ease: EASINGS.subtleOvershoot,
  },
};

export const interactiveTap = {
  scale: 0.97,
  transition: {
    duration: 0.1,
    ease: EASINGS.gentleDeceleration,
  },
};
