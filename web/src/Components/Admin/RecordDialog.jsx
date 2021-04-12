import React from "react";
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
import PersonIcon from "@material-ui/icons/Person";
import AssignmentIndIcon from "@material-ui/icons/AssignmentInd";
import PhoneIcon from "@material-ui/icons/Phone";
import LocalHospitalIcon from "@material-ui/icons/LocalHospital";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import UpdateIcon from "@material-ui/icons/Update";
import ScheduleIcon from "@material-ui/icons/Schedule";
import TimelineIcon from "@material-ui/icons/Timeline";

const Transition = React.forwardRef((props, ref) => {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function RecordDialog(props) {
  const { onClose, open, rowData, onDelete } = props;
  const { t } = useTranslation();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog onClose={() => onClose(false)} open={open} TransitionComponent={Transition} fullScreen={fullScreen} fullWidth>
      {rowData ? (
        <>
          <DialogTitle>{`${t("record")}(${rowData.id})`}</DialogTitle>
          <DialogContent>
            <List>
              {[
                {
                  icon: PersonIcon,
                  primary: rowData.person.username || `${t("guest")}(${rowData.person.phone})`,
                  secondary: null,
                },
                {
                  icon: PhoneIcon,
                  primary: `${t("phone")}: ${rowData.person.phone}`,
                  secondary: null,
                },
                {
                  icon: AssignmentIndIcon,
                  primary: `${t("idNum")}: ${rowData.person.idNum}`,
                  secondary: null,
                },
                {
                  icon: LocalHospitalIcon,
                  primary: `${t("temperature")}: ${rowData.temperature}°C`,
                  secondary: null,
                },
                {
                  icon: TimelineIcon,
                  primary: `${t("stayTime")}: ${rowData.stayTime || t("null")}`,
                  secondary: null,
                },
                {
                  icon: rowData.verifiedDevice ? CheckIcon : ClearIcon,
                  primary: rowData.verifiedDevice ? t("verified") : t("notVerified"),
                  secondary: rowData.verifiedDevice
                    ? `${t("deviceID")}: ${rowData.verifiedDevice.id} ${t("comment")}: ${rowData.verifiedDevice.comment || t("null")}`
                    : null,
                },
                {
                  icon: UpdateIcon,
                  primary: `${t("leastUse")}: ${rowData.leastUse ? new Date(rowData.leastUse).toLocaleString() : t("null")}`,
                  secondary: rowData.leastUse ? `${t("useCount")}: ${rowData.useCount}` : null,
                },
                {
                  icon: ScheduleIcon,
                  primary: `${t("createdAt")}: ${new Date(rowData.createdAt).toLocaleString()}`,
                  secondary: null,
                },
              ].map((val, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar>
                      <val.icon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={val.primary} secondary={val.secondary} />
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                onDelete(rowData);
                onClose(false);
              }}
              color="secondary"
              variant="contained"
            >
              {t("delete")}
            </Button>
            <Button onClick={() => onClose(false)} color="primary" variant="contained">
              {t("goback")}
            </Button>
          </DialogActions>
        </>
      ) : (
        <></>
      )}
    </Dialog>
  );
}
