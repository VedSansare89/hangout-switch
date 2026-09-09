export interface AvatarOption {
  id: string;
  emoji: string;
  bg: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: "fox", emoji: "🦊", bg: "bg-orange-100" },
  { id: "panda", emoji: "🐼", bg: "bg-neutral-100" },
  { id: "frog", emoji: "🐸", bg: "bg-emerald-100" },
  { id: "lion", emoji: "🦁", bg: "bg-amber-100" },
  { id: "tiger", emoji: "🐯", bg: "bg-orange-100" },
  { id: "bunny", emoji: "🐰", bg: "bg-pink-100" },
  { id: "octopus", emoji: "🐙", bg: "bg-purple-100" },
  { id: "unicorn", emoji: "🦄", bg: "bg-fuchsia-100" },
  { id: "koala", emoji: "🐨", bg: "bg-slate-100" },
  { id: "monkey", emoji: "🐵", bg: "bg-yellow-100" },
  { id: "butterfly", emoji: "🦋", bg: "bg-sky-100" },
  { id: "penguin", emoji: "🐧", bg: "bg-cyan-100" },
];

export function getAvatarById(id: string | undefined | null): AvatarOption {
  return AVATAR_OPTIONS.find((a) => a.id === id) ?? AVATAR_OPTIONS[0];
}

export function randomAvatarId(): string {
  return AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)].id;
}
