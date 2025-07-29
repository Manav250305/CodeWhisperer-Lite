import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader, AlertCircle, Play, Square } from 'lucide-react';

const OPENAI_API_KEY = window.env?.OPENAI_API_KEY;

const VoiceInput = ({ onTranscriptionComplete, isGenerating }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('unknown');
  
  const timerRef = useRef(null);
  const recordingStartTime = useRef(null);

  // Check microphone permissions on component mount
  useEffect(() => {
    checkMicrophonePermission();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionStatus('granted');
    } catch (err) {
      setPermissionStatus('denied');
      setError('Microphone access denied. Please enable microphone permissions.');
    }
  };

  const startRecording = async () => {
    if (permissionStatus !== 'granted') {
      await checkMicrophonePermission();
      if (permissionStatus !== 'granted') return;
    }

    setError(null);
    setIsRecording(true);
    setRecordingTime(0);
    recordingStartTime.current = Date.now();
    
    // Start the recording timer
    timerRef.current = setInterval(() => {
      setRecordingTime(Math.floor((Date.now() - recordingStartTime.current) / 1000));
    }, 1000);

    try {
      const result = await window.electron.ipcRenderer.invoke('start-recording');
      if (!result.success) {
        throw new Error(result.error || 'Failed to start recording');
      }
    } catch (err) {
      console.error('Recording failed:', err);
      setError(err.message);
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setIsProcessing(true);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    try {
      const result = await window.electron.ipcRenderer.invoke('stop-recording');
      if (!result.success) {
        throw new Error(result.error || 'Failed to stop recording');
      }

      // Pass the audio path to parent component
      await onTranscriptionComplete(result.audioPath);
      
    } catch (err) {
      console.error('Failed to process recording:', err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
      setRecordingTime(0);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getButtonState = () => {
    if (isProcessing || isGenerating) return 'processing';
    if (isRecording) return 'recording';
    if (permissionStatus === 'denied') return 'disabled';
    return 'ready';
  };

  const getButtonIcon = () => {
    const state = getButtonState();
    switch (state) {
      case 'processing':
        return <Loader className="spin" size={32} />;
      case 'recording':
        return <Square size={32} />;
      case 'disabled':
        return <AlertCircle size={32} />;
      default:
        return <Mic size={32} />;
    }
  };

  const getStatusText = () => {
    if (isProcessing) return '⚡ Processing audio...';
    if (isGenerating) return '🤖 Generating code...';
    if (isRecording) return `🔴 Recording... ${formatTime(recordingTime)}`;
    if (permissionStatus === 'denied') return '❌ Microphone access denied';
    if (error) return `❌ ${error}`;
    return '🎙️ Click to start recording';
  };

  const getButtonClass = () => {
    const baseClass = 'voice-btn';
    const state = getButtonState();
    return `${baseClass} ${baseClass}--${state}`;
  };

  return (
    <div className="voice-input">
      <div className="voice-control">
        <button
          className={getButtonClass()}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing || isGenerating || permissionStatus === 'denied'}
          title={isRecording ? 'Stop Recording' : 'Start Recording'}
        >
          {getButtonIcon()}
        </button>
        
        {/* Recording indicator ring */}
        {isRecording && (
          <div className="recording-ring">
            <div className="pulse-ring"></div>
            <div className="pulse-ring delay-1"></div>
            <div className="pulse-ring delay-2"></div>
          </div>
        )}
      </div>

      <div className="voice-status">
        <p className="status-text">{getStatusText()}</p>
        
        {/* Recording controls */}
        {isRecording && (
          <div className="recording-controls">
            <button 
              className="stop-btn"
              onClick={stopRecording}
              title="Stop Recording"
            >
              <Square size={16} />
              Stop Recording
            </button>
          </div>
        )}

        {/* Error retry button */}
        {error && permissionStatus === 'denied' && (
          <button 
            className="retry-btn"
            onClick={checkMicrophonePermission}
          >
            🔄 Retry Permission
          </button>
        )}
      </div>

      {/* Voice input tips */}
      <div className="voice-tips">
        <details>
          <summary>📋 Voice Input Tips</summary>
          <ul>
            <li>Speak clearly and at a normal pace</li>
            <li>Try to minimize background noise</li>
            <li>Be specific about what you want to create</li>
            <li>You can say "create", "make", "write", or "build"</li>
            <li>Mention the programming concept clearly</li>
          </ul>
        </details>
      </div>

      {/* Visual audio level indicator (optional enhancement) */}
      {isRecording && (
        <div className="audio-visualizer">
          <div className="audio-bar"></div>
          <div className="audio-bar"></div>
          <div className="audio-bar"></div>
          <div className="audio-bar"></div>
          <div className="audio-bar"></div>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;