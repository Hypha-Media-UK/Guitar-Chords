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
		client: {start:"_app/immutable/entry/start.ClRm4J37.js",app:"_app/immutable/entry/app.CrSeL5Ep.js",imports:["_app/immutable/entry/start.ClRm4J37.js","_app/immutable/chunks/xFMO9fGn.js","_app/immutable/chunks/yjMH20HW.js","_app/immutable/chunks/yVA2L8_j.js","_app/immutable/entry/app.CrSeL5Ep.js","_app/immutable/chunks/yjMH20HW.js","_app/immutable/chunks/BYqyhi3s.js","_app/immutable/chunks/D41pICGH.js","_app/immutable/chunks/yVA2L8_j.js","_app/immutable/chunks/D5jaYB9M.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js'))
		],
		remotes: {
			
		},
		routes: [
			
		],
		prerendered_routes: new Set(["/"]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
