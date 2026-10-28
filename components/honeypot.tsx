// Anti-spam trap: invisible to people and screen readers, filled by naive bots.
// Server actions reject any submission where it is non-empty (lib/validation.ts → isBot).
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Ne pas remplir
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}
