import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import LanguageIcon from "@material-ui/icons/Language";
import SearchIcon from "@material-ui/icons/Search";
import DevicesIcon from "@material-ui/icons/Devices";
import PeopleIcon from "@material-ui/icons/People";
import CameraEnhanceIcon from "@material-ui/icons/CameraEnhance";
import ListItemText from "@material-ui/core/ListItemText";
import HomeIcon from "@material-ui/icons/Home";
import { Link, useHistory } from "react-router-dom";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import { version as app_version } from "../../../package.json";
import LangDialog from "../LangDialog";
import Grid from "@material-ui/core/Grid";
import { useAuth } from "../../Services/Auth";
import { loadEruda } from "../../Services/API";
import { useEffect } from "react";

const items = [
  { icon: HomeIcon, i18n: "home", path: "/admin" },
  { icon: CameraEnhanceIcon, i18n: "scanner", path: "/admin/scanner" },
  { icon: SearchIcon, i18n: "searchByDate", path: "/admin/search/date" },
  { icon: SearchIcon, i18n: "searchByID", path: "/admin/search/idNum" },
  { icon: SearchIcon, i18n: "searchByPhone", path: "/admin/search/phone" },
  { icon: DevicesIcon, i18n: "deviceList", path: "/admin/devices" },
  { icon: PeopleIcon, i18n: "userList", path: "/admin/users" },
];

const useStyles = makeStyles(theme => ({
  list: {
    width: 280,
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
  appDetails: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(1),
    cursor: "pointer",
  },
  bottom: {
    width: 250,
    position: "fixed",
    bottom: 0,
    paddingBottom: 20,
  },
}));

export default function LeftDrawer(props) {
  const { onToggle, open } = props;
  const { t } = useTranslation();
  const { token } = useAuth();
  const classes = useStyles();
  const history = useHistory();
  const [langDialogOpen, setLangDialogOpen] = useState(false);
  const [debugCount, setDebugCount] = useState(0);

  useEffect(() => {
    if (debugCount > 4) {
      loadEruda();
      setDebugCount(-1);
    }
  }, [debugCount]);

  return (
    <>
      <SwipeableDrawer anchor="left" open={open} onClose={onToggle} onOpen={onToggle}>
        <List className={classes.list}>
          {!token ||
            items.map((val, index) => (
              <ListItem button key={index} component={Link} to={val.path} onClick={onToggle}>
                <ListItemIcon>
                  <val.icon />
                </ListItemIcon>
                <ListItemText primary={t(val.i18n)} />
              </ListItem>
            ))}
          <div className={classes.bottom}>
            <ListItem
              button
              key="99"
              onClick={() => {
                setLangDialogOpen(true);
                onToggle();
              }}
            >
              <ListItemIcon>
                <LanguageIcon />
              </ListItemIcon>
              <ListItemText primary={t("chooseLang")} />
            </ListItem>
            <Divider />
            <Grid container>
              <Typography className={classes.appDetails} variant="subtitle2" onClick={() => history.push("/about")}>
                About
              </Typography>
              <Typography className={classes.appDetails} variant="subtitle2" onClick={() => history.push("/terms")}>
                Terms
              </Typography>
            </Grid>
            <Typography
              className={classes.appDetails}
              variant="subtitle2"
              onClick={() => {
                debugCount >= 0 ? setDebugCount(prev => ++prev) : console.log("Eruda already loaded.");
              }}
            >
              {`Version: ${app_version}`}
            </Typography>
          </div>
        </List>
      </SwipeableDrawer>
      <LangDialog open={langDialogOpen} onClose={() => setLangDialogOpen(false)} />
    </>
  );
}
