import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Slide from "@material-ui/core/Slide";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import SupervisorAccountIcon from "@material-ui/icons/SupervisorAccount";
import FingerprintIcon from "@material-ui/icons/Fingerprint";
import VpnKeyIcon from "@material-ui/icons/VpnKey";
import PhoneIcon from "@material-ui/icons/Phone";
import PersonIcon from "@material-ui/icons/Person";
import TextField from "@material-ui/core/TextField";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import DialogContentText from "@material-ui/core/DialogContentText";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AddDevice(props) {
  const { onClose, open, onAdd } = props;
  const { t } = useTranslation();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [data, setData] = useState({});
  const [error, setError] = useState({});

  const handleChange = (col, e) => {
    setData(prev => ({ ...prev, [col]: e.target.value }));
  };

  const handleAdd = e => {
    e.preventDefault();
    setError({});
    let isError = false;
    let dataClone = { ...data };
    onAdd(dataClone);
    handleClose();
  };

  const handleClose = () => {
    setData({});
    setError({});
    onClose(false);
  };

  return (
    <Dialog onClose={handleClose} open={open} TransitionComponent={Transition} fullScreen={fullScreen} fullWidth>
      <form onSubmit={handleAdd}>
        <DialogTitle>{t("addUser")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("hits.addUser")}</DialogContentText>
          <List>
            {[
              {
                icon: PersonIcon,
                col: "username",
                required: true,
              },
              {
                icon: VpnKeyIcon,
                col: "password",
                required: true,
              },
              {
                icon: FingerprintIcon,
                col: "idNum",
                required: true,
              },
              {
                icon: PhoneIcon,
                col: "phone",
                required: false,
              },
              {
                icon: SupervisorAccountIcon,
                col: "isAdmin",
                required: true,
              },
            ].map((val, index) => (
              <ListItem key={index}>
                <ListItemAvatar>
                  <Avatar>
                    <val.icon />
                  </Avatar>
                </ListItemAvatar>
                {val.col === "isAdmin" ? (
                  <FormControlLabel
                    value="start"
                    control={<Switch checked={data[val.col]} onChange={e => setData(prev => ({ ...prev, isAdmin: e.target.checked }))} />}
                    label={`${t(val.col)}: `}
                    labelPlacement="start"
                  />
                ) : (
                  <TextField
                    fullWidth
                    label={t(val.col)}
                    value={data[val.col]}
                    onChange={e => handleChange(val.col, e)}
                    required={val.required}
                    helperText={t(error[val.col] || val.helperText)}
                    error={error[val.col]}
                  />
                )}
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button color="secondary" variant="contained" type="submit">
            {t("add")}
          </Button>
          <Button onClick={handleClose} color="primary" variant="contained">
            {t("goback")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
