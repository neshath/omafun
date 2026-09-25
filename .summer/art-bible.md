# Watergarden reference analysis

Reference: user-supplied GQyNMzrXQAAm_yU.jpg.png. Original assets will interpret its material and composition language, without tracing or copying its sprites.

The scene is an oblique overhead pixel-art garden. Water occupies the negative space; warm boardwalks define a navigable structure. A large pale arched bridge is the focal point. Paired small fountains balance it. Irregular islands, palms, reeds, pink lotus flowers, lily pads, timber posts, stone retaining walls, and a cropped pool create different scales of detail. Small characters provide scale.

Depth comes from visible front faces, under-bridge darkness, cast shadows, posts disappearing into water, and foliage overlapping trunks. Entity sorting alone cannot reproduce this. Navigation must understand walkable surfaces and solid footprints independently from the artwork.

Palette: water #419baa #58b7bd #82d2cb; submerged shade #267284; wood #936029 #bc883c #e0b467; stone #a7b5b2 #d6ddd0 #fff2ce; plants #276c36 #47972f #8dc94d; lotus #df79ad #ffd1d9.

Style: sunny, lush, shallow, handcrafted, quiet. Crisp source pixels; warm highlights and cool shadows. No blur, bloom, photoreal textures or diagonal isometric diamond grid. Keep the existing 2D artwork and game formats available.

Composition tools: terrain material brushes; connected deck edges; water animation and palette; prop thumbnails; reusable bridge/fountain/palm/reeds/lotus/lily/basin/boulder assets; footprint sizing; visual elevation; collision toggle; depth offset; undo/redo; save/export fidelity.

Limit: the first watergarden supports walking across bridges, not simultaneous overlapping upper/lower navigation floors. No 3D model support is claimed.

## Additional pack direction

Ten material/palette variants extend the same crisp oblique kit: Moonfern moonlit marsh, Desertstone oasis, Frostbloom tundra, Emberroot caldera, Sakuravale blossom gardens, Copperquay canals, Amethyst grotto, Sunharbor lagoon, Autumnmere orchard, Nightlotus lantern pools. Exact swatches live in gardenPacks in src/garden.js. Shared bridge/fountain/plant silhouettes keep scale consistent; five additional landmarks (tree, cactus, crystal, mushroom, machinery) provide themed focal points. Use a warm path against a cooler background, reserve bright highlights for edges, and keep the same 70px asset-card layout in every pack. No imported third-party artwork.
