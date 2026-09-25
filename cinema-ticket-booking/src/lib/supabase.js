import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qcewbtiarirxntwtdzwl.supabase.co";
const supabaseKey = "sb_publishable_a1En1Oi1IApim7LWGlXI_Q_oWJoeVI0";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);
