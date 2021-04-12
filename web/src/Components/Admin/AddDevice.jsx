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
import FingerprintIcon from "@material-ui/icons/Fingerprint";
import CommentIcon from "@material-ui/icons/Comment";
import TextField from "@material-ui/core/TextField";
import DialogContentText from "@material-ui/core/DialogContentText";
import { uuidv4 } from "../../Services/API";

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
    if (dataClone.comment === "") {
      dataClone.comment = null;
    } else if (dataClone.comment && dataClone.comment.length > 120) {
      setError(prev => ({ ...prev, comment: "errors.commentTooLong" }));
      isError = true;
    }
    if (!/^[0-9A-F]{12}4[0-9A-F]{3}[89AB][0-9A-F]{3}[0-9A-F]{12}$/i.test(dataClone.uuid)) {
      setError(prev => ({ ...prev, uuid: "errors.wrongFormat" }));
      isError = true;
    }
    if (isError) return;
    dataClone.uuid = dataClone.uuid.toUpperCase();
    onAdd(dataClone);
    handleClose();
  };

  const handleClose = () => {
    setData({});
    setError({});
    onClose(false);
  };

  useEffect(() => {
    if (open) setData(prev => ({ ...prev, uuid: uuidv4() }));
  }, [open]);

  return (
    <Dialog onClose={handleClose} open={open} TransitionComponent={Transition} fullScreen={fullScreen} fullWidth>
      <form onSubmit={handleAdd}>
        <DialogTitle>{t("addDevice")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("hits.addDevice")}</DialogContentText>
          <List>
            {[
              {
                icon: FingerprintIcon,
                col: "uuid",
                required: true,
                helperText: "hits.uuidAdd",
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
                <TextField
                  fullWidth
                  label={t(val.col)}
                  value={data[val.col]}
                  onChange={e => handleChange(val.col, e)}
                  required={val.required}
                  helperText={t(error[val.col] || val.helperText)}
                  error={error[val.col]}
                />
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
