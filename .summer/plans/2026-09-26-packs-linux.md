# Environment packs and Linux verification implementation plan

**Goal:** Ten additional selectable oblique pixel-art packs; preserve 2D editing and offline export.
**Architecture:** Pack data and procedural landmarks live in garden.js, already shared by editor/runtime/export. Model registers palettes; editor uses identical asset cards for every pack. Native file permissions remain limited to dialog-selected paths.
**Tech stack:** Canvas2D ES modules, Node test runner, Tauri 2, Arch packaging.

- [ ] Define ten palettes and themed tile labels in src/garden.js; export gardenPacks and gardenTheme.
- [ ] Register palettes/names in src/model.js, route pack selection in src/workbench.js and src/garden-editor.js.
- [ ] Render themed materials and five landmark silhouettes through src/render.js, preserving per-prop pack IDs.
- [ ] Add tests/garden-packs.test.mjs: assert 11 packs including original, validate each project's serialization, render each material/landmark, exercise exported pack games.
- [ ] Run npm test and npm run desktop:stage; inspect browser pack switching and playtest.
- [ ] Add Linux build CI and document real Omarchy acceptance tests. No claim of native Linux success without running it.
- [ ] Verify origin/main and neshath identity, commit scoped files, push fast-forward to neshath/pixel-forge main, verify remote SHA.
