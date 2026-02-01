// Azure TTS 语音合成服务配置
import dotenv from 'dotenv';
dotenv.config();

const AZURE_TTS_KEY = process.env.AZURE_TTS_KEY || '';
const AZURE_TTS_REGION = process.env.AZURE_TTS_REGION || 'eastasia'; // 东亚区域延迟低

// 可用的中文语音
export const CHINESE_VOICES = {
  // 男声
  yunxi: 'zh-CN-YunxiNeural',       // 年轻男声
  yunyang: 'zh-CN-YunyangNeural',   // 成熟男声，有磁性
  yunze: 'zh-CN-YunzeNeural',       // 稳重男声
  yunjian: 'zh-CN-YunjianNeural',   // 阳刚男声
  // 女声
  xiaoxiao: 'zh-CN-XiaoxiaoNeural', // 年轻女声
  xiaoyi: 'zh-CN-XiaoyiNeural',     // 温柔女声
};

// 使用云扬（成熟有磁性的男声）作为陆野导演的声音
const DEFAULT_VOICE = CHINESE_VOICES.yunyang;

export async function synthesizeSpeech(text: string, voice: string = DEFAULT_VOICE): Promise<Buffer | null> {
  if (!AZURE_TTS_KEY) {
    console.warn('Azure TTS Key not configured');
    return null;
  }

  const endpoint = `https://${AZURE_TTS_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;

  // 构建 SSML
  const ssml = `
    <speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='zh-CN'>
      <voice name='${voice}'>
        <prosody rate='0%' pitch='0%'>
          ${escapeXml(text)}
        </prosody>
      </voice>
    </speak>
  `.trim();

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': AZURE_TTS_KEY,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        'User-Agent': 'CinematicMirror'
      },
      body: ssml
    });

    if (!response.ok) {
      console.error('Azure TTS error:', response.status, await response.text());
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Azure TTS request failed:', error);
    return null;
  }
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function isAzureTtsConfigured(): boolean {
  return !!AZURE_TTS_KEY;
}
