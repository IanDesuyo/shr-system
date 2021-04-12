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
import FormatListNumberedIcon from "@material-ui/icons/FormatListNumbered";
import FingerprintIcon from "@material-ui/icons/Fingerprint";
import CommentIcon from "@material-ui/icons/Comment";
import TextField from "@material-ui/core/TextField";
import { downloadDevice } from "../../Services/API";
import { useAuth } from "../../Services/Auth";
import { makeStyles } from "@material-ui/core/styles";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles(theme => ({
  download: {
    backgroundColor: "#ffab00",
  },
  save: {
    backgroundColor: "#00c853",
  },
  modify: {
    backgroundColor: "#512da8",
  },
}));

export default function DeviceDialog(props) {
  const { onClose, open, rowData, onDelete, onModify } = props;
  const classes = useStyles();
  const { t } = useTranslation();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [modifyData, setModifyData] = useState(null);
  const [error, setError] = useState({});
  const { token } = useAuth();

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
    if (data.comment === "") {
      data.comment = null;
    } else if (data.comment && data.comment.length > 120) {
      setError(prev => ({ ...prev, comment: "errors.commentTooLong" }));
      isError = true;
    }
    if (!/^[0-9A-F]{12}4[0-9A-F]{3}[89AB][0-9A-F]{3}[0-9A-F]{12}$/i.test(data.uuid)) {
      setError(prev => ({ ...prev, uuid: "errors.wrongFormat" }));
      isError = true;
    }
    if (isError) return;
    data.uuid = data.uuid.toUpperCase();
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
                  icon: FormatListNumberedIcon,
                  col: "id",
                  required: true,
                },
                {
                  icon: FingerprintIcon,
                  col: "uuid",
                  required: true,
                  helperText: "hits.uuidModify",
                },
                {
                  icon: CommentIcon,
                  col: "comment",
                  required: false,
                },
              ].map((val, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar>
                      <val.icon />
                    </Avatar>
                  </ListItemAvatar>
                  {modifyData && index !== 0 ? (
                    <TextField
                      fullWidth
                      label={t(val.col)}
                      value={modifyData[val.col]}
                      onChange={e => handleChange(val.col, e)}
                      required={val.required}
                      helperText={t(error[val.col] || val.helperText)}
                      error={error[val.col]}
                    />
                  ) : (
                    <ListItemText primary={`${t(val.col)}: ` + (rowData[val.col] || t("null"))} />
                  )}
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => downloadDevice(token, rowData.id)} color="primary" className={classes.download} variant="contained">
              {t("download")}
            </Button>
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
