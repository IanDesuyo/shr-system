import React, { useState, useEffect } from "react";
import { Route } from "react-router-dom";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";
import { PassContext } from "../Services/Passport";
import { BtTerminalContext } from "../Services/BtTerminal";
import BluetoothTerminal from "bluetooth-terminal";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Particles from "react-particles-js";
import { CSSTransition } from "react-transition-group";
import Home from "../Views/Home";
import Login from "../Views/Login";
import UserForm from "../Views/UserForm";
import GuestForm from "../Views/GuestForm";
import Passport from "../Views/Passport";
import Axios from "axios";
import { useAuth } from "../Services/Auth";

const routes = [
  { path: "/", Component: Home },
  { path: "/login", Component: Login },
  { path: "/user/form", Component: UserForm },
  { path: "/passport", Component: Passport },
  { path: "/guest/form", Component: GuestForm },
];

const useStyles = makeStyles(theme => ({
  particles: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  btButtn: {
    marginTop: theme.spacing(4),
    padding: theme.spacing(1),
    fontSize: theme.spacing(3),
    background: "linear-gradient(45deg, #1FA2FF 0%, #12D8FA 50%, #1FA2FF 100%)",
    backgroundSize: "200% auto",
    transition: "0.5s",
    "&:hover, &:active": {
      backgroundPosition: "right center",
    },
  },
  fade: {
    margin: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    position: "absolute",
    "&-enter": {
      opacity: 0,
      transform: "scale(1.1)",
    },
    "&-enter-active": {
      position: "absolute",
      opacity: 1,
      transform: "scale(1)",
      transition: "opacity 1000ms, transform 1000ms",
    },
    "&-exit": {
      opacity: 1,
      transform: "scale(1)",
    },
    "&-exit-active": {
      position: "absolute",
      opacity: 0,
      transform: "scale(0.9)",
      transition: "opacity 300ms, transform 300ms",
    },
  },
}));

export default function Index() {
  // const [darkMode, setDarkMode] = useState(true);
  const [passport, setPassport] = useState();
  const [btTerminal] = useState(new BluetoothTerminal());
  const [btReceived, setBtReceived] = useState();
  const { setConfig } = useAuth();
  const classes = useStyles();
  const matches = useMediaQuery("(min-width:960px)");
  const theme = useTheme();

  useEffect(() => {
    btTerminal.receive = handleBtReceived;
    btTerminal.setOnConnected(() => {
      setBtReceived(0);
    });
    btTerminal.setOnDisconnected(() => {
      setBtReceived(0);
    });
  }, [btTerminal]);

  useEffect(() => {
    window.onbeforeunload = () => true;
    Axios.get("/api/config")
      .then(res => setConfig(res.data))
      .catch(err => {
        console.error(err.response);
      });
  }, [setConfig]);

  const handleBtReceived = data => {
    console.log("[BT Received]", data);
    setBtReceived(data);
  };

  return (
    <PassContext.Provider value={{ passport, setPassport: setPassport }}>
      <BtTerminalContext.Provider value={{ btTerminal, btReceived, setBtReceived: setBtReceived }}>
        {theme.palette.type === "dark" && matches ? <Particles className={classes.particles} /> : <></>}
        <Container component="main" maxWidth="sm" className={classes.container}>
          {routes.map(({ path, Component }) => (
            <Route key={path} exact path={path}>
              {({ match }) => (
                <CSSTransition in={match != null} timeout={1000} classNames={`MuiContainer-maxWidthSm ${classes.fade}`} unmountOnExit>
                  <div className={`MuiContainer-maxWidthSm ${classes.fade}`}>
                    <Component />
                  </div>
                </CSSTransition>
              )}
            </Route>
          ))}
        </Container>
      </BtTerminalContext.Provider>
    </PassContext.Provider>
  );
}
