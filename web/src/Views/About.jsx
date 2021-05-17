import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import Fab from "@material-ui/core/Fab";
import { makeStyles } from "@material-ui/core/styles";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import { useHistory } from "react-router-dom";
import { dependencies } from "../../package.json";
import Avatar from "@material-ui/core/Avatar";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

const useStyles = makeStyles(theme => ({
  container: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(10),
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    paddingTop: theme.spacing(1),
  },
  subtitle: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  logomaker: {
    cursor: "pointer",
  },
  avatar: {
    width: 100,
    height: 100,
    marginLeft: "auto",
    marginRight: "auto",
    marginBottom: theme.spacing(2),
  },
  fab: {
    position: "fixed",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
  packages: {
    cursor: "pointer",
  },
}));
export default function About() {
  const classes = useStyles();
  const history = useHistory();
  return (
    <>
      <Container className={classes.container}>
        <Typography variant="h3">About</Typography>
        <Divider className={classes.divider} />
        <Typography variant="h4" className={classes.subtitle}>
          Made By
        </Typography>
        <Grid container spacing={2}>
          {[
            { name: "林宸毅 (Ian)", image: "https://avatars.githubusercontent.com/u/59338745", comment: "網頁開發及伺服器部屬" },
            { name: "陳明泉 (Ming)", image: "https://avatars.githubusercontent.com/u/67149274", comment: "伺服器部屬及文書處理" },
            { name: "段傳駿 (Jim)", image: "https://cdn.discordapp.com/attachments/768095170876014638/843744964411129867/1_2.JPG", comment: "硬體製作及文書處理" },
            { name: "李英禾 (Oniichan)", image: "https://cdn.discordapp.com/attachments/768095170876014638/843744327305265152/1_2.JPG", comment: "硬體製作及文書處理" },
          ].map((val, index) => (
            <Grid item lg={3} xs={12} key={index}>
              <Card>
                <CardContent>
                  <Avatar src={val.image} className={classes.avatar} />
                  <Typography variant="h6" align="center">
                    {val.name}
                  </Typography>
                  <Typography variant="subtitle1" align="center">
                    {val.comment}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Divider className={classes.divider} />
        <Typography variant="h4" className={classes.subtitle}>
          Special Thanks
        </Typography>
        <Grid container spacing={2}>
          {[
            { name: "崔守華", image: "https://cdn.discordapp.com/attachments/621641123999383561/843747851142168626/ff321e830a3b8ca4fd5b55a76b130b87.jpg", comment: "指導老師" },
            { name: "楊國慶", image: "https://cdn.discordapp.com/attachments/621641123999383561/843747758141079572/5bde98b81457c917066da5efbb11d323.jpg", comment: "班級導師" },
          ].map((val, index) => (
            <Grid item lg={3} xs={12} key={index}>
              <Card>
                <CardContent>
                  <Avatar src={val.image} className={classes.avatar} />
                  <Typography variant="h6" align="center">
                    {val.name}
                  </Typography>
                  <Typography variant="subtitle1" align="center">
                    {val.comment}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Typography variant="subtitle1" className={classes.logomaker} onClick={() => (window.location.href = "https://www.flaticon.com/authors/catkuro")}>
          Logo made by catkuro, Free for personal and commercial purpose with attribution.
        </Typography>
        <Typography variant="h4" className={classes.subtitle}>
          Builds with
        </Typography>
        <Divider className={classes.divider} />
        {Object.keys(dependencies).map((val, index) => (
          <Typography
            variant="body1"
            onClick={() => window.open(`https://www.npmjs.com/package/${val}`)}
            key={index}
            className={classes.packages}
          >
            {val}
          </Typography>
        ))}
      </Container>
      <Fab className={classes.fab} onClick={() => history.goBack()}>
        <ArrowBackIcon />
      </Fab>
    </>
  );
}
