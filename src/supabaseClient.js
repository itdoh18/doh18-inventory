import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://iijfkbwebjudeubjblzh.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpamZrYndlYmp1ZGV1YmpibHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwNjg1NTksImV4cCI6MjEwODY0NDU1OX0.8ZFSfyND6pPzaoU-3OkTi3Z8bkUaUAFgOMzgbYIPCiE";

export const supabase = createClient(supabaseUrl, supabaseKey);
