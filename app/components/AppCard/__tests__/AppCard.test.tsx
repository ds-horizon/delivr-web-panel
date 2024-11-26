import { describe, test, expect } from "vitest";
import { AppCard } from "../index";

import { render } from "@testing-utils/render";

describe("<AppCard />", () => {
  test("AppCard mounts properly", () => {
    const result = render(
      <AppCard
        id={""}
        name={""}
        description={""}
        metrics={{
          numberOfDeployments: "",
          numberOfReleases: "",
        }}
        isAdmin={false}
        // eslint-disable-next-line jsx-a11y/aria-role
        role={"Collaborator"}
        link={""}
        deleteLink={""}
      />
    );

    expect(result).toMatchSnapshot();
  });
});
