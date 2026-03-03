import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDb() {
    console.log("=== Recent Interview Sessions ===");
    const { data: sessions, error } = await supabase
        .from('interview_sessions')
        .select('*, users(nickname)')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error("Error fetching sessions:", error);
        return;
    }

    for (const s of sessions) {
        console.log(`Session: ${s.id}`);
        console.log(`User ID: ${s.user_id} / Nickname: ${s.users?.nickname}`);
        console.log(`Status: ${s.status} | Round: ${s.round} | Profile ID: ${s.profile_id || 'None'}`);
        console.log(`Created: ${s.created_at} | Updated: ${s.updated_at}`);

        if (s.profile_id) {
            const { data: profile } = await supabase
                .from('personality_profiles')
                .select('id, title')
                .eq('id', s.profile_id)
                .single();

            if (profile) console.log(`  -> Profile found: ${profile.title}`);
            else console.log(`  -> Profile NOT FOUND in DB!`);
        }
        console.log('---');
    }
}

checkDb();
