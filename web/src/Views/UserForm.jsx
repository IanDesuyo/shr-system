import React, { useEffect, useState } from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import LocalHospitalIcon from "@material-ui/icons/LocalHospital";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Alert from "@material-ui/lab/Alert";
import { useTranslation } from "react-i18next";
import Axios from "axios";
import { useAuth } from "../Services/Auth";
import { usePassport } from "../Services/Passport";
import { useHistory } from "react-router-dom";
import { useBtTerminal } from "../Services/BtTerminal";
import InputAdornment from "@material-ui/core/InputAdornment";
import { HttpError } from "../Services/ErrorHandle";
import Snackbar from "../Services/Snackbar";

export const useStyles = makeStyles(theme => ({
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  buttonSend: {
    marginTop: theme.spacing(4),
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
  buttonBack: {
    marginTop: theme.spacing(4),
    padding: theme.spacing(1),
    fontSize: theme.spacing(2),
    background: "linear-gradient(45deg, #b0bec5 0%, #808e95 50%, #b0bec5 100%)",
    backgroundSize: "200% auto",
    transition: "0.5s",
    "&:hover, &:active": {
      backgroundPosition: "right center",
      transform: "scale(1.05)",
    },
  },
  error: { marginTop: theme.spacing(6) },
}));

export default function UserForm() {
  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();
  const [temperature, setTemperature] = useState("");
  const [tempVerified, setTempVerified] = useState(false);
  const [error, setError] = useState();
  const [isLoading, setLoading] = useState(false);
  const { token, config } = useAuth();
  const { setPassport } = usePassport();
  const { btTerminal, btReceived } = useBtTerminal();

  const handleBtReceive = token => {
    let data;
    try {
      if (token) {
        data = JSON.parse(atob(token.split(".")[1]));
      }
      setTemperature(data.temp);
    } catch (e) {
      return console.error(e);
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!temperature || temperature < 25 || temperature > 45) {
      return setError("errors.temperatureError");
    }
    if (temperature >= 37.5) {
      return setError("errors.temperatureTooHigh");
    }
    setLoading(true);
    Axios.post(
      "/api/report/user",
      { temperature: temperature, verifiedDevice: btReceived },
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(res => {
        setPassport(res.data);
        history.push("/passport");
      })
      .catch(err => {
        setError(HttpError(err));
      })
      .finally(() => setLoading(false));
    e.preventDefault();
  };

  useEffect(() => {
    if (config.Disable_Staff || !token || (config.Need_tempVerified && !btTerminal.getDeviceName())) {
      return history.push("/");
    }
    if (btTerminal.getDeviceName()) {
      handleBtReceive(btReceived);
      setTempVerified(true);
    }
  }, [config.Disable_Staff, config.Need_tempVerified, token, btTerminal, history, btReceived]);

  useEffect(() => {
    if (error) Snackbar.error(t(error));
  }, [error, t]);

  return (
    <>
      <Avatar className={classes.avatar}>
        <LocalHospitalIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        {tempVerified ? t("useVerifyDevice") : t("signHealty")}
      </Typography>
      <form className={classes.form} onSubmit={handleSubmit}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="temperature"
          label={t("temperature")}
          name="temperature"
          type="number"
          onChange={e => {
            if (!tempVerified) {
              setTemperature(e.target.value);
            }
          }}
          value={temperature}
          InputProps={{
            endAdornment: <InputAdornment position="end">°C</InputAdornment>,
          }}
        />
        <Button fullWidth variant="contained" color="primary" className={classes.buttonSend} type="submit" disabled={isLoading}>
          {t("submit")}
        </Button>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          className={classes.buttonBack}
          onClick={() => history.push("/")}
          disabled={isLoading}
        >
          {t("goback")}
        </Button>
        {error ? (
          <Alert severity="error" className={classes.error}>
            {t(error)}
          </Alert>
        ) : (
          <></>
        )}
      </form>
    </>
  );
}
