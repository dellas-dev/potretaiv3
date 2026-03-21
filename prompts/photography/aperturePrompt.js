// aperturePrompt.js — Aperture prompt strings by category
// Source: PromptBuilder inline strings in app.html (lines 1720, 1735, 1748, 1771, 1782)
// Note: Aperture is not a dropdown in app.html — it is hardcoded per category in PromptBuilder.
// This file documents the fixed aperture values used per category for reference and reuse.

export const aperturePrompt = {

  prewedding: {
    // Used in PromptBuilder.buildPrewedding (line 1720)
    default: "f/1.4 shallow depth of field",
  },

  wedding: {
    // Used in PromptBuilder.buildWedding (line 1735)
    default: "85mm f/1.4",
  },

  engagement: {
    // Used in PromptBuilder.buildEngagement (line 1748)
    default: "85mm f/1.4",
  },

  studio: {
    // Used in PromptBuilder.buildStudio (line 1771)
    default: "85mm f/1.4",
  },

  family: {
    // Used in PromptBuilder.buildFamily (line 1782)
    default: "50mm f/2.0, f/2.8 group portrait clarity",
  },

};
