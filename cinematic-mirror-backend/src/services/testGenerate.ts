import { interviewService } from './interviewService';

async function testGenerate() {
    const sessionId = '6e7149bf-5c79-473e-8d3a-aaec8a9c87e9';
    console.log(`Testing generateProfile for session: ${sessionId}`);
    try {
        const profile = await interviewService.generateProfile(sessionId);
        console.log("Success! Profile generated:");
        console.log(profile.title);
    } catch (error: any) {
        console.error("Failed to generate profile:");
        console.error(error);
    }
}

testGenerate();
