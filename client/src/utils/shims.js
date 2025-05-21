// File containing browser-compatible shims (replacements) for Node.js modules
// This allows us to use the same code base in both environments

// fs (filesystem) shim
export const fs = {
  // Mock functions that do nothing in the browser
  existsSync: () => false,
  mkdirSync: () => {},
  writeFileSync: () => {},
  readFileSync: () => '',
  readdirSync: () => []
};

// path shim
export const path = {
  join: (...parts) => parts.join('/'),
  // Other path functions if needed
};

// os shim
export const os = {
  homedir: () => '/home/user',
  // Other os functions if needed
};

// Export a function to check if we're in a browser
export const isBrowser = () => typeof window !== 'undefined'; 