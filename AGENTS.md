<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Application architecture
- Keep the Phase 1 voxel starting island and sunset scenery in a separate merged-geometry module; retain existing player physics, district coordinates and progression while refining the environment.
- Use a dynamically imported Phaser Arcade scene for the active pixel-art game, with artwork, gameplay state and React HUD separated; retain the original 3D modules to preserve earlier work without mixing renderers.
- Keep pixel-world layouts, original enemy behavior and pure combat rules in separate modules; enemy overlaps never physically push the player, and mandatory paths remain independent of temporary platforms and power-ups.
- Load one data-defined pixel career level per Phaser scene lifecycle; restart clears transient physics and enemies while completed-level progression survives through validated optional browser storage.
- Keep portfolio facts and external destinations in the typed district data shared by the game and traditional portfolio, so both views remain consistent.
- Use React Three Fiber with Rapier for the client-only game; keep physics/player input, scenery, and DOM overlays separate so scene changes do not reset progress.
- Update character velocity and jump decisions on Rapier's fixed physics step, not render frames, so low frame rates do not shorten jumps or break reachability.
- Persist only optional local gameplay progress in browser storage; portfolio content and contact links must work without game completion or an account.
- Keep all scene HTML labels below DOM dialogs in stacking order, so scenery never covers accessible portfolio panels.
- Accept Phaser building pointer actions only from the game canvas; DOM controls and dialogs must never trigger scenery underneath.
- Keep external discovery outposts separate from player physics and career progress; McServ opens its official directory without unsupported listing feeds or vote requests.
- Standalone hosting prepares Lovable asset pointers into matching public paths using a build-time script, so source pointers remain compatible with Lovable and Vercel.
