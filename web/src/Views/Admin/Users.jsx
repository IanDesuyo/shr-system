import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useAuth } from "../../Services/Auth";
import { getUsers, deleteUser, modifyUser, addUser } from "../../Services/API";
import UserTable from "../../Components/Admin/UserTable";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "../../Components/Admin/StyledPaper";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import AddUser from "../../Components/Admin/AddUser";

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
    getUsers(token).then(res => setData(res.data));
  };

  const handleDelete = rowData => {
    deleteUser(token, rowData.id).then(() => setData(prev => prev.filter(x => x.id !== rowData.id)));
  };

  const handleModify = data => {
    modifyUser(token, data).then(() => setData(prev => [...prev.filter(x => x.id !== data.id), data]));
  };

  const handleAdd = data => {
    addUser(token, data).then(res => {
      setData(prev => [...prev, res.data]);
    });
  };

  useEffect(fetch, [token]);

  return (
    <div className={classes.table}>
      <Grid container className={classes.title}>
        <Grid item lg={10} xs={8}>
          <Typography variant="h5">{t("userList")}</Typography>
        </Grid>
        <Grid item lg={2} xs={4}>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} fullWidth onClick={() => setOpenAdd(true)}>
            {t("addUser")}
          </Button>
        </Grid>
      </Grid>
      <Paper open={!data}>
        <UserTable
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
      <AddUser open={openAdd} onClose={() => setOpenAdd(false)} onAdd={handleAdd} />
    </div>
  );
}
