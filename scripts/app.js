var r = requirejs.config({
  "context": "xNote",
  "baseUrl": "scripts",
  "paths": {
    "jquery": "lib/jquery-2.1.1.min",
    "core": "x/x.core",
    "simditor": "../plugins/simditor/scripts",
    "dialog": "../plugins/dialog/js/dialog",
    'notification': "../plugins/notification/scripts/notification",
    "template": "x/x.template",
    "i18n": "../i18n/i18n"
  },
  "shim": {},
  "map": {}
});

// Load the main app module to start the app
r(["main"]);