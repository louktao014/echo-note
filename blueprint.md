# EchoNote Application Blueprint

## Overview

EchoNote is a modern, real-time meeting transcription and summarization tool built with the latest features of Angular. It provides a seamless experience for capturing meeting discussions, generating concise summaries (Minutes of Meeting), and tracking action items.

---

## Phase 1: Foundational Modernization (Complete)

This initial phase focused on restructuring the application to align with the latest Angular best practices, ensuring a scalable, performant, and maintainable codebase.

### Features Implemented:

*   **Standalone Architecture**: All components (`App`, `MeetingPipelineComponent`, `TranscriptComponent`, `MomResultComponent`) are now standalone, eliminating the need for `NgModules`.
*   **OnPush Change Detection**: Every component uses `ChangeDetectionStrategy.OnPush` by default, optimizing performance by reducing unnecessary change detection cycles.
*   **Signal-Based State**: Component inputs have been refactored to use the new `input()` signal function, and outputs use the `output()` function for better reactivity and type safety.
*   **Modern Template Control Flow**: Replaced all instances of `*ngFor` with the new built-in `@for` block, including the mandatory `track` expression for optimized list rendering.

---

## Phase 2: Cafe / Minimal Redesign (Complete)

This phase focused on a complete visual overhaul of the application, establishing a sophisticated and consistent "Cafe / Minimal" aesthetic.

### Style & Design Implemented:

*   **Global Color Palette**: A centralized, themeable color system was implemented using CSS Custom Properties in `:root`. The palette features warm, earthy tones:
    *   **Primary**: A warm terracotta for key actions and highlights.
    *   **Text**: Deep, rich browns for improved readability and a softer feel.
    *   **Backgrounds**: Creamy, off-white tones for a clean and warm canvas.
    *   **Borders & Shadows**: Subtle, warm grays to create a soft, minimal, and premium aesthetic.
*   **Typography**: The application continues to use the 'Inter' font, but typography has been refined across components for better hierarchy and elegance.
*   **`mom-result` Component Redesign**: The primary results component was fully redesigned to align with the new aesthetic:
    *   **Layout**: A softer container with a delicate border and gentle shadows replaced the previous heavy card design.
    *   **Header**: A clean, minimal header with a simple bottom border provides a more modern and less intrusive look.
    *   **Visuals**: The table design was simplified, using horizontal lines and typography to structure data, improving clarity and readability.

---

## Project Plan: Next Phases

### Phase 3: Mock Data and UI Polish

*   **Goal**: Flesh out the UI with realistic mock data and refine the visual presentation.
*   **Steps**:
    1.  Create a mock service to provide sample meeting data (transcript and initial MoM).
    2.  Integrate the mock service into the `MeetingPipelineComponent`.
    3.  Enhance the UI with loading indicators and empty states.
    4.  Refine the SCSS to improve the layout, typography, and overall aesthetics. Add subtle animations and transitions.

### Phase 4: Real-time Transcription Simulation

*   **Goal**: Simulate a real-time transcription experience.
*   **Steps**:
    1.  Modify the mock service to emit transcript segments over time.
    2.  Update the `TranscriptComponent` to dynamically display the incoming transcript.
    3.  Implement a feature to "finalize" the transcript, which will then trigger the MoM generation.
