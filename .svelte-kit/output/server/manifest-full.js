export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.svg"]),
	mimeTypes: {".svg":"image/svg+xml"},
	_: {
		client: {start:"_app/immutable/entry/start.B-r6MxhC.js",app:"_app/immutable/entry/app.C8FGtWdK.js",imports:["_app/immutable/entry/start.B-r6MxhC.js","_app/immutable/chunks/BO5Wn_Fd.js","_app/immutable/chunks/D45hmrUG.js","_app/immutable/chunks/D2zugg4n.js","_app/immutable/entry/app.C8FGtWdK.js","_app/immutable/chunks/D45hmrUG.js","_app/immutable/chunks/CHNBXPx6.js","_app/immutable/chunks/Din6o8IY.js","_app/immutable/chunks/D2zugg4n.js","_app/immutable/chunks/BTdLv1e4.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
