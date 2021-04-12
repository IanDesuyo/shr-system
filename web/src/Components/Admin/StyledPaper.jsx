import Paper from "@material-ui/core/Paper";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import { withStyles } from "@material-ui/core/styles";

const StyledPaper = withStyles({
  root: {
    position: "relative",
  },
})(Paper);

const LimitedBackdrop = withStyles({
  root: {
    position: "absolute",
    zIndex: 1,
  },
})(Backdrop);

export default function CustomPaper(props) {
  const { open } = props;

  return (
    <StyledPaper>
      <LimitedBackdrop open={open}>
        <CircularProgress color="inherit" />
      </LimitedBackdrop>
      {props.children}
    </StyledPaper>
  );
}
