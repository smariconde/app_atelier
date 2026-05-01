/** @type {import('@lhci/cli').LighthouseRcSchema} */
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 1,
      settings: {
        // Throttle to simulate realistic mobile conditions
        throttlingMethod: 'simulate',
        // Skip service worker in collect phase (checked via assertions instead)
        disableStorageReset: false,
      },
    },
    assert: {
      assertions: {
        'categories:performance':    ['error', { minScore: 0.9 }],
        'categories:accessibility':  ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo':            ['error', { minScore: 0.9 }],
        'categories:pwa':            ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
