import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useAuth } from "../../Services/Auth";
import { getDevices, modifyDevice, deleteDevice, addDevice, downloadDevice } from "../../Services/API";
import DeviceTable from "../../Components/Admin/DeviceTable";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "../../Components/Admin/StyledPaper";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import AddDevice from "../../Components/Admin/AddDevice";
import Snackbar from "../../Services/Snackbar";

const useStyles = makeStyles(theme => ({
  title: {
    marginBottom: theme.spacing(2),
  },
  table: {
    marginBottom: theme.spacing(4),
  },
}));

export default function Search(props) {
  const { t } = useTranslation();
  const classes = useStyles();
  const [data, setData] = useState();
  const [openAdd, setOpenAdd] = useState(false);
  const { token } = useAuth();

  const fetch = () => {
    getDevices(token)
      .then(res => setData(res.data))
      .catch(err => Snackbar.error(t(err)));
  };

  const handleDelete = rowData => {
    deleteDevice(token, rowData.id)
      .then(() => setData(prev => prev.filter(x => x.id !== rowData.id)))
      .catch(err => Snackbar.error(t(err)));
  };

  const handleModify = data => {
    modifyDevice(token, data)
      .then(() => setData(prev => [...prev.filter(x => x.id !== data.id), data]))
      .catch(err => Snackbar.error(t(err)));
  };

  const handleAdd = data => {
    addDevice(token, data)
      .then(res => {
        setData(prev => [...prev, res.data]);
        downloadDevice(token, res.data.id);
      })
      .catch(err => Snackbar.error(t(err)));
  };

  useEffect(fetch, [token]);

  return (
    <div className={classes.table}>
      <Grid container className={classes.title}>
        <Grid item lg={10} xs={8}>
          <Typography variant="h5">{t("deviceList")}</Typography>
        </Grid>
        <Grid item lg={2} xs={4}>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} fullWidth onClick={() => setOpenAdd(true)}>
            {t("addDevice")}
          </Button>
        </Grid>
      </Grid>
      <Paper open={!data}>
        <DeviceTable
          title=""
          data={data}
          onDelete={handleDelete}
          onModify={handleModify}
          options={{
            pageSize: 10,
            pageSizeOptions: [10, 20, 50, 100],
          }}
        />
      </Paper>
      <AddDevice open={openAdd} onClose={() => setOpenAdd(false)} onAdd={handleAdd} />
    </div>
  );
}
