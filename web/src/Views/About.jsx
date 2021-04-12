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
  avatar: {
    width: 100,
    height: 100,
    marginLeft: "auto",
    marginRight: "auto",
    marginBottom: theme.spacing(2),
  },
  fab: {
    position: "fixed ",
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
          Build By
        </Typography>
        <Grid container spacing={2}>
          {[
            { name: "Ian", image: "https://avatars.githubusercontent.com/u/59338745", comment: "簡介" },
            {
              name: "FoFo",
              image: "https://avatars.githubusercontent.com/u/67149274",
              comment: "簡介",
            },
            { name: "BallJim", image: "", comment: "簡介" },
            { name: "金主", image: "", comment: "簡介" },
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
            { name: "Mrs.崔", image: "", comment: "簡介" },
            { name: "Mr.楊", image: "", comment: "簡介" },
          ].map((val, index) => (
            <Grid item lg={3} xs={12} key={index}>
              <Card>
                <CardContent>
                  <Avatar src={val.image} className={classes.avatar} />
                  <Typography variant="h6" align="center">
                    {val.name}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
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
