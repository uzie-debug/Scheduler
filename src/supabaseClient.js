import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vmrxmcjnzhplkrzuicnf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtcnhtY2puemhwbGtyenVpY25mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4MDc0NTEsImV4cCI6MjEwMjM4MzQ1MX0.2xpjG8ROK8e2x7byo5l92kPYph1sD9YX0zVcLLHOWc0';

export const supabase = createClient(supabaseUrl, supabaseKey);

// ── DB ↔ JS field mapping ──────────────────────────────────

export const workerFromDb = (row) => ({
  id: row.id,
  name: row.name,
  maxLives: row.max_lives,
  type: row.type,
});

export const workerToDb = (w) => ({
  id: w.id,
  name: w.name,
  max_lives: w.maxLives,
  type: w.type,
});

export const shiftFromDb = (row) => ({
  id: row.id,
  workerId: row.worker_id,
  workerName: row.worker_name,
  day: row.day,
  ampm: row.ampm,
  startTime: row.start_time,
  endTime: row.end_time,
});

export const shiftToDb = (s) => ({
  id: s.id,
  worker_id: s.workerId,
  worker_name: s.workerName,
  day: s.day,
  ampm: s.ampm,
  start_time: s.startTime,
  end_time: s.endTime,
});
