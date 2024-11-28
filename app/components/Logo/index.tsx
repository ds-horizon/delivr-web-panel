import { useNavigate } from "@remix-run/react";
import { route } from "routes-gen";

export function Logo(props: React.ComponentPropsWithoutRef<"svg">) {
  const navigate = useNavigate();
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 60"
      onClick={() => navigate(route("/dashboard"))}
    >
      <g fill="none" fillRule="evenodd">
        <text
          x="40"
          y="35"
          fontFamily="Arial, sans-serif"
          fontSize="25"
          fontWeight="bold"
          fill="#339AF0"
        >
          CodePush
        </text>
      </g>
    </svg>
  );
}
