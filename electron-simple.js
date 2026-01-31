const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');

// تحديد وضع التطوير
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  // إنشاء النافذة الرئيسية
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    },
    icon: path.join(__dirname, 'icons', 'icon.png'),
    show: false,
    center: true,
    title: 'تطبيق إدارة القوانين الجزائرية'
  });

  // تحميل التطبيق
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, 'index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // إظهار النافذة عند الانتهاء من التحميل
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // فتح أدوات المطور في وضع التطوير
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // إعداد القائمة
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'ملف',
      submenu: [
        {
          label: 'قانون جديد',
          accelerator: 'CmdOrCtrl+N'
        },
        {
          label: 'استيراد',
          accelerator: 'CmdOrCtrl+I'
        },
        {
          label: 'تصدير',
          accelerator: 'CmdOrCtrl+E'
        },
        { type: 'separator' },
        {
          label: 'خروج',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'تحرير',
      submenu: [
        { label: 'تراجع', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'إعادة', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'قص', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'نسخ', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'لصق', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: 'عرض',
      submenu: [
        { label: 'إعادة تحميل', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'تبديل أدوات المطور', accelerator: 'F12', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: 'تكبير', accelerator: 'CmdOrCtrl+Plus', role: 'zoomin' },
        { label: 'تصغير', accelerator: 'CmdOrCtrl+-', role: 'zoomout' },
        { label: 'حجم طبيعي', accelerator: 'CmdOrCtrl+0', role: 'resetzoom' },
        { type: 'separator' },
        { label: 'ملء الشاشة', accelerator: 'F11', role: 'togglefullscreen' }
      ]
    },
    {
      label: 'مساعدة',
      submenu: [
        {
          label: 'حول التطبيق',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'حول تطبيق إدارة القوانين الجزائرية',
              message: 'تطبيق إدارة القوانين الجزائرية',
              detail: 'الإصدار 1.0.0\nتطبيق شامل لتسيير وإدارة القوانين الجزائرية\nمطور خصيصاً للمحامين والقضاة والطلبة'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// أحداث التطبيق
app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// منع إنشاء نوافذ متعددة
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}