import {
  IconNotes,
  IconCalendarStats,
  IconGauge,
  IconLock,
} from "@tabler/icons-react";
import { UserButton } from "../UserButton";
import { LinksGroup } from "../NavbarLinksGroup";
import classes from "./index.module.css";

const mockdata = [
  {
    label: "Your Apps",
    icon: IconGauge,
    initiallyOpened: true,
    links: [
      { label: "Android", link: "/app/android" },
      { label: "Playstore", link: "/app/play" },
      { label: "IOS", link: "/app/ios" },
    ],
  },
  {
    label: "Dream Sports Production",
    icon: IconNotes,
    links: [
      { label: "Android", link: "/" },
      { label: "Playstore", link: "/" },
      { label: "IOS", link: "/" },
    ],
  },
  {
    label: "Dream Sports Testing",
    icon: IconCalendarStats,
    links: [
      { label: "Android", link: "/" },
      { label: "Playstore", link: "/" },
      { label: "IOS", link: "/" },
    ],
  },
  {
    label: "Fan Code",
    icon: IconLock,
    links: [
      { label: "Android", link: "/" },
      { label: "Playstore", link: "/" },
      { label: "IOS", link: "/" },
    ],
  },
];

export function NavbarNested() {
  const links = mockdata.map((item) => (
    <LinksGroup {...item} key={item.label} />
  ));

  return (
    <div className={classes.navbar}>
      <div className={classes.linksInner}>{links}</div>
      <div className={classes.footer}>
        <UserButton />
      </div>
    </div>
  );
}
