import React, { useEffect, useState } from "react";
import Axios from "axios";
import { useAuth } from "../../Services/Auth";
import { useHistory } from "react-router-dom";
import QrReader from "react-qr-reader";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import Snackbar from "../../Services/Snackbar";

const useStyles = makeStyles(theme => ({
  scanner: {
    margin: theme.spacing(1),
    padding: theme.spacing(1),
    border: "5px #FFFFFF solid",
    background: "#FFF",
    borderRadius: "25px",
  },
  verifyResult: {
    marginTop: theme.spacing(2),
    marginLeft: "auto",
    marginRight: "auto",
  },
}));

export default function Scan(props) {
  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();
  const { token } = useAuth();
  const [data, setData] = useState();
  const [res, setRes] = useState();

  const handleScan = result => {
    if (!result) return;
    if (data === result) {
    }
    let decoded = null;
    try {
      decoded = JSON.parse(atob(result.match(/^https?:\/\/.*\/passport\?pass=([A-Za-z0-9]{100,150})$/)[1]));
    } catch (err) {
      return console.error(err);
    }
    setData(result);
    Axios.post(
      "/api/admin/verify",
      { password: decoded.password },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then(res => setRes(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    if (window.location.hostname !== "localhost" && window.location.protocol !== "https:") {
      alert(t("errors.notHttps")) || Snackbar.error(t("errors.notHttps"), { autoHideDuration: 3000, preventDuplicate: true });
      history.push("/admin");
    }
    if (!navigator.mediaDevices) {
      alert(t("errors.browserNotSupport")) || Snackbar.error(t("errors.browserNotSupport"), { autoHideDuration: 3000, preventDuplicate: true });
      history.push("/admin");
    }
  }, [history, t]);

  return (
    <>
      <Grid container>
        <Grid item lg={4} md={6} xs={12}>
          <QrReader delay={300} showViewFinder={false} onError={err => console.error(err)} onScan={handleScan} className={classes.scanner} />
        </Grid>
        <Grid item lg={4} md={6} xs={12} className={classes.verifyResult}>
          {res ? (
            <>
              <Typography variant="h4">
                {`${t("verifyResult")}: `}
                {res.sucess ? t("sucess") : t("notSucess")}
              </Typography>
              <Typography>{res.person.username ? `${t("user")}: ${res.person.username}` : t("guest")}</Typography>
              <Typography>{`${t("createdAt")}: ${new Date(res.createdAt).toLocaleTimeString()}`}</Typography>
              <Typography>{`${t("useCount")}: ${res.useCount}`}</Typography>
              {res.stayTime ? <Typography>{`${t("stayTime")}: ${res.stayTime}`}</Typography> : <></>}
            </>
          ) : (
            <></>
          )}
        </Grid>
      </Grid>
    </>
  );
}
