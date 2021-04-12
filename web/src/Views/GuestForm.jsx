import React, { useEffect, useState } from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import LocalHospitalIcon from "@material-ui/icons/LocalHospital";
import Typography from "@material-ui/core/Typography";
import Alert from "@material-ui/lab/Alert";
import { useTranslation } from "react-i18next";
import Axios from "axios";
import { useAuth } from "../Services/Auth";
import { usePassport } from "../Services/Passport";
import { useHistory } from "react-router-dom";
import { useBtTerminal } from "../Services/BtTerminal";
import { useStyles } from "./UserForm";
import InputAdornment from "@material-ui/core/InputAdornment";
import { HttpError } from "../Services/ErrorHandle";
import Snackbar from "../Services/Snackbar";

export default function GuestForm() {
  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();
  const [idNum, setIdNum] = useState("A123456789");
  const [phone, setPhone] = useState("0912345678");
  const [stayTime, setStayTime] = useState(30);
  const [temperature, setTemperature] = useState("");
  const [tempVerified, setTempVerified] = useState(false);
  const [error, setError] = useState();
  const [isLoading, setLoading] = useState(false);
  const { config } = useAuth();
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
    Axios.post("/api/report/guest", {
      temperature: temperature,
      verifiedDevice: btReceived,
      idNum: idNum,
      phone: phone,
      stayTime: stayTime,
    })
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
    if (config.Disable_Guest || (config.Need_tempVerified && !btTerminal.getDeviceName())) {
      history.push("/");
    }
  }, [config.Disable_Guest, config.Need_tempVerified, btTerminal, history]);

  useEffect(() => {
    if (btTerminal.getDeviceName()) {
      handleBtReceive(btReceived);
      setTempVerified(true);
    }
  }, [btTerminal, btReceived]);

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
          id="idNum"
          label={t("idNum")}
          name="idNum"
          type="string"
          onChange={e => {
            setIdNum(e.target.value);
          }}
          value={idNum}
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="phone"
          label={t("phone")}
          name="phone"
          type="number"
          onChange={e => {
            setPhone(e.target.value);
          }}
          value={phone}
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="stayTime"
          label={t("stayTime")}
          name="stayTime"
          type="number"
          onChange={e => {
            setStayTime(e.target.value);
          }}
          value={stayTime}
        />
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
