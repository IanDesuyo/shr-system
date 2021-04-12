import React, { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Alert from "@material-ui/lab/Alert";
import { useTranslation } from "react-i18next";
import Axios from "axios";
import { useAuth } from "../../Services/Auth";
import { useHistory } from "react-router-dom";
import { HttpError } from "../../Services/ErrorHandle";
import Snackbar from "../../Services/Snackbar";

const useStyles = makeStyles(theme => ({
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(1),
  },
  buttonGuest: {
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
  error: {
    marginTop: theme.spacing(6),
    transition: "0.5s",
    transform: "scale(1.05)",
  },
}));

export default function SignIn(props) {
  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const [error, setError] = useState();
  const [isLoading, setLoading] = useState(false);
  const { token, setToken } = useAuth();

  const handleSubmit = e => {
    e.preventDefault();
    setLoading(true);
    Axios.post("/api/login?admin=true", { username: username, password: password })
      .then(res => {
        setToken(res.data);
        history.push("/admin");
      })
      .catch(err => {
        setError(HttpError(err));
      })
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    if (error) Snackbar.error(t(error));
  }, [error, t]);

  useEffect(() => {
    if (token) history.goBack();
  }, [token, history]);

  return (
    <>
      <Typography component="h1" variant="h5">
        {t("signin")}
      </Typography>
      <form className={classes.form} onSubmit={handleSubmit}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="username"
          label={t("username")}
          name="username"
          autoComplete="username"
          autoFocus
          onChange={event => setUsername(event.target.value)}
          value={username}
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="password"
          label={t("password")}
          type="password"
          id="password"
          autoComplete="current-password"
          onChange={event => setPassword(event.target.value)}
          value={password}
        />
        <Button fullWidth variant="contained" color="primary" className={classes.buttonGuest} type="submit" disabled={isLoading}>
          {t("signin")}
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
