/**
 * Gemini Live API 服务
 * 参考工作代码重写，实现实时音视频对话
 */

import { GoogleGenAI, Modality } from '@google/genai';

const LIVE_MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025';

const getApiKey = (): string => {
    // @ts-ignore
    return import.meta.env?.VITE_GEMINI_API_KEY || '';
};

export interface LiveSessionConfig {
    systemInstruction?: string;
    voiceName?: string;
    onAudioData?: (audioData: ArrayBuffer) => void;
    onTextResponse?: (text: string) => void;
    onTurnComplete?: () => void;
    onError?: (error: Error) => void;
    onConnected?: () => void;
    onDisconnected?: () => void;
    onInterrupted?: () => void;
}

class GeminiLiveService {
    private session: any = null;
    private config: LiveSessionConfig = {};
    private audioContext: AudioContext | null = null;
    private isConnected = false;
    private nextStartTime = 0;
    private activeSources: Set<AudioBufferSourceNode> = new Set();

    initAudioContext(): void {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            console.log('🔊 AudioContext initialized (24000Hz)');
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        // iOS 必须在用户手势中真实播放一次（哪怕静音）才能解锁 AudioContext
        // 否则后续通过 WebSocket 收到音频数据时无法播放
        const silentBuffer = this.audioContext.createBuffer(1, 1, this.audioContext.sampleRate);
        const source = this.audioContext.createBufferSource();
        source.buffer = silentBuffer;
        source.connect(this.audioContext.destination);
        source.start(0);
        console.log('🔊 AudioContext unlocked via silent buffer');
    }

    async connect(config: LiveSessionConfig): Promise<void> {
        this.config = config;

        const apiKey = getApiKey();
        if (!apiKey) {
            throw new Error('Missing Gemini API Key');
        }

        try {
            const ai = new GoogleGenAI({ apiKey });

            this.session = await ai.live.connect({
                model: LIVE_MODEL,
                callbacks: {
                    onopen: () => {
                        console.log('✅ Live API connected');
                        this.isConnected = true;
                        this.nextStartTime = 0;
                        this.config.onConnected?.();
                    },
                    onmessage: (message: any) => {
                        this.handleMessage(message);
                    },
                    onerror: (error: any) => {
                        console.error('❌ Live API error:', error);
                        this.config.onError?.(error instanceof Error ? error : new Error(String(error)));
                    },
                    onclose: (event: any) => {
                        console.log('📴 Live API disconnected', event?.code, event?.reason);
                        this.isConnected = false;
                        this.config.onDisconnected?.();
                    }
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    systemInstruction: config.systemInstruction || '你是一位专业的服装造型顾问。请用中文回复，语气温暖专业。',
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: {
                                voiceName: config.voiceName || 'Zephyr'
                            }
                        }
                    },
                    outputAudioTranscription: {},
                }
            });

        } catch (error: any) {
            console.error('Failed to connect:', error);
            throw error;
        }
    }

    private handleMessage(message: any): void {
        try {
            // 处理中断
            if (message.serverContent?.interrupted) {
                console.log('⚡ Interrupted');
                this.stopAllAudio();
                this.config.onInterrupted?.();
                return;
            }

            // 处理音频数据 - 关键路径
            const audioPart = message.serverContent?.modelTurn?.parts?.[0];
            if (audioPart?.inlineData?.data) {
                const base64Audio = audioPart.inlineData.data;
                console.log('🔊 Got audio data, length:', base64Audio.length);
                this.playBase64Audio(base64Audio);
            }

            // 处理输出转录（AI说的话）
            if (message.serverContent?.outputTranscription?.text) {
                const text = message.serverContent.outputTranscription.text;
                console.log('📝 AI transcript:', text);
                this.config.onTextResponse?.(text);
            }

            // 处理输入转录（用户说的话）
            if (message.serverContent?.inputTranscription?.text) {
                console.log('🎤 User transcript:', message.serverContent.inputTranscription.text);
            }

            // 处理回合完成
            if (message.serverContent?.turnComplete) {
                console.log('✔️ Turn complete');
                this.config.onTurnComplete?.();
            }

        } catch (error) {
            console.error('Error handling message:', error);
        }
    }

    private async playBase64Audio(base64: string): Promise<void> {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }

        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        try {
            // 解码 base64
            const binaryString = atob(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // PCM 16-bit 转 AudioBuffer
            const dataInt16 = new Int16Array(bytes.buffer);
            const sampleRate = 24000;
            const channels = 1;
            const frameCount = dataInt16.length / channels;

            const audioBuffer = this.audioContext.createBuffer(channels, frameCount, sampleRate);
            const channelData = audioBuffer.getChannelData(0);

            for (let i = 0; i < frameCount; i++) {
                channelData[i] = dataInt16[i] / 32768.0;
            }

            // 使用队列播放，避免音频重叠
            this.nextStartTime = Math.max(this.nextStartTime, this.audioContext.currentTime);

            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.audioContext.destination);
            source.start(this.nextStartTime);

            this.nextStartTime += audioBuffer.duration;
            this.activeSources.add(source);

            this.config.onAudioData?.(bytes.buffer);

            source.onended = () => {
                this.activeSources.delete(source);
            };

            console.log('🔊 Playing audio, duration:', audioBuffer.duration.toFixed(2), 's');

        } catch (error) {
            console.error('Error playing audio:', error);
        }
    }

    private stopAllAudio(): void {
        this.activeSources.forEach(source => {
            try { source.stop(); } catch (e) {}
        });
        this.activeSources.clear();
        this.nextStartTime = 0;
    }

    sendAudio(audioData: ArrayBuffer): void {
        if (!this.isConnected || !this.session) return;

        try {
            // 转换为 base64
            const bytes = new Uint8Array(audioData);
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            const base64 = btoa(binary);

            this.session.sendRealtimeInput({
                audio: {
                    data: base64,
                    mimeType: 'audio/pcm;rate=16000'
                }
            });
        } catch (error) {
            console.error('Error sending audio:', error);
        }
    }

    sendVideoFrame(imageData: string): void {
        if (!this.isConnected || !this.session) return;

        try {
            const base64Image = imageData.replace(/^data:image\/\w+;base64,/, '');
            this.session.sendRealtimeInput({
                video: {
                    data: base64Image,
                    mimeType: 'image/jpeg'
                }
            });
        } catch (error) {
            console.error('Error sending video frame:', error);
        }
    }

    sendText(text: string): void {
        if (!this.isConnected || !this.session) return;

        try {
            this.session.sendRealtimeInput({ text });
        } catch (error) {
            console.error('Error sending text:', error);
        }
    }

    disconnect(): void {
        this.stopAllAudio();

        if (this.session) {
            try { this.session.close(); } catch (e) {}
            this.session = null;
        }
        this.isConnected = false;

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }

    isSessionActive(): boolean {
        return this.isConnected;
    }

    getAudioContext(): AudioContext {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        return this.audioContext;
    }
}

export const geminiLive = new GeminiLiveService();
export default geminiLive;
