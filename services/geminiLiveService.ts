/**
 * Gemini Live API 服务
 * 使用 @google/genai SDK 的 ai.live.connect 实现实时音视频对话
 */

import { GoogleGenAI, Modality } from '@google/genai';

// 实时多模态模型
const LIVE_MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025';

// 获取 API Key
const getApiKey = (): string => {
    // @ts-ignore - Vite 环境变量
    return import.meta.env?.VITE_GEMINI_API_KEY || '';
};

export interface LiveSessionConfig {
    systemInstruction?: string;
    voiceName?: string;
    onAudioData?: (audioData: ArrayBuffer) => void;
    onTextResponse?: (text: string) => void;
    onError?: (error: Error) => void;
    onConnected?: () => void;
    onDisconnected?: () => void;
}

class GeminiLiveService {
    private session: any = null;
    private config: LiveSessionConfig = {};
    private audioContext: AudioContext | null = null;
    private isConnected = false;

    /**
     * 初始化音频上下文（必须在用户交互时调用）
     */
    initAudioContext(): void {
        if (!this.audioContext) {
            this.audioContext = new AudioContext({ sampleRate: 24000 });
            console.log('🔊 AudioContext initialized');
        }
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
            throw new Error('Missing Gemini API Key. Please set VITE_GEMINI_API_KEY.');
        }

        try {
            const ai = new GoogleGenAI({ apiKey });

            this.session = await ai.live.connect({
                model: LIVE_MODEL,
                callbacks: {
                    onopen: () => {
                        console.log('✅ Live API connected');
                        this.isConnected = true;
                        this.config.onConnected?.();
                    },
                    onmessage: (message: any) => {
                        this.handleMessage(message);
                    },
                    onerror: (error: any) => {
                        console.error('❌ Live API error:', error);
                        this.config.onError?.(error instanceof Error ? error : new Error(String(error)));
                    },
                    onclose: () => {
                        console.log('📴 Live API disconnected');
                        this.isConnected = false;
                        this.config.onDisconnected?.();
                    }
                },
                config: {
                    responseModalities: [Modality.AUDIO, Modality.TEXT],
                    systemInstruction: config.systemInstruction || '你是一位专业的服装造型顾问，会根据用户的外表给出穿搭建议。请用中文回复。',
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: {
                                voiceName: config.voiceName || 'Puck'
                            }
                        }
                    }
                }
            });

        } catch (error: any) {
            console.error('Failed to connect to Live API:', error);
            throw error;
        }
    }

    /**
     * 处理服务器消息
     */
    private handleMessage(message: any): void {
        try {
            // 处理文本响应
            if (message.text) {
                this.config.onTextResponse?.(message.text);
            }

            // 处理转录内容
            if (message.serverContent?.modelTurn?.parts) {
                for (const part of message.serverContent.modelTurn.parts) {
                    if (part.text) {
                        this.config.onTextResponse?.(part.text);
                    }
                    if (part.inlineData?.data) {
                        const audioData = this.base64ToArrayBuffer(part.inlineData.data);
                        this.config.onAudioData?.(audioData);
                        this.playAudio(audioData);
                    }
                }
            }

            // 处理直接音频数据
            if (message.data && message.data instanceof ArrayBuffer) {
                this.config.onAudioData?.(message.data);
                this.playAudio(message.data);
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    }

    /**
     * 发送音频数据
     */
    sendAudio(audioData: ArrayBuffer): void {
        if (!this.isConnected || !this.session) return;

        try {
            this.session.sendRealtimeInput({
                audio: {
                    data: this.arrayBufferToBase64(audioData),
                    mimeType: 'audio/pcm;rate=16000'
                }
            });
        } catch (error) {
            console.error('Error sending audio:', error);
        }
    }

    /**
     * 发送视频帧（图片）
     */
    sendVideoFrame(imageData: string): void {
        if (!this.isConnected || !this.session) return;

        try {
            const base64Image = imageData.replace(/^data:image\/\w+;base64,/, '');

            this.session.sendRealtimeInput({
                media: {
                    data: base64Image,
                    mimeType: 'image/jpeg'
                }
            });
        } catch (error) {
            console.error('Error sending video frame:', error);
        }
    }

    /**
     * 发送文本消息
     */
    sendText(text: string): void {
        if (!this.isConnected || !this.session) return;

        try {
            this.session.sendClientContent({
                turns: [{
                    role: 'user',
                    parts: [{ text }]
                }],
                turnComplete: true
            });
        } catch (error) {
            console.error('Error sending text:', error);
        }
    }

    /**
     * 播放音频
     */
    private async playAudio(audioData: ArrayBuffer): Promise<void> {
        if (!this.audioContext) {
            this.audioContext = new AudioContext({ sampleRate: 24000 });
        }

        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        try {
            // PCM 16-bit 转 Float32
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
            source.start();

            console.log('🔊 Playing audio:', floatData.length, 'samples');
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    }

    /**
     * 断开连接
     */
    disconnect(): void {
        if (this.session) {
            try {
                this.session.close();
            } catch (e) {
                // Ignore close errors
            }
            this.session = null;
        }
        this.isConnected = false;

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
