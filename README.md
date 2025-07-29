# 🧠 CodeWhisperer-Lite

CodeWhisperer is a desktop app (built with Electron + React) that lets you **generate**, **improve**, and **test code** using natural language prompts via the OpenAI API.

It also includes:
- 🎙️ **Voice-to-code transcription**
- 💾 **Persistent code history**
- 💡 **Search, sort, and filter past generations**

---

## 🚀 Features

- ✍️ Prompt-based code generation
- 🔍 View, search, and filter history
- 🧪 Generate test cases and refactor suggestions
- 🎤 Voice recording + Whisper-based transcription
- 🧱 Built with Electron, React, Webpack

---

## 📦 Setup Instructions

### 1. Clone this repository

```bash
git clone https://github.com/YOUR_USERNAME/CodeWhisperer.git
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```env
OPENAI_API_KEY=your-openai-key-here
```

> ⚠️ Make sure `.env` is listed in `.gitignore`!

---

🖥️ Run the app

Start the Electron app in development mode:

npm run dev

Or build and launch:

npm run build
npm start


---

📂 Folder Structure

```
src/
├── main/         # Electron main process
├── preload.js    # Secure context bridging
├── renderer/     # React UI components
│   ├── App.jsx
│   ├── components/
│   └── styles/
└── utils/        # OpenAI logic & helpers
```

---

🛡️ Security Note

Your OpenAI API key is securely stored in a .env file and is never exposed to the frontend.

---

## 🧠 Powered by

- [Electron](https://www.electronjs.org/)
- [React](https://react.dev/)
- [OpenAI API](https://platform.openai.com/)
- [Whisper](https://openai.com/research/whisper)

---

📜 License

MIT — feel free to use and modify.
