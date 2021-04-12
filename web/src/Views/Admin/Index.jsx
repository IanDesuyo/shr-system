import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import { Link, Route, useHistory } from "react-router-dom";
import { useAuth } from "../../Services/Auth";
import { Container } from "@material-ui/core";
import LeftDrawer from "../../Components/Admin/LeftDrawer";
import Login from "./Login";
import Home from "./Home";
import Scan from "./Scan";
import Search from "./Search";
import Devices from "./Devices";
import Users from "./Users";
import Snackbar from "../../Services/Snackbar";
import ReconnectingWebSocket from "reconnecting-websocket";

const routes = [
  { path: "/admin", Component: Home },
  { path: "/admin/login", Component: Login },
  { path: "/admin/scanner", Component: Scan },
  { path: "/admin/search/:searchType(date|phone|idNum)", Component: Search },
  { path: "/admin/devices", Component: Devices },
  { path: "/admin/users", Component: Users },
];

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  container: {
    marginTop: theme.spacing(2),
  },
}));

export default function AdminHome() {
  const classes = useStyles();
  const { token, setToken } = useAuth();
  const history = useHistory();
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [ws, setWs] = useState();

  useEffect(() => {
    if (!token) {
      // setToken("eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6IkFkbWluIiwiaXNBZG1pbiI6dHJ1ZSwiZXhwIjoxNjE4MDgwMDM2fQ.ybvmDroBL8HNZ7i1er8y5uket8w2Opqq9yPsZQSLN_o")
      history.push("/admin/login");
    }
  }, [history, token]);

  useEffect(() => {
    if (!token) return;
    const handleWs = e => {
      let data = JSON.parse(e.data);
      if (data.error) {
        Snackbar.error(t(data.i18n));
      } else if (data.code === 200) {
        Snackbar.success(
          t("newReport", { user: data.username || t("guest"), tempMsg: `${data.temperature}°C${data.verified ? "✓" : ""}` })
        );
      } else if (data.code === 202) {
        Snackbar.clear();
        Snackbar.success(t(data.i18n, { device: "realtime update" }));
      }
    };
    if (!ws) {
      let newWs = new ReconnectingWebSocket(
        `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/api/admin/ws`,
        [],
        { maxRetries: 10, debug: true }
      );
      newWs.onopen = () => newWs.send(`checkAdmin: ${token}`);
      newWs.onmessage = handleWs;
      newWs.onclose = () => {
        Snackbar.clear();
        Snackbar.error("disconnected", { persist: true });
      };
      setWs(newWs);
    }
    return () => {
      if (ws) {
        ws.close();
        setTimeout(() => Snackbar.clear(), 1000);
      }
    };
  }, [token, ws]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar variant="dense">
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
            onClick={() => setDrawerOpen(!drawerOpen)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            {process.env.REACT_APP_BRAND}
          </Typography>
          <Button color="inherit" component={Link} to="/">
            {t("leave")}
          </Button>
        </Toolbar>
      </AppBar>
      <Container className={classes.container}>
        {!token ? <Login /> : routes.map(({ path, Component }, index) => <Route path={path} exact component={Component} key={index} />)}
      </Container>
      <LeftDrawer open={drawerOpen} onToggle={() => setDrawerOpen(!drawerOpen)} />
    </div>
  );
}
