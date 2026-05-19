/** @type {import('electron-builder').Configuration} */
export default {
  appId: 'com.gestrix.app',
  productName: 'Gestrix',
  copyright: 'Copyright © 2025',

  // Sin ASAR para evitar el paso de integrity patching que requiere winCodeSign
  // El contenido del app igualmente está protegido por el empaquetado del instalador
  asar: false,

  // Solo el proceso principal — las deps de React ya están en dist/ (bundleadas por Vite)
  files: [
    'electron/main.mjs',
    'package.json',
    '!node_modules/**/*',
    '!src/**/*',
    '!.github/**/*',
    '!scripts/**/*',
    '!public/**/*',
  ],

  // El build de Vite se incluye como recursos extra (no lo toca electron-builder)
  extraResources: [
    {
      from: 'dist',
      to: 'dist',
      filter: ['**/*'],
    },
  ],

  // Directorio de salida
  directories: {
    output: 'release',
    buildResources: 'build-assets',
  },

  // Windows: genera un instalador .exe con wizard de instalación
  win: {
    target: [{ target: 'nsis', arch: ['x64'] }],
    icon: 'public/icons/icon-512.png',
    // Sin certificado de firma: configurar CSC_LINK cuando tengas un certificado
    forceCodeSigning: false,
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'Gestrix',
    installerIcon: 'public/icons/icon-512.png',
    uninstallerIcon: 'public/icons/icon-512.png',
  },

  // Mac: genera un .dmg
  mac: {
    target: [{ target: 'dmg', arch: ['x64', 'arm64'] }],
    icon: 'public/icons/icon-512.png',
    category: 'public.app-category.productivity',
  },
  dmg: {
    title: 'Gestrix',
    backgroundColor: '#f9fafb',
  },

  // Linux: genera AppImage (portable, no requiere instalación)
  linux: {
    target: [{ target: 'AppImage', arch: ['x64'] }],
    icon: 'public/icons/icon-512.png',
    category: 'Office',
  },

  // Publish: configurar si querés auto-update desde GitHub Releases
  // publish: {
  //   provider: 'github',
  //   owner: 'tu-usuario',
  //   repo: 'fdos-project-manager',
  // },
}
