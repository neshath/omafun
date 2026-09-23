# Pixel Forge

Pixel Forge is a local-first retro game creation studio for making small 2D games pixel by pixel. It runs as a dependency-light browser editor and can be packaged as a native Linux desktop application for Omarchy and other Arch-based systems.

The project is intentionally local-first: projects, assets, and editor state stay on the user’s device unless the user explicitly exports or shares a project package. The Exchange currently supports local packages and read-only HTTPS catalogs; it is not a hosted publishing service.

## Current status

Pixel Forge includes the first playable editor/runtime slice and a working Tauri desktop shell. The browser editor and native desktop build share the same project model, renderer, runtime, and export path.

The current release includes:

- Terrain, collision, layer, camera, and entity editing.
- Multiple scenes and game-format settings.
- Pixel sprite creation, frame editing, animation preview, onion skinning, and PNG sheet import/export.
- Playtest with movement, jumping, attacks, pickups, hazards, checkpoints, doors, pause, respawn, HUD, and gamepad mapping.
- Logic rules, HUD configuration, scene management, asset folders, and local Exchange packages.
- Collapsible and resizable editor panels with persistent layout settings.
- The classic Pixel Forge skin and the optional colorful Pixel Playground skin.
- Audio v1 asset management: import sound effects and music, preview them, toggle music looping, and delete assets.
- Portable `.pixel.json` project files, browser autosave, standalone HTML game export, and native Linux file dialogs in the Tauri build.

Audio v1 currently stores and previews audio assets. Assigning sounds to gameplay events, runtime music playback, and audio in exported games are planned follow-up features.

## Browser quick start

Requires Node.js 20 or newer. The editor has no production dependency-install step.

```sh
git clone https://github.com/neshath/pixel-forge.git
cd pixel-forge
npm start
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173). The default server listens only on loopback, so it is intended for local development.

For an explicitly public preview on a trusted network or sandbox, opt in to a non-loopback host and a separate port:

```sh
HOST=0.0.0.0 PORT=4174 npm start
```

Do not use that command on an untrusted network without an appropriate firewall or access control layer.

## Create a game

1. Choose **New empty project**, or explore the labeled **Moonfern sample**.
2. Open **Tiles**, choose a terrain or decoration tile, and paint with Pencil, Eraser, Fill, Rectangle, Line, or Eyedropper.
3. Open **Entities**, choose a player, enemy, pickup, checkpoint, door, platform, boss, or other supported object, and place it on the canvas.
4. Use **Select** to move and inspect entities. Configure their transform, artwork, movement, health, damage, paths, and destinations in the Inspector.
5. Use **Collision** to override individual cells and **Camera** to compose the runtime viewport.
6. Open **♫ Audio** to import small sound-effect or music files. Use the native preview controls and enable **Loop** for music tracks.
7. Press **Playtest**. The default controls are arrows or A/D to move, Space to jump, X to attack, Esc to pause, and R to restart.
8. Use **Save** to download an editable `.pixel.json` project. Use **Open project** to restore one. Use **Export game** to download a standalone HTML game for the active scene.

Playtest uses an isolated runtime scene. Gameplay changes such as enemy damage, pickups, deaths, and checkpoints do not mutate the editable scene.

## Editor features

### World and scene editing

- Tile painting, erasing, filling, rectangles, lines, eyedropping, panning, zooming, grid display, and collision overlays.
- Named scenes, scene duplication, scene deletion, camera settings, game-format selection, and biome palettes.
- Layer visibility, locking, renaming, ordering, duplication, and custom decorative layers.
- Entity placement, selection, movement, duplication, deletion, artwork assignment, transforms, paths, and behavior settings.
- Persistent collapse and resize controls for the Project, Inspector, and Assets panels.

### Sprite and asset editing

- 8, 16, 24, 32, and 64 pixel sprite canvases.
- Transparency, palette editing, frame duplication, frame timing, onion skinning, and loop, ping-pong, and one-shot previews.
- PNG sprite-sheet import and export.
- Reusable sprite assets with folders, tags, and assignment through the Inspector.

### Audio v1

The Audio tab provides a small, portable asset library:

- Import one or multiple sound effects.
- Import one or multiple music files.
- Preview imported files with native audio controls.
- Toggle looping per asset, with music enabled by default.
- Delete assets with undo support.
- Store audio inside the project JSON for portability.

Audio imports are limited to **4 MB per file** and **8 MB per project** in this first slice. Audio is not yet triggered by gameplay events and is not yet included in exported-game runtime playback.

### Exchange and projects

- Source-included local packages.
- Author, license, and source metadata.
- Editable forks with attribution.
- Recoverable local library and project version history.
- Read-only HTTPS catalog fetching.
- Browser autosave and validated portable project files.

## Linux desktop build

The Tauri desktop build embeds the same web editor and runs without a local development server. It provides native Open, Save, and Export dialogs.

On Arch Linux or Omarchy, install the build prerequisites:

```sh
sudo pacman -Syu
sudo pacman -S --needed nodejs npm rust cargo webkit2gtk-4.1 \
  lib32-webkit2gtk-4.1 gtk3 libayatana-appindicator librsvg patchelf
```

Build the native application:

```sh
npm install
RUSTUP_TOOLCHAIN=stable npm run desktop:build
```

The build produces:

```text
src-tauri/target/release/pixel-forge
src-tauri/target/release/bundle/appimage/Pixel Forge_0.1.0_amd64.AppImage
src-tauri/target/release/bundle/deb/Pixel Forge_0.1.0_amd64.deb
```

The AppImage and Arch `PKGBUILD` path are the preferred formats for Omarchy. The `.deb` is intended primarily for Debian- or Ubuntu-based systems and should not be treated as the native Omarchy package format.

If WebKitGTK renders a blank or corrupted view, retry with:

```sh
WEBKIT_DISABLE_DMABUF_RENDERER=1 ./src-tauri/target/release/pixel-forge
```

Final Wayland/Hyprland validation still needs to be performed on a real Omarchy installation. The sandbox validates Linux compilation and X11 launch behavior, but it is not an Omarchy/Hyprland test machine.

## Verification

Run the automated suite:

```sh
npm test
```

The test suite covers project round trips, extended validation, invalid-file rejection, undo/redo isolation, terrain operations, collision behavior, runtime movement, one-way platforms, collectibles, checkpoints, respawn, pause, export bundling, marketplace validation, the native file bridge, and Audio v1 asset round trips.

The current suite contains **30 passing tests**. Browser smoke checks cover editor startup, the Audio tab, layout controls, project workflows, marketplace views, and playtest entry.

## Known limitations and roadmap

The next major steps are:

1. Validate the AppImage and Arch package on real Omarchy/Hyprland hardware.
2. Connect imported audio to gameplay events and exported-game playback.
3. Improve editor workflows such as multi-selection, autotiling, slopes, animation timelines, and complete undo coverage.
4. Add richer runtime systems including advanced enemy AI, bosses, moving platforms, particles, transitions, and more hazards.
5. Add CI, reproducible release artifacts, and release documentation.
6. Build hosted community marketplace infrastructure separately from the local editor.

The project is suitable for experimentation, prototyping, and early community review. It is not yet a complete commercial-grade game engine or an online publishing platform.

## Source structure

- `src/model.js` — structured project model, validation, scenes, entities, assets, and rules.
- `src/render.js` — Canvas rendering for scenes, entities, tiles, and overlays.
- `src/runtime.js` — isolated gameplay simulation and runtime rendering.
- `src/app.js` — editor state, input handling, autosave, file operations, audio imports, and export actions.
- `src/editor-panels.js` — Inspector, asset libraries, Audio tab, HUD, logic, files, and collision panels.
- `src/workbench.js` — panel composition, tabs, Exchange integration, and responsive editor behavior.
- `src/platform.js` — browser/native file bridge.
- `src-tauri/` — native Linux desktop shell and capabilities.
- `packaging/` — desktop entry and Arch packaging metadata.
- `tests/` — model, runtime, storage, export, marketplace, platform, and Audio v1 tests.

## License

Pixel Forge is released under the MIT License. See [LICENSE](LICENSE).
