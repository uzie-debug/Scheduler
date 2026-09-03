// Turns a Supabase/Postgres error into something a store employee can act on.
//
// 42501 = insufficient_privilege. The database raises it two ways:
//   - RLS policy rejected the row
//   - the before-update trigger on `strains` rejected a non-editor touching
//     any column other than in_stock
// Both mean the same thing to the user, so they get the same message.
export function describeDbError(error) {
  if (!error) return null;
  const raw = `${error.code ?? ''} ${error.message ?? ''}`;
  if (raw.includes('42501')) return 'You can only change stock status.';
  return error.message || 'Something went wrong. Try again.';
}
