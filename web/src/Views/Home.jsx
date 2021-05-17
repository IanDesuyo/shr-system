import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import { useAuth } from "../Services/Auth";
import { usePassport } from "../Services/Passport";
import { useBtTerminal } from "../Services/BtTerminal";
import LangDialog from "../Components/LangDialog";
import Grid from "@material-ui/core/Grid";
import { version } from "../../package.json";
import Snackbar from "../Services/Snackbar";

const useStyles = makeStyles(theme => ({
  title: {
    marginBottom: theme.spacing(2),
  },
  avatar: {
    margin: theme.spacing(4),
    padding: theme.spacing(3),
    width: "40%",
    height: "40%",
    background: "pink",
  },
  buttonUser: {
    marginTop: theme.spacing(4),
    padding: theme.spacing(1),
    fontSize: theme.spacing(3),
    background: "linear-gradient(45deg, #1FA2FF 0%, #12D8FA 50%, #1FA2FF 100%)",
    backgroundSize: "200% auto",
    transition: "0.5s",
    "&:hover, &:active": {
      backgroundPosition: "right center",
      transform: "scale(1.05)",
    },
  },
  buttonGuest: {
    marginTop: theme.spacing(4),
    padding: theme.spacing(1),
    fontSize: theme.spacing(3),
    background: "linear-gradient(45deg, #FF512F 0%, #DD2476  50%, #FF512F 100%)",
    backgroundSize: "200% auto",
    transition: "0.5s",
    "&:hover, &:active": {
      backgroundPosition: "right center",
      transform: "scale(1.05)",
    },
  },
  buttonConnect: {
    marginTop: theme.spacing(4),
    padding: theme.spacing(1),
    fontSize: theme.spacing(3),
    background: "linear-gradient(45deg, #4caf50 0%, #81c784  50%, #4caf50 100%)",
    backgroundSize: "200% auto",
    transition: "0.5s",
    "&:hover, &:active": {
      backgroundPosition: "right center",
      transform: "scale(1.05)",
    },
    "& span": {
      overflow: "hidden",
    },
  },
  footer: {
    padding: theme.spacing(1),
  },
}));

export default function Home() {
  const { t } = useTranslation();
  const classes = useStyles();
  const { setToken, config } = useAuth();
  const { setPassport } = usePassport();
  const { btTerminal, btReceived, setBtReceived } = useBtTerminal();
  const [btButtonStatus, setBtButtonStatus] = useState(0);
  const history = useHistory();
  const [langDialogOpen, setLangDialogOpen] = useState(false);

  const handleConnectButton = () => {
    if (btTerminal.getDeviceName()) {
      btTerminal.disconnect();
      return setBtButtonStatus(0);
    }

    try {
      setBtButtonStatus(1);
      btTerminal
        .connect()
        .then(() => setBtButtonStatus(2))
        .catch(err => {
          console.error(err);
          setBtButtonStatus(0);
        });
    } catch (err) {
      if (window.location.hostname !== "localhost" && window.location.protocol !== "https:") {
        alert(t("errors.notHttps")) || Snackbar.error(t("errors.notHttps"), { autoHideDuration: 3000, preventDuplicate: true });
      } else {
        alert(t("errors.browserNotSupport")) ||
          Snackbar.error(t("errors.browserNotSupport"), { autoHideDuration: 3000, preventDuplicate: true });
      }
      setBtButtonStatus(0);
    }
  };

  useEffect(() => {
    setPassport(null);
    setBtReceived(null);
    setToken(null);
    setBtButtonStatus(btTerminal.getDeviceName() ? 2 : 0);
  }, [btReceived, btTerminal, setBtReceived, setPassport, setToken]);

  return (
    <>
      {/* https://www.flaticon.com/free-icon/document_2927007 */}
      <Avatar className={classes.avatar} src="logo.png" />
      <Typography component="h1" variant="h4" className={classes.title}>
        {t("welcomeUse")}
        <br />
        {process.env.REACT_APP_BRAND}
      </Typography>
      <Typography variant="h5">{t("selectLogin")}</Typography>
      {config.Disable_Guest ? (
        <></>
      ) : (
        <Button
          fullWidth
          variant="contained"
          color="primary"
          className={classes.buttonGuest}
          component={Link}
          to="/guest/form"
          disabled={config.Need_tempVerified && !btTerminal.getDeviceName()}
        >
          {t("guest")}
        </Button>
      )}
      {config.Disable_Staff ? (
        <></>
      ) : (
        <Button
          fullWidth
          variant="contained"
          color="primary"
          className={classes.buttonUser}
          component={Link}
          to="/login"
          disabled={config.Need_tempVerified && !btTerminal.getDeviceName()}
        >
          {t("user")}
        </Button>
      )}
      <Button fullWidth variant="contained" color="primary" className={classes.buttonConnect} onClick={handleConnectButton}>
        {btButtonStatus === 0
          ? t("connectVerifyDevice")
          : btButtonStatus === 1
          ? t("connecting")
          : t("connected", { device: btTerminal.getDeviceName() })}
      </Button>
      <Grid container spacing={3} className={classes.footer}>
        <Grid item xs={4}>
          <Button onClick={() => history.push("/admin")}>{t("admin")}</Button>
        </Grid>
        <Grid item xs={4}>
          <Button onClick={() => setLangDialogOpen(true)}>{t("chooseLang")}</Button>
        </Grid>
        <Grid item xs={4}>
          <Button onClick={() => history.push("/about")}>{`Version: ${version}`}</Button>
        </Grid>
      </Grid>
      <LangDialog open={langDialogOpen} onClose={() => setLangDialogOpen(false)} />
    </>
  );
}
