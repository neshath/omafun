# Omafun

A dependency-free, local retro game creation studio and open-source game exchange for Omarchy linux. Built from the supplied master prompt's **required first playable slice**, using original hand-authored pixel motifs, tile patterns, characters, and scenery. The exchange currently uses local packages and read-only HTTPS catalogs; it is not a hosted publishing service.

## Run

Requires Node.js 20 or newer. No package installation is needed.

```sh
cd omafun
npm start
```

Open http://127.0.0.1:4173. The server listens only on the local computer.

## Create a game

1. Choose **New empty project**, or explore the labeled **Moonfern sample**.
2. Select Terrain, select a tile, and paint. Pencil, eraser, fill, rectangle, line, and eyedropper work on the canvas.
3. Open **Entities** and select Player, then click the map. Add enemies, gems, health, checkpoints and an exit door the same way.
4. Use Select to move an entity and edit its properties. Use Collision to override any individual cell. Camera shows the configurable viewport bounds.
5. Press **Playtest**. Move with arrows/A/D, jump with Space, attack with X. Esc pauses; R restarts; Enter returns to editing.
6. **Save** downloads the whole editable project. **Open project** imports it. **Export game** downloads the current scene as a standalone HTML game.

The game runtime uses a separate scene copy. Enemies, pickups, deaths, and checkpoints during play do not mutate the editor's scene.

## Implemented

- Tile editing, pan/zoom, grid, collision overrides, one-way platforms and hazards.
- Named scenes, scene duplication, layer visibility/locking/renaming, custom decorative layers.
- Player, patrol/stationary enemy, gem, health, checkpoint, exit door. Select, move, duplicate and delete entities.
- Configurable movement speed, jump velocity, gravity, health and enemy patrol range.
- Platformer runtime: acceleration, coyote time, buffered jumps, attacks, enemy damage, pickups, checkpoint respawn, follow camera, layered scenery, pause and completion HUD.
- Four environment palettes and optional CRT preview.
- Dedicated pixel sprite canvas: 8/16/24/32/64 px, transparency, drawing tools, palette selection, flip, duplicated animation frames, timing, onion skin, loop/ping-pong/one-shot preview, PNG sheet import/export.
- Undo/redo for project edits, browser autosave recovery, validated portable JSON projects.
- Standalone HTML game export, keyboard shortcuts and gamepad input mapping.

## Scope boundaries

This is the first playable **platformer** slice, not the complete long-term editor roadmap. Top-down/arcade/beat-em-up controllers, visual event graphs, bosses, scene-transition logic, moving platforms, autotiling, audio, configurable HUDs, asset folders, multi-selection and custom shortcut remapping are not implemented. Water, ladder and lantern tiles are visual decorations; spikes deal damage. Custom sprites are editable/exportable assets but are not yet assignable to runtime entities. Camera width/height configure the runtime viewport; the camera position overlay is a composition guide, while playtest follows the player.

In browser mode, Save is a download rather than a direct filesystem project directory; the Tauri desktop build uses native file dialogs. Autosave belongs to the current browser/origin and retains one latest project. Download a project file for durable backups or transferring between browsers. PNG sprite imports should be arranged as a grid with dimensions divisible by the selected frame size. Gamepad support is implemented but has not been verified on a physical controller.

## Verification

```sh
npm test
```

The tests cover project round trips, invalid file rejection, empty projects, undo/redo isolation, fill boundaries, line endpoints, collision overrides, landing/jumping, one-way collision, collectibles, checkpoints, completion, respawn and pause. The browser was also used to verify the visible editor, painting/history and playtest entry.

## Source structure

`src/model.js` stores the structured project model, validation and editing operations. `src/render.js` draws original pixel assets and scenes. `src/runtime.js` owns isolated gameplay simulation. `src/app.js` connects editor interactions, autosave, file management and exports. `style.css` implements the retro interface.

The Impeccable design skill informed panel hierarchy, contrast, focus states and spacing; the supplied prompt defined the pink/charcoal visual identity.
