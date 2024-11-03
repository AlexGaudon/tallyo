import { Link } from "@tanstack/react-router";

export function CategoryBadge(props: {
  name: string;
  color: string;
  link: boolean;
}) {
  const element = (
    <div className="flex items-center">
      <div
        style={{
          background: props.color,
        }}
        className={`w-4 h-4 rounded-full mr-3`}
        aria-hidden="true"
      ></div>
      <h2 className="text-base">{props.name}</h2>
    </div>
  );

  if (!props.link) {
    return element;
  }

  return <Link to="/categories">{element}</Link>;
}
