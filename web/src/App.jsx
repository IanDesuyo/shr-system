import React, { useState, useMemo, lazy, Suspense, Fragment } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import Index from "./Views/Index";
import { AuthContext } from "./Services/Auth";
import { SnackbarProvider } from "notistack";
import { SnackbarUtilsConfigurator } from "./Services/Snackbar";

const AdminIndex = lazy(() => import("./Views/Admin/Index"));
const About = lazy(() => import("./Views/About"));
const Terms = lazy(() => import("./Views/Terms"));

export default function App() {
  const [darkMode] = useState(true);
  const [token, setToken] = useState();
  const [config, setConfig] = useState({});

  const theme = useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: darkMode ? "dark" : "light",
        },
      }),
    [darkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <SnackbarUtilsConfigurator />
        <AuthContext.Provider value={{ token, setToken: setToken, config, setConfig: setConfig }}>
          <Router>
            <Suspense fallback={<Fragment />}>
              <Switch>
                <Route path="/admin" component={AdminIndex} />
                <Route path="/about" component={About} />
                <Route path="/terms" component={Terms} />
                <Route path="/" component={Index} />
              </Switch>
            </Suspense>
          </Router>
        </AuthContext.Provider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}
