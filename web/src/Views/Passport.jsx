import React, { useEffect, useState } from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import LocalHospitalIcon from "@material-ui/icons/LocalHospital";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import { usePassport } from "../Services/Passport";
import { useHistory, useLocation } from "react-router-dom";
import QRCode from "qrcode.react";

const useStyles = makeStyles(theme => ({
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  subtitle: {
    marginTop: theme.spacing(4),
  },
  qrcode: {
    margin: theme.spacing(4),
    border: "20px #FFFFFF solid",
    borderRadius: "25px",
  },
  buttonBack: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(1),
    fontSize: theme.spacing(2),
    background: "linear-gradient(45deg, #1FA2FF 0%, #12D8FA 50%, #1FA2FF 100%)",
    backgroundSize: "200% auto",
    transition: "0.5s",
    "&:hover, &:active": {
      backgroundPosition: "right center",
      transform: "scale(1.05)",
    },
  },
  error: { marginTop: theme.spacing(6) },
}));

export default function Passport(props) {
  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const { passport, setPassport } = usePassport();
  const [fromQrCode, setFromQrCode] = useState(false);

  useEffect(() => {
    let pass = new URLSearchParams(location.search).get("pass");
    if (pass) {
      try {
        setPassport(JSON.parse(atob(pass)));
        setFromQrCode(true);
      } catch (err) {
        console.error(err);
      } finally {
        return history.push("/passport");
      }
    } else if (!passport) {
      return history.push("/");
    }
  }, [history, location.search, passport, setPassport]);

  return (
    <>
      <Avatar className={classes.avatar}>
        <LocalHospitalIcon />
      </Avatar>
      <Typography component="h1" variant="h4">
        {t("passportTitle")}
      </Typography>
      <Typography component="h1" variant="h6" className={classes.subtitle}>
        {t("passportSubtitle")}
        <br />
        {t("passportTimelimit")}
      </Typography>
      {passport ? (
        <>
          <QRCode
            value={`${window.location.origin}/passport?pass=${btoa(JSON.stringify(passport))}`}
            size={256}
            className={classes.qrcode}
          />
          <Typography variant="h6">{t("createdAt") + ` ${new Date(passport.createdAt).toLocaleString()}`}</Typography>
        </>
      ) : (
        <></>
      )}
      {fromQrCode ? (
        <></>
      ) : (
        <Button fullWidth variant="contained" color="primary" className={classes.buttonBack} onClick={() => history.push("/")}>
          {t("goback")}
        </Button>
      )}
    </>
  );
}
