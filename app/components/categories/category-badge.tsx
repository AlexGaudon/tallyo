export function CategoryBadge(props: { name: string; color: string }) {
  return (
    <div className="flex items-center">
      <div
        style={{
          background: props.color,
        }}
        className={`w-4 h-4 rounded-full mr-3`}
        aria-hidden="true"
      ></div>
      <h2 className="text-lg">{props.name}</h2>
    </div>
  );
}
