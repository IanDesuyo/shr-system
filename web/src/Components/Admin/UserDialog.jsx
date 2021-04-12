import React, { useState } from "react";
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
import ListItemText from "@material-ui/core/ListItemText";
import Avatar from "@material-ui/core/Avatar";
import SupervisorAccountIcon from "@material-ui/icons/SupervisorAccount";
import FingerprintIcon from "@material-ui/icons/Fingerprint";
import VpnKeyIcon from "@material-ui/icons/VpnKey";
import PhoneIcon from "@material-ui/icons/Phone";
import PersonIcon from "@material-ui/icons/Person";
import TextField from "@material-ui/core/TextField";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { makeStyles } from "@material-ui/core/styles";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles(theme => ({
  save: {
    backgroundColor: "#00c853",
  },
  modify: {
    backgroundColor: "#512da8",
  },
}));

export default function UserDialog(props) {
  const { onClose, open, rowData, onDelete, onModify } = props;
  const classes = useStyles();
  const { t } = useTranslation();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [modifyData, setModifyData] = useState(null);
  const [error, setError] = useState({});

  const initModifyData = () => {
    let data = { ...rowData };
    delete data.tableData;
    setModifyData(data);
  };

  const handleChange = (col, e) => {
    setModifyData(prev => ({ ...prev, [col]: e.target.value }));
  };

  const handleSave = e => {
    e.preventDefault();
    setError({});
    let isError = false;
    let data = { ...modifyData };
    onModify(data);
    handleClose();
  };

  const handleClose = () => {
    setModifyData(null);
    setError({});
    onClose(false);
  };

  return (
    <Dialog onClose={handleClose} open={open} TransitionComponent={Transition} fullScreen={fullScreen} fullWidth>
      {rowData ? (
        <form onSubmit={handleSave}>
          <DialogTitle>{rowData.id}</DialogTitle>
          <DialogContent>
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
                  required: false,
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
                  {modifyData ? (
                    val.col === "isAdmin" ? (
                      <FormControlLabel
                        value="start"
                        control={
                          <Switch
                            checked={modifyData[val.col]}
                            onChange={e => setModifyData(prev => ({ ...prev, isAdmin: e.target.checked }))}
                          />
                        }
                        label={`${t(val.col)}: `}
                        labelPlacement="start"
                      />
                    ) : (
                      <TextField
                        fullWidth
                        label={t(val.col)}
                        value={modifyData[val.col]}
                        onChange={e => handleChange(val.col, e)}
                        required={val.required}
                        helperText={t(error[val.col] || val.helperText)}
                        error={error[val.col]}
                      />
                    )
                  ) : val.col === "isAdmin" ? (
                    <ListItemText primary={`${t(val.col)}: ` + (rowData[val.col] ? "Yes" : "No")} />
                  ) : (
                    <ListItemText primary={`${t(val.col)}: ` + (rowData[val.col] || (val.col === "password" ? "********" : t("null")))} />
                  )}
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            {modifyData ? (
              <Button color="primary" className={classes.save} variant="contained" type="submit">
                {t("save")}
              </Button>
            ) : (
              <></>
            )}
            {modifyData ? (
              <></>
            ) : (
              <Button onClick={initModifyData} color="primary" className={classes.modify} variant="contained">
                {t("modify")}
              </Button>
            )}
            <Button
              onClick={() => {
                onDelete(rowData);
                handleClose();
              }}
              color="secondary"
              variant="contained"
            >
              {t("delete")}
            </Button>
            <Button onClick={handleClose} color="primary" variant="contained">
              {t("goback")}
            </Button>
          </DialogActions>
        </form>
      ) : (
        <></>
      )}
    </Dialog>
  );
}
