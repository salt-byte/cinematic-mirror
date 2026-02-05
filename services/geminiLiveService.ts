/**
 * Gemini 2.0 Live API 服务
 * 使用 WebSocket 实现实时音视频对话
 */

// WebSocket 端点
const LIVE_API_ENDPOINT = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent';

// 获取 API Key
const getApiKey = () => {
    // @ts-ignore - Vite 环境变量
    return import.meta.env?.VITE_GEMINI_API_KEY || '';
};

export interface LiveSessionConfig {
    systemInstruction?: string;
    voiceName?: string; // 语音名称，如 "Puck", "Charon", "Kore", "Fenrir", "Aoede"
    onAudioData?: (audioData: ArrayBuffer) => void;
    onTextResponse?: (text: string) => void;
    onError?: (error: Error) => void;
    onConnected?: () => void;
    onDisconnected?: () => void;
}

class GeminiLiveService {
    private ws: WebSocket | null = null;
    private config: LiveSessionConfig = {};
    private audioContext: AudioContext | null = null;
    private audioQueue: ArrayBuffer[] = [];
    private isPlaying = false;
    private isConnected = false;

    /**
     * 初始化音频上下文（必须在用户交互时调用）
     */
    initAudioContext(): void {
        if (!this.audioContext) {
            this.audioContext = new AudioContext({ sampleRate: 24000 });
            console.log('🔊 AudioContext initialized');
        }
        // iOS 需要 resume
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
            console.log('🔊 AudioContext resumed');
        }
    }

    /**
     * 连接到 Gemini Live API
     */
    async connect(config: LiveSessionConfig): Promise<void> {
        this.config = config;

        const apiKey = getApiKey();
        if (!apiKey) {
            throw new Error('Missing Gemini API Key');
        }

        const url = `${LIVE_API_ENDPOINT}?key=${apiKey}`;

        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(url);

            this.ws.onopen = () => {
                console.log('🔗 Live API WebSocket connected');
                this.isConnected = true;

                // 发送初始配置
                this.sendSetup();

                this.config.onConnected?.();
                resolve();
            };

            this.ws.onmessage = (event) => {
                this.handleMessage(event);
            };

            this.ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                this.config.onError?.(new Error('WebSocket connection failed'));
                reject(error);
            };

            this.ws.onclose = () => {
                console.log('📴 WebSocket disconnected');
                this.isConnected = false;
                this.config.onDisconnected?.();
            };
        });
    }

    /**
     * 发送初始会话配置
     */
    private sendSetup(): void {
        const setupMessage = {
            setup: {
                model: 'models/gemini-2.0-flash-exp',
                generationConfig: {
                    responseModalities: ['AUDIO', 'TEXT'],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: {
                                voiceName: this.config.voiceName || 'Puck'
                            }
                        }
                    }
                },
                systemInstruction: {
                    parts: [{
                        text: this.config.systemInstruction || '你是一位专业的服装造型顾问，会根据用户的外表给出穿搭建议。请用中文回复。'
                    }]
                }
            }
        };

        this.ws?.send(JSON.stringify(setupMessage));
        console.log('📤 Sent setup message');
    }

    /**
     * 处理收到的消息
     */
    private handleMessage(event: MessageEvent): void {
        try {
            if (event.data instanceof Blob) {
                // 二进制音频数据
                event.data.arrayBuffer().then(buffer => {
                    this.config.onAudioData?.(buffer);
                    this.audioQueue.push(buffer);
                    this.playAudioQueue();
                });
            } else {
                // JSON 消息
                const message = JSON.parse(event.data);

                if (message.serverContent) {
                    const content = message.serverContent;

                    // 处理文本响应
                    if (content.modelTurn?.parts) {
                        for (const part of content.modelTurn.parts) {
                            if (part.text) {
                                this.config.onTextResponse?.(part.text);
                            }
                            if (part.inlineData?.mimeType?.startsWith('audio/')) {
                                // Base64 编码的音频
                                const audioData = this.base64ToArrayBuffer(part.inlineData.data);
                                this.config.onAudioData?.(audioData);
                                this.audioQueue.push(audioData);
                                this.playAudioQueue();
                            }
                        }
                    }

                    // 会话结束
                    if (content.turnComplete) {
                        console.log('✅ Turn complete');
                    }
                }

                if (message.setupComplete) {
                    console.log('✅ Setup complete');
                }
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    }

    /**
     * 发送音频数据
     */
    sendAudio(audioData: ArrayBuffer): void {
        if (!this.isConnected || !this.ws) return;

        const base64Audio = this.arrayBufferToBase64(audioData);

        const message = {
            realtimeInput: {
                mediaChunks: [{
                    mimeType: 'audio/pcm;rate=16000',
                    data: base64Audio
                }]
            }
        };

        this.ws.send(JSON.stringify(message));
    }

    /**
     * 发送视频帧（图片）
     */
    sendVideoFrame(imageData: string): void {
        if (!this.isConnected || !this.ws) return;

        // imageData 应该是 base64 编码的 JPEG
        const base64Image = imageData.replace(/^data:image\/\w+;base64,/, '');

        const message = {
            realtimeInput: {
                mediaChunks: [{
                    mimeType: 'image/jpeg',
                    data: base64Image
                }]
            }
        };

        this.ws.send(JSON.stringify(message));
    }

    /**
     * 发送文本消息
     */
    sendText(text: string): void {
        if (!this.isConnected || !this.ws) return;

        const message = {
            clientContent: {
                turns: [{
                    role: 'user',
                    parts: [{ text }]
                }],
                turnComplete: true
            }
        };

        this.ws.send(JSON.stringify(message));
    }

    /**
     * 播放音频队列
     */
    private async playAudioQueue(): Promise<void> {
        if (this.isPlaying || this.audioQueue.length === 0) return;

        this.isPlaying = true;

        // 确保 AudioContext 已初始化并恢复
        if (!this.audioContext) {
            this.audioContext = new AudioContext({ sampleRate: 24000 });
        }

        // iOS 需要在用户交互后恢复 AudioContext
        if (this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                console.log('🔊 AudioContext resumed for playback');
            } catch (e) {
                console.error('Failed to resume AudioContext:', e);
            }
        }

        while (this.audioQueue.length > 0) {
            const audioData = this.audioQueue.shift()!;

            try {
                // Gemini 返回的是 PCM 16-bit 音频
                const pcmData = new Int16Array(audioData);
                const floatData = new Float32Array(pcmData.length);

                for (let i = 0; i < pcmData.length; i++) {
                    floatData[i] = pcmData[i] / 32768;
                }

                const audioBuffer = this.audioContext.createBuffer(1, floatData.length, 24000);
                audioBuffer.getChannelData(0).set(floatData);

                const source = this.audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(this.audioContext.destination);

                console.log('🔊 Playing audio chunk:', floatData.length, 'samples');

                await new Promise<void>(resolve => {
                    source.onended = () => resolve();
                    source.start();
                });
            } catch (error) {
                console.error('Error playing audio:', error);
            }
        }

        this.isPlaying = false;
    }

    /**
     * 断开连接
     */
    disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.isConnected = false;
        this.audioQueue = [];

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }

    /**
     * 检查是否已连接
     */
    isSessionActive(): boolean {
        return this.isConnected;
    }

    // 工具函数
    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    private base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }
}

// 导出单例
export const geminiLive = new GeminiLiveService();
export default geminiLive;
