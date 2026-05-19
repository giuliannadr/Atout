import { app, BrowserWindow, shell, protocol, net } from 'electron'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ELECTRON_ENV=development solo cuando corre el Vite dev server (hot-reload)
// En cualquier otro caso (build local o empaquetado) cargamos desde dist/
const isDevServer = process.env.ELECTRON_ENV === 'development'

const DIST = app.isPackaged
  ? path.join(process.resourcesPath, 'dist')   // instalador empaquetado
  : path.join(__dirname, '..', 'dist')          // build local

// Registrar esquema ANTES de que la app esté lista
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: true,
      allowServiceWorkers: false, // PWA no aplica en Electron
      corsEnabled: true,
    },
  },
])

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: '#f9fafb',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    show: false, // Mostrar solo cuando esté listo para evitar flash blanco
  })

  // Mostrar ventana cuando el contenido esté pintado
  win.once('ready-to-show', () => win.show())

  // Links externos se abren en el browser del sistema (ej: links de clientes)
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  if (isDevServer) {
    // Hot-reload: Vite dev server corriendo en paralelo
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    // Build local o instalador empaquetado: servir desde dist/
    win.loadURL('app://localhost/app')
  }
}

app.whenReady().then(() => {
  // Protocolo custom que sirve los archivos de dist/ como si fuera un servidor web
  // El catch garantiza que cualquier ruta que no exista devuelva index.html (SPA routing)
  protocol.handle('app', (request) => {
    const { pathname } = new URL(request.url)
    const relPath = pathname === '/' ? 'index.html' : pathname.slice(1)
    const filePath = path.join(DIST, relPath)
    const target = fs.existsSync(filePath) ? filePath : path.join(DIST, 'index.html')
    return net.fetch(pathToFileURL(target).toString())
  })

  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
