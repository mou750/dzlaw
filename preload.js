const { contextBridge, ipcRenderer } = require('electron');

// تعريض APIs آمنة للتطبيق
contextBridge.exposeInMainWorld('electronAPI', {
  // التخزين المحلي
  store: {
    get: (key) => ipcRenderer.invoke('store-get', key),
    set: (key, value) => ipcRenderer.invoke('store-set', key, value),
    delete: (key) => ipcRenderer.invoke('store-delete', key)
  },
  
  // حوارات الملفات
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  
  // أحداث القائمة
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-new-law', callback);
    ipcRenderer.on('menu-import', callback);
    ipcRenderer.on('menu-export', callback);
  },
  
  // معلومات النظام
  platform: process.platform,
  isElectron: true
});

// إضافة معلومات للنافذة
window.addEventListener('DOMContentLoaded', () => {
  // تحديث عنوان النافذة
  document.title = 'تطبيق إدارة القوانين الجزائرية';
  
  // إضافة كلاس للتطبيق للتمييز عن النسخة الويب
  document.body.classList.add('electron-app');
});