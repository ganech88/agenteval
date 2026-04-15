type ClassValue = string | number | null | false | undefined | ClassValue[];

export function cn(...classes: ClassValue[]): string {
  const out: string[] = [];
  for (const c of classes) {
    if (!c) continue;
    if (Array.isArray(c)) {
      const joined = cn(...c);
      if (joined) out.push(joined);
    } else {
      out.push(String(c));
    }
  }
  return out.join(" ");
}
