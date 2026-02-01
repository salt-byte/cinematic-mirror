// Azure 语音识别服务 - 实时连续识别
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

// Azure 配置
const AZURE_KEY = import.meta.env.VITE_AZURE_TTS_KEY || '';
const AZURE_REGION = import.meta.env.VITE_AZURE_TTS_REGION || 'eastus';

let recognizer: SpeechSDK.SpeechRecognizer | null = null;
let isListening = false;

// 回调函数类型
type OnRecognizedCallback = (text: string) => void;
type OnRecognizingCallback = (text: string) => void;

// 开始连续语音识别
export function startContinuousRecognition(
  onRecognized: OnRecognizedCallback,
  onRecognizing?: OnRecognizingCallback
): boolean {
  if (!AZURE_KEY) {
    console.warn('Azure Speech Key not configured');
    return false;
  }

  if (isListening) {
    console.log('Already listening');
    return true;
  }

  try {
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(AZURE_KEY, AZURE_REGION);
    speechConfig.speechRecognitionLanguage = 'zh-CN';

    // 设置静音检测，说完话后自动结束识别
    speechConfig.setProperty(
      SpeechSDK.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs,
      "1500" // 1.5秒静音后认为说完了
    );

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

    // 识别中（实时显示）
    recognizer.recognizing = (_, event) => {
      if (event.result.reason === SpeechSDK.ResultReason.RecognizingSpeech) {
        onRecognizing?.(event.result.text);
      }
    };

    // 识别完成（一句话说完）
    recognizer.recognized = (_, event) => {
      if (event.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
        const text = event.result.text.trim();
        if (text) {
          onRecognized(text);
        }
      }
    };

    // 错误处理
    recognizer.canceled = (_, event) => {
      if (event.reason === SpeechSDK.CancellationReason.Error) {
        console.error('Speech recognition error:', event.errorDetails);
      }
    };

    // 开始连续识别
    recognizer.startContinuousRecognitionAsync(
      () => {
        isListening = true;
        console.log('Started continuous recognition');
      },
      (error) => {
        console.error('Failed to start recognition:', error);
        isListening = false;
      }
    );

    return true;
  } catch (error) {
    console.error('Failed to initialize speech recognition:', error);
    return false;
  }
}

// 停止语音识别
export function stopContinuousRecognition(): void {
  if (recognizer && isListening) {
    recognizer.stopContinuousRecognitionAsync(
      () => {
        isListening = false;
        console.log('Stopped continuous recognition');
      },
      (error) => {
        console.error('Failed to stop recognition:', error);
      }
    );
  }
}

// 暂停识别（AI说话时）
export function pauseRecognition(): void {
  if (recognizer && isListening) {
    recognizer.stopContinuousRecognitionAsync();
    isListening = false;
  }
}

// 恢复识别（AI说完后）
export function resumeRecognition(
  onRecognized: OnRecognizedCallback,
  onRecognizing?: OnRecognizingCallback
): void {
  if (recognizer && !isListening) {
    recognizer.startContinuousRecognitionAsync(
      () => {
        isListening = true;
      }
    );
  } else if (!recognizer) {
    startContinuousRecognition(onRecognized, onRecognizing);
  }
}

// 检查是否正在监听
export function isCurrentlyListening(): boolean {
  return isListening;
}

// 检查是否配置了 Azure Speech
export function isSpeechConfigured(): boolean {
  return !!AZURE_KEY;
}

// 清理资源
export function disposeSpeechRecognizer(): void {
  stopContinuousRecognition();
  if (recognizer) {
    recognizer.close();
    recognizer = null;
  }
}
