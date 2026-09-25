# Watergarden Implementation Plan

**Goal:** Test the remote work and add composable oblique pixel-art gardens alongside existing 2D formats.

**Architecture:** Shared garden module owns material/prop artwork and surface queries. Model validation, renderer, runtime, and exporter use the same data. A Garden tab authors ordinary editable entities and tile maps.

**Tech Stack:** Existing JavaScript modules, Canvas 2D, Node tests, Tauri platform adapter.

- [ ] Verify remote baseline tests and browser startup; inspect desktop permission contract.
- [ ] Add water/deck/grass/stone brushes and original bridge, fountain, palm, reeds, lotus, lily, pool and rock artwork.
- [ ] Add prop palette, preview thumbnails, placement, elevation, footprint and depth controls.
- [ ] Replace Willowmere template with a composed, playable garden.
- [ ] Test navigation, sorting, validation, save/load, standalone export and 2D regression.
- [ ] Inspect rendered browser scenes, use editing controls, and check native work where the host permits.
- [ ] Commit and push reviewed changes without overwriting the old local desktop work.
