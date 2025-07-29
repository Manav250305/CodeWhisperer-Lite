const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const mic = require('mic');
require('dotenv').config();
process.env.PATH = `${process.env.PATH}:/opt/homebrew/bin`;
let mainWindow;
let micInstance;
let audioStream;
let audioData = [];

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    titleBarStyle: 'default',
    icon: path.join(__dirname, '../assets/icon.png') // Add app icon
  });

  // Load the React app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));;
  }

  // Handle window events
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers for Voice Recording
ipcMain.handle('start-recording', async () => {
  try {
    // Configure microphone
    micInstance = mic({
      rate: '16000',
      channels: '1',
      debug: false,
      exitOnSilence: 6
    });

    audioData = [];
    
    micInstance.getAudioStream().on('data', (data) => {
      audioData.push(data);
    });

    micInstance.getAudioStream().on('error', (err) => {
      console.error('Microphone error:', err);
    });

    micInstance.start();
    
    return { success: true, message: 'Recording started' };
  } catch (error) {
    console.error('Failed to start recording:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('stop-recording', async () => {
  try {
    if (micInstance) {
      micInstance.stop();
    }

    // Create temp directory if it doesn't exist
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Save audio data to file
    const audioPath = path.join(tempDir, `recording_${Date.now()}.wav`);
    const audioBuffer = Buffer.concat(audioData);
    
    // Write WAV header + audio data
    const wavHeader = createWavHeader(audioBuffer.length);
    const wavFile = Buffer.concat([wavHeader, audioBuffer]);
    
    fs.writeFileSync(audioPath, wavFile);
    
    return { 
      success: true, 
      audioPath: audioPath,
      message: 'Recording saved successfully' 
    };
  } catch (error) {
    console.error('Failed to stop recording:', error);
    return { success: false, error: error.message };
  }
});

// Helper function to create WAV header
function createWavHeader(audioLength) {
  const header = Buffer.alloc(44);
  
  // RIFF header
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + audioLength, 4);
  header.write('WAVE', 8);
  
  // fmt chunk
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // chunk size
  header.writeUInt16LE(1, 20);  // PCM format
  header.writeUInt16LE(1, 22);  // mono
  header.writeUInt32LE(16000, 24); // sample rate
  header.writeUInt32LE(32000, 28); // byte rate
  header.writeUInt16LE(2, 32);  // block align
  header.writeUInt16LE(16, 34); // bits per sample
  
  // data chunk
  header.write('data', 36);
  header.writeUInt32LE(audioLength, 40);
  
  return header;
}

// Handle file operations
ipcMain.handle('save-code-file', async (event, code, filename) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: filename,
      filters: [
        { name: 'All Files', extensions: ['*'] },
        { name: 'JavaScript', extensions: ['js'] },
        { name: 'Python', extensions: ['py'] },
        { name: 'HTML', extensions: ['html'] },
        { name: 'CSS', extensions: ['css'] }
      ]
    });

    if (!result.canceled && result.filePath) {
      fs.writeFileSync(result.filePath, code);
      return { success: true, path: result.filePath };
    }
    
    return { success: false, canceled: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Whisper transcription handler
const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process?.env?.OPENAI_API_KEY || '',
});

// Code generation handler
ipcMain.handle('generate-code', async (event, prompt, language) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a code assistant. Generate code in ${language} for the following request.`,
        },
        {
          role: 'user',
          content: prompt,
        }
      ],
      temperature: 0.2,
      max_tokens: 1500,
    });

    const code = response.choices[0]?.message?.content || '';
    return code.trim();
  } catch (error) {
    console.error('Code generation failed:', error);
    throw new Error('Failed to generate code');
  }
});

ipcMain.handle('transcribe-audio', async (event, audioPath) => {
  try {
    if (!fs.existsSync(audioPath)) {
      throw new Error('Audio file not found');
    }

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: 'whisper-1',
      language: 'en',
      response_format: 'text',
      temperature: 0.0,
    });

    try {
      fs.unlinkSync(audioPath);
    } catch (cleanupError) {
      console.warn('Failed to cleanup audio file:', cleanupError);
    }

    return transcription.trim();
  } catch (error) {
    console.error('Transcription failed:', error);

    try {
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
    } catch (cleanupError) {
      console.warn('Failed to cleanup audio file after error:', cleanupError);
    }

    throw new Error(`Transcription failed: ${error.message}`);
  }
});

// Handle app updates and notifications
ipcMain.handle('show-notification', (event, title, body) => {
  const { Notification } = require('electron');
  
  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
  }
});

// App menu (optional)
const { Menu } = require('electron');

const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New Recording',
        accelerator: 'CmdOrCtrl+N',
        click: () => {
          mainWindow.webContents.send('new-recording');
        }
      },
      {
        label: 'Save Code',
        accelerator: 'CmdOrCtrl+S',
        click: () => {
          mainWindow.webContents.send('save-code');
        }
      },
      { type: 'separator' },
      { role: 'quit' }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectall' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'close' }
    ]
  }
];

app.whenReady().then(() => {
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
});