import { UserButton } from "../UserButton";
import classes from "./index.module.css";
import { OrgListWithActions } from "../Pages/components/OrgListNavbar";

export function NavbarNested() {
  return (
    <div className={classes.navbar}>
      <div className={classes.linksInner}>
        <OrgListWithActions />
      </div>
      <div className={classes.footer}>
        <UserButton />
      </div>
    </div>
  );
}
