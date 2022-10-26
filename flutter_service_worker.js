'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "9b7353a2e76bc1294fa49fe1d12bbdc8",
"browserconfig.xml": "653d077300a12f09a69caeea7a8947f8",
"canvaskit/canvaskit.wasm": "bf50631470eb967688cca13ee181af62",
"canvaskit/canvaskit.js": "2bc454a691c631b07a9307ac4ca47797",
"canvaskit/profiling/canvaskit.wasm": "95a45378b69e77af5ed2bc72b2209b94",
"canvaskit/profiling/canvaskit.js": "38164e5a72bdad0faa4ce740c9b8e564",
"favicon.ico": "1d7b40b396a9476962dd6c3d9c69fea0",
"flutter.js": "f85e6fb278b0fd20c349186fb46ae36d",
"index.html": "d153c24794daf27202caa8a987bff8ee",
"/": "d153c24794daf27202caa8a987bff8ee",
"manifest.json": "7191bd42ada5b13e5c4140ade7f176de",
"main.dart.js": "9e127e18d952e39779db25857babe813",
"assets/AssetManifest.json": "2efbb41d7877d10aac9d091f58ccd7b9",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/NOTICES": "8915c37aa57ffdc8dd6cd00124b4cff1",
"assets/fonts/MaterialIcons-Regular.otf": "95db9098c58fd6db106f1116bae85a0b",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/shaders/ink_sparkle.frag": "e35b6596de523db6d8ed141b1569cb7a",
"icons/apple-icon-72x72.png": "a054b45cb33b4dbd363b2ed0bd3efccf",
"icons/apple-icon-76x76.png": "67450c7af05c2497582b28790d8807f8",
"icons/apple-icon-144x144.png": "8de4039e89252e8a6a8c746ddf199922",
"icons/favicon-96x96.png": "59f74f34d8181eec8d82415db5009f7b",
"icons/android-icon-72x72.png": "a054b45cb33b4dbd363b2ed0bd3efccf",
"icons/ms-icon-144x144.png": "8de4039e89252e8a6a8c746ddf199922",
"icons/apple-icon-152x152.png": "f5b88720342e6307185e68b27d07722a",
"icons/apple-icon-57x57.png": "3956893587a92c61f90ada78ea7f5b4d",
"icons/apple-icon-60x60.png": "a021a72a2f2c2945f58d89fa0cd7d577",
"icons/ms-icon-70x70.png": "12e9b92b692ae202e490afacef335015",
"icons/apple-icon-114x114.png": "4b330465ec13babfe2b1bc4c652d1146",
"icons/apple-icon-precomposed.png": "8ba2e3ccbe174df6dac91aeaf0dd6746",
"icons/apple-icon.png": "8ba2e3ccbe174df6dac91aeaf0dd6746",
"icons/android-icon-48x48.png": "108d9be6c813194d4e546b70ba10e57c",
"icons/apple-icon-120x120.png": "b4e256b6333c28ba01ad46ba36f9e79c",
"icons/android-icon-144x144.png": "8de4039e89252e8a6a8c746ddf199922",
"icons/apple-icon-180x180.png": "72b0aa44f58c4d2ee540f4b71e41e8d5",
"icons/android-icon-96x96.png": "5edace4be4a93d1bda3b60d299f241b9",
"icons/favicon-32x32.png": "c384bf60733e96d47ecaccb400df8358",
"icons/ms-icon-310x310.png": "7302586c5d8bdb8dfca8699190b598de",
"icons/favicon-16x16.png": "f91dc10601a674463f9eced690604080",
"icons/android-icon-192x192.png": "7d7af298833197f531b0a55deca41570",
"icons/android-icon-36x36.png": "f8e376926eb069e800460faf5ddc4991",
"icons/ms-icon-150x150.png": "3e6d0195c3b6c312cab54b0cee179071"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
