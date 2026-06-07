type TopBarProps = {
  title: string;
};

function TopBar({ title }: TopBarProps) {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 lg:px-8">
      <h1 className="font-bold text-gray-900">{title}</h1>
      <div
        className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white"
        aria-label="User avatar"
      >
        HR
      </div>
    </header>
  );
}

export default TopBar;
