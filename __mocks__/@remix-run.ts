import { vi } from "vitest";

//remix mocks
vi.mock("@remix-run/react", () => {
  return {
    ...vi.importActual("@remix-run/react"),
    useNavigate: vi.fn(),
  };
});
