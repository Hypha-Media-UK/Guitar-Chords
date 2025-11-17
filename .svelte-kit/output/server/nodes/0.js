

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "prerender": true,
  "ssr": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.Coe-5bWg.js","_app/immutable/chunks/Din6o8IY.js","_app/immutable/chunks/D45hmrUG.js","_app/immutable/chunks/DqC1R-qH.js"];
export const stylesheets = ["_app/immutable/assets/0.CVU2UqzI.css"];
export const fonts = [];
