if(!self.define){let e,i={};const n=(n,r)=>(n=new URL(n+".js",r).href,i[n]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=i,document.head.appendChild(e)}else e=n,importScripts(n),i()})).then((()=>{let e=i[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(r,s)=>{const c=e||("document"in self?document.currentScript.src:"")||location.href;if(i[c])return;let o={};const f=e=>n(e,c),d={module:{uri:c},exports:o,require:f};i[c]=Promise.all(r.map((e=>d[e]||f(e)))).then((e=>(s(...e),o)))}}define(["./workbox-5ffe50d4"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/index-Bf2e3Evl.js",revision:null},{url:"assets/index-BgLwZiMi.css",revision:null},{url:"index.html",revision:"06e506ec0c4f2e9ac4abfe554292be7b"},{url:"registerSW.js",revision:"402b66900e731ca748771b6fc5e7a068"},{url:"apple-touch-icon.png",revision:"96c2d06dc6cb20b70a1930323fe8a60b"},{url:"dark_mode.svg",revision:"1c06c6aabad4df1cfc236b0e8bd41f08"},{url:"favicon-96x96.png",revision:"a9cdc9d94a46ecbb146872d171c16e9d"},{url:"favicon.ico",revision:"c946fc054a30a67c69664cb43c92b78b"},{url:"favicon.svg",revision:"6904fe53e6b78248988bae3ff6b6287a"},{url:"fullscreen_portrait.svg",revision:"18297ef6eb8f4ee7e4c9c149e7dff1a5"},{url:"light_mode.svg",revision:"6d40d46677e822e430f1b5096d7348eb"},{url:"tune.svg",revision:"296adf4640508e254c7383089a9935ac"},{url:"web-app-manifest-192x192.png",revision:"865aee7cf7e72ce4a3c6dabe1966443c"},{url:"web-app-manifest-512x512.png",revision:"fe89ed2881a568b8e6f2d86f7eee252d"},{url:"manifest.webmanifest",revision:"5fde596c0517f772155ed960c3d49f95"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
