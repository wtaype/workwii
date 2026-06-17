import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eybibdjjozqaepecwmbs.supabase.co';
const supabaseAnonKey = 'sb_publishable_06KR88LlOVGGccopshJDgw_oILGttNz';

async function checkTable(supabase, name) {
  const { count, error } = await supabase.from(name).select('*', { count: 'exact', head: true });
  if (error) {
    console.log(`Table '${name}': Error: ${error.message}`);
  } else {
    console.log(`Table '${name}': Count = ${count}`);
  }
}

async function run() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const tables = ['smiles', 'configwii', 'notas', 'word', 'blog', 'mensajes'];
  for (const t of tables) {
    await checkTable(supabase, t);
  }
}

run();
