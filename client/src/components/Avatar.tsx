export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps {
  name: string;
  size?: AvatarSize;
  imageUrl?: string;
}

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
};

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return '?';
  }

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

function getColorClasses(name: string): string {
  const firstLetter = name.trim().charAt(0).toUpperCase();

  if ('AB'.includes(firstLetter)) {
    return 'bg-blue-100 text-blue-700';
  }
  if ('CD'.includes(firstLetter)) {
    return 'bg-green-100 text-green-700';
  }
  if ('EFG'.includes(firstLetter)) {
    return 'bg-purple-100 text-purple-700';
  }
  if ('HIJ'.includes(firstLetter)) {
    return 'bg-amber-100 text-amber-700';
  }
  if ('KLM'.includes(firstLetter)) {
    return 'bg-rose-100 text-rose-700';
  }
  if ('NOP'.includes(firstLetter)) {
    return 'bg-teal-100 text-teal-700';
  }
  if ('QRS'.includes(firstLetter)) {
    return 'bg-orange-100 text-orange-700';
  }
  if ('TUV'.includes(firstLetter)) {
    return 'bg-indigo-100 text-indigo-700';
  }

  return 'bg-cyan-100 text-cyan-700';
}

function Avatar({ name, size = 'md', imageUrl }: AvatarProps) {
  const sizeClasses = SIZE_CLASSES[size];

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`shrink-0 rounded-full object-cover ${sizeClasses}`}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold ${sizeClasses} ${getColorClasses(name)}`}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  );
}

export default Avatar;
