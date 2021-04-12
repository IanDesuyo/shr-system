import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { useState, useEffect } from "react";
import { useAuth } from "../../Services/Auth";
import { fetchByDate, fetchByPhone, fetchByID, deleteRecord } from "../../Services/API";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import SearchTable from "../../Components/Admin/SearchTable";
import Snackbar from "../../Services/Snackbar";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";

const useStyles = makeStyles(theme => ({
  searchBar: {
    marginBottom: theme.spacing(4),
  },
  search: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
  },
  table: {
    marginBottom: theme.spacing(4),
  },
}));

export default function Search(props) {
  let { searchType } = useParams();
  const { t } = useTranslation();
  const classes = useStyles();
  let now = new Date();
  let today = `${now.getFullYear()}-${("0" + (now.getMonth() + 1)).slice(-2)}-${("0" + now.getDate()).slice(-2)}`;
  const [date1, setDate1] = useState(today + "T00:00");
  const [date2, setDate2] = useState(today + "T23:59");
  const [dateType, setDateType] = useState("createdAt");
  const [value, setValue] = useState("");
  const [data, setData] = useState();
  const [title, setTitle] = useState();
  const { token } = useAuth();

  const handleSearch = e => {
    e.preventDefault();
    if (searchType === "date") {
      let sarariSupport1 = date1.replace(/-/g, "/").replace("T", " ");
      let sarariSupport2 = date2.replace(/-/g, "/").replace("T", " ");
      fetchByDate(token, sarariSupport1, sarariSupport2, dateType)
        .then(res => {
          setData(res.data);
          setTitle(`${new Date(sarariSupport1).toLocaleTimeString()}~${new Date(sarariSupport2).toLocaleTimeString()}${t("sresult")}`);
        })
        .catch(err => Snackbar.error(t(err)));
      return;
    } else if (searchType === "phone") {
      fetchByPhone(token, value.replace(" ", "").split(";"))
        .then(res => setData(res.data))
        .catch(err => Snackbar.error(t(err)));
    } else if (searchType === "idNum") {
      fetchByID(token, value.replace(" ", "").split(";"))
        .then(res => setData(res.data))
        .catch(err => Snackbar.error(t(err)));
    }
  };

  const handleDelete = rowData => {
    deleteRecord(token, rowData.id)
      .then(() => {
        Snackbar.success("Deleted");
        setData(prev => prev.filter(x => x.id !== rowData.id));
      })
      .catch(err => Snackbar.error(t(err)));
  };

  useEffect(() => {
    setData(null);
  }, [searchType]);

  useEffect(() => {
    setTitle(`${value}${t("sresult")}`);
  }, [data, t]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Typography variant="h5">
        {searchType === "date" ? t("searchByDate") : searchType === "idNum" ? t("searchByID") : t("searchByPhone")}
      </Typography>
      <form onSubmit={handleSearch} className={classes.searchBar}>
        <Grid container spacing={2} align="center" justify="center" alignItems="center">
          {searchType === "date" ? (
            <>
              <Grid item lg={4} xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="start"
                  label={t("dateStart")}
                  name="start"
                  type="datetime-local"
                  onChange={e => setDate1(e.target.value)}
                  value={date1}
                />
              </Grid>
              <Grid item lg={4} xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="end"
                  label={t("dateEnd")}
                  name="end"
                  type="datetime-local"
                  onChange={e => setDate2(e.target.value)}
                  value={date2}
                />
              </Grid>
              <Grid item lg={2} xs={6}>
                <Select variant="outlined" value={dateType} onChange={e => setDateType(e.target.value)} fullWidth required>
                  {["createdAt", "leastUse", "stayAt"].map((val, index) => (
                    <MenuItem value={val} key={index}>
                      {t(val)}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
            </>
          ) : (
            <Grid item lg={8} xs={12}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="value"
                label={t(searchType)}
                name="value"
                onChange={e => setValue(e.target.value)}
                value={value}
                placeholder={t("hits.multiSearch")}
              />
            </Grid>
          )}
          <Grid item lg={2} xs={6}>
            <Button variant="contained" color="primary" type="submit" startIcon={<SearchIcon />} fullWidth>
              {t("submit")}
            </Button>
          </Grid>
        </Grid>
      </form>
      {data ? (
        <div className={classes.table}>
          <SearchTable
            title={title}
            data={data}
            onDelete={handleDelete}
            options={{
              pageSize: 10,
              pageSizeOptions: [10, 20, 50, 100],
            }}
          />
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
