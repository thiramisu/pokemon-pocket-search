if(!self.define){let e,i={};const r=(r,s)=>(r=new URL(r+".js",s).href,i[r]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=r,e.onload=i,document.head.appendChild(e)}else e=r,importScripts(r),i()})).then((()=>{let e=i[r];if(!e)throw new Error(`Module ${r} didn’t register its module`);return e})));self.define=(s,c)=>{const n=e||("document"in self?document.currentScript.src:"")||location.href;if(i[n])return;let o={};const d=e=>r(e,n),f={module:{uri:n},exports:o,require:d};i[n]=Promise.all(s.map((e=>f[e]||d(e)))).then((e=>(c(...e),o)))}}define(["./workbox-5ffe50d4"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/index-LCc6Rkdh.css",revision:null},{url:"assets/index-O6yO4M20.js",revision:null},{url:"index.html",revision:"440cd0e5122ca9bd5576ca4112ed316e"},{url:"registerSW.js",revision:"402b66900e731ca748771b6fc5e7a068"},{url:"apple-touch-icon.png",revision:"96c2d06dc6cb20b70a1930323fe8a60b"},{url:"arrow_back_ios_new_wght100.svg",revision:"9000c368c0d49273d69263ce2533b407"},{url:"arrow_forward_ios_wght100.svg",revision:"298dc23e280a248290fdf4c3cb7b5d08"},{url:"dark_mode.svg",revision:"1c06c6aabad4df1cfc236b0e8bd41f08"},{url:"favicon-96x96.png",revision:"a9cdc9d94a46ecbb146872d171c16e9d"},{url:"favicon.ico",revision:"c946fc054a30a67c69664cb43c92b78b"},{url:"favicon.svg",revision:"6904fe53e6b78248988bae3ff6b6287a"},{url:"fullscreen_portrait.svg",revision:"18297ef6eb8f4ee7e4c9c149e7dff1a5"},{url:"light_mode.svg",revision:"6d40d46677e822e430f1b5096d7348eb"},{url:"tune.svg",revision:"296adf4640508e254c7383089a9935ac"},{url:"web-app-manifest-192x192.png",revision:"865aee7cf7e72ce4a3c6dabe1966443c"},{url:"web-app-manifest-512x512.png",revision:"fe89ed2881a568b8e6f2d86f7eee252d"},{url:"manifest.webmanifest",revision:"5fde596c0517f772155ed960c3d49f95"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
