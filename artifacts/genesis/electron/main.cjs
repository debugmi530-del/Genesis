const { app, BrowserWindow, ipcMain, shell } = require('electron')
const path = require('path')

// WebGPU: must be set before app is ready
app.commandLine.appendSwitch('enable-features', 'WebGPU,WebGPUDeveloperFeatures,Vulkan,UseSkiaRenderer')
app.commandLine.appendSwitch('enable-unsafe-webgpu')
app.commandLine.appendSwitch('ignore-gpu-blocklist')
app.commandLine.appendSwitch('disable-gpu-sandbox')
app.commandLine.appendSwitch('enable-gpu-rasterization')
app.commandLine.appendSwitch('use-angle', 'd3d11')
app.commandLine.appendSwitch('enable-zero-copy')
app.commandLine.appendSwitch('ignore-certificate-errors')

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: true,
    frame: false,
    backgroundColor: '#000000',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
      allowRunningInsecureContent: true,
    },
  })

  const indexPath = path.join(__dirname, '../dist/public/index.html')
  win.loadFile(indexPath)

  win.once('ready-to-show', () => {
    win.show()
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  ipcMain.on('toggle-fullscreen', () => {
    win.setFullScreen(!win.isFullScreen())
  })

  ipcMain.on('quit-game', () => {
    app.quit()
  })

  return win
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
