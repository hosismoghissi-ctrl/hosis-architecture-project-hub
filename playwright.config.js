const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  // The supplied MP4 uses H.264; test with Chrome's media codecs.
  use: { channel: 'chrome' },
});
