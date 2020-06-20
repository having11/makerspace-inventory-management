import React, {Suspense} from 'react';
import {MuiThemeProvider, CssBaseline} from '@material-ui/core';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import './App.css';
import theme from './theme';
import Root from './components/Root';
import Login from './components/Login';
import Register from './components/Register';
import Search from './components/Search';
import Explore from './components/Explore';
import EnsureLoggedInContainer from './components/EnsureLoggedInContainer';
import Admin from './components/Admin';
import Cart from './components/Cart';
import Checkin from './components/Checkin';
import User from './components/User';
import CircularProgress from '@material-ui/core/CircularProgress'

class App extends React.Component {
  render() {
    return (
    <BrowserRouter forceRefresh={false}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <Suspense fallback={<CircularProgress />}>
          <Switch>
            <Route exact path="/" component={Root} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/register" component={Register} />
            <Route exact path="/search" component={Search} />
            <Route path="/explore" component={Explore} />
            <Route component={EnsureLoggedInContainer}>
              <Route exact path="/admin" component={Admin} />
              <Route exact path="/cart" component={Cart} />
              <Route exact path="/checkin" component={Checkin} />
              <Route exact path="/user" component={User} />
            </Route>
          </Switch>
        </Suspense>
      </MuiThemeProvider>
    
    </BrowserRouter>
    )}
}

export default App;
