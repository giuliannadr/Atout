/** @type {import('electron-builder').Configuration} */
export default {
  appId: 'com.atout.app',
  productName: 'Atout',
  copyright: `Copyright © ${new Date().getFullYear()} Atout`,

  asar: false,

  // Solo el proceso principal — React ya está bundleado en dist/ por Vite
  files: [
    'electron/main.mjs',
    'package.json',
    '!node_modules/**/*',
    '!src/**/*',
    '!.github/**/*',
    '!scripts/**/*',
    '!public/**/*',
    '!android/**/*',
    '!ios/**/*',
  ],

  // El build de Vite se incluye como recurso extra
  extraResources: [
    {
      from: 'dist',
      to: 'dist',
      filter: ['**/*'],
    },
  ],

  directories: {
    output: 'release',
    buildResources: 'build-assets',
  },

  // Windows → instalador NSIS
  win: {
    target: [{ target: 'nsis', arch: ['x64'] }],
    icon: 'public/icons/icon-512.png',
    forceCodeSigning: false,
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'Atout',
    installerIcon: 'public/icons/icon-512.png',
    uninstallerIcon: 'public/icons/icon-512.png',
  },

  // Mac → .dmg universal (Intel + Apple Silicon)
  mac: {
    target: [{ target: 'dmg', arch: ['x64', 'arm64'] }],
    icon: 'public/icons/icon-512.png',
    category: 'public.app-category.productivity',
  },
  dmg: {
    title: 'Atout',
    backgroundColor: '#F8F6FF',
  },

  // Linux → AppImage portable
  linux: {
    target: [{ target: 'AppImage', arch: ['x64'] }],
    icon: 'public/icons/icon-512.png',
    category: 'Office',
    description: 'Atout — Tu estudio freelance, organizado.',
  },

  // Auto-update desde GitHub Releases (activar con GH_TOKEN)
  publish: {
    provider: 'github',
    owner: 'giuliannadr',
    repo: 'Atout',
    releaseType: 'release',
  },
}
