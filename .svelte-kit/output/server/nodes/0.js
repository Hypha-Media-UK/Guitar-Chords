

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "prerender": true,
  "ssr": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.DUtWZseO.js","_app/immutable/chunks/D41pICGH.js","_app/immutable/chunks/yjMH20HW.js","_app/immutable/chunks/CGKSaNwE.js"];
export const stylesheets = ["_app/immutable/assets/0.CVU2UqzI.css"];
export const fonts = [];
