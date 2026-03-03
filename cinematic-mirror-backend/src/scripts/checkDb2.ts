import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function checkRecent() {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    console.log(`Checking sessions since ${twoHoursAgo} ...`);
    const { data: sessions, error } = await supabase
        .from('interview_sessions')
        .select('*, users(nickname)')
        .gte('created_at', twoHoursAgo)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching sessions:", error);
        return;
    }
    console.log(`Found ${sessions.length} sessions.`);
    for (const s of sessions) {
        console.log(`Session: ${s.id} | Status: ${s.status} | Round: ${s.round} | Created: ${s.created_at}`);
    }
}

checkRecent();
