---
name: learn-words-ai-images
description: Guideline for creating new scenarios in the LunatheCat platform.
---

# New Scenarios Rule

When the user asks to create a NEW scenario for the platform, the "Learn Words" module (Sequential Flashcards or Vocabulary Grid) should not rely only on emojis. 

Instead, you MUST use the `generate_image` tool to create context-appropriate AI images for each vocabulary word.
These images should be saved in the `images/` folder and linked appropriately in the `vocabulary` array of the new scenario.

**Note:** This rule applies ONLY to newly created scenarios, do NOT modify the existing scenarios unless the user explicitly requests it.
