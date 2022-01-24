import ReactDOM from "react-dom";
//import './index.css'
import "./styles/global.css";
import UAuth from "@uauth/js";
import { Button } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Redirect,
  Route,
  RouteProps,
  Switch,
} from "react-router-dom";
import Navhan from "./Nav";
//import App from './index'
require("dotenv").config();

const uauth = new UAuth({
  // These can be copied from the bottom of your app's configuration page on unstoppabledomains.com.
  clientID: "E3TV8fEapWmt8oRcC5QZQoFZRCI5yKjRqwbpy2RP7rg="!,
  clientSecret: "6QkjmhOh8nHnjyosuh7ctXZJtcxOrxx7lAnoYag+Baw="!, //process.env.REACT_APP_CLIENT_SECRET,

  // These are the scopes your app is requesting from the ud server.
  scope: "openid wallet",

  // This is the url that the auth server will redirect back to after every authorization attempt.
  redirectUri: "http://localhost:3000/callback"!,

  // This is the url that the auth server will redirect back to after logging out.
  postLogoutRedirectUri: "http://localhost:3000/login"!,
});

const Home: React.FC<RouteProps> = (props) => {
  const [redirectTo, setRedirectTo] = useState<string>();

  useEffect(() => {
    // Try to access the id_token inside `window.localStorage`
    uauth
      .user()
      // User is inside cache, redirect to the profile page.
      .then((user) => {
        console.log("user ->", user);
        setRedirectTo("/profile");
      })
      // User is not inside cache, redirect to the login page.
      .catch((error) => {
        console.error(error);
        setRedirectTo("/login");
      });
  }, []);

  if (redirectTo) {
    return <Redirect to={redirectTo} />;
  }

  return (
    <>
      {" "}
      <h1 className="text-3xl flex flex-wrap justify-center items-center h-screen">
        Loading...
      </h1>
      <h1 className="text-3xl flex flex-wrap justify-center items-center h-screen">
        Logging in...
      </h1>
    </>
  );
};

const Login: React.FC<RouteProps> = (props) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(
    new URLSearchParams(props.location?.search || "").get("error")
  );

  const handleLoginButtonClick: React.MouseEventHandler<HTMLButtonElement> = (
    e
  ) => {
    setErrorMessage(null);
    uauth.login().catch((error) => {
      console.error("login error:", error);
      setErrorMessage("User failed to login.");
    });
  };

  return (
    <>
      <div className=" bg-gray-500 h-screen">
        <div className="flex justify-center items-center">
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <div>
            <h1 className="flex justify-center items-center text-6xl font-extrabold">
              NFT HOUSE
            </h1>
            <br />
            <br />

            <h1 className="text-3xl">Access NFT with your UD domain</h1>
          </div>
        </div>
        <div className="flex flex-wrap justify-center items-center ">
          {errorMessage && <div>Message: {errorMessage}</div>}
          <br></br>
        </div>

        <div className="flex flex-wrap justify-center items-center ">
          <br></br>
          <br></br>
          <Button
            style={{
              width: "250px",
              height: "50px",
            }}
            variant="contained"
            color="primary"
            onClick={handleLoginButtonClick}
            className=""
          >
            <p className="text-xl text-black"> View NFT HOUSE</p>
          </Button>
        </div>
      </div>
    </>
  );
};

const Callback: React.FC<RouteProps> = (props) => {
  const [redirectTo, setRedirectTo] = useState<string>();

  useEffect(() => {
    // Try to exchange authorization code for access and id tokens.
    uauth
      .loginCallback()

      // Successfully logged and cached user in `window.localStorage`
      .then((response) => {
        console.log("sucess");
        console.log("loginCallback ->", response);
        setRedirectTo("/profile");
      })
      // Failed to exchange authorization code for token.
      .catch((error) => {
        console.error("callback error:", error);
        setRedirectTo("/login?error=" + error.message);
      });
  }, []);

  if (redirectTo) {
    return <Redirect to={redirectTo} />;
  }

  return (
    <>
      {" "}
      <br></br>
      <h1 className="text-3xl flex flex-wrap justify-center items-center h-screen">
        Logging in...
      </h1>
    </>
  );
};

const Profile: React.FC<RouteProps> = () => {
  const [left, setleft] = useState(70);
  const [user, setUser] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string>();

  useEffect(() => {
    uauth
      .user()
      .then(setUser)
      .catch((error) => {
        console.error("profile error:", error);
        setRedirectTo("/login?error=" + error.message);
      });
  }, []);

  const handleLogoutButtonClick: React.MouseEventHandler<HTMLButtonElement> = (
    e
  ) => {
    console.log("logging out!");
    setLoading(true);
    uauth
      .logout({
        beforeRedirect(url: string) {
          // alert(url)
        },
      })
      .catch((error) => {
        console.error("profile error:", error);
        setLoading(false);
      });
  };

  if (redirectTo) {
    return <Redirect to={redirectTo} />;
  }

  if (!user || loading) {
    return (
      <>
        <h1 className="text-3xl flex flex-wrap justify-center items-center h-screen">
          Logging out...
        </h1>
      </>
    );
  }

  return (
    <>
      {console.log(JSON.stringify(user, null, 2))}

      <div className="overflow-visible">
        <div className="flex flex-row">
          <Button
            style={{
              borderRadius: "0",
              maxHeight: "32px",
              position: "absolute",
              left: "92%",
            }}
            variant="contained"
            color="primary"
            onClick={handleLogoutButtonClick}
            className="w-28"
          >
            Logout
          </Button>

          <p
            style={{ position: "relative", left: `${left}%` }}
            className="text-2xl"
          >
            Logged in as:<strong> {user.sub} </strong>
          </p>
        </div>
      </div>
      <div>
        <Navhan />
      </div>
      {/*<MyApp Component={undefined} pageProps={undefined}/>*/}
      {/*<pre>{JSON.stringify(user, null, 2)}</pre>*/}
    </>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/callback" component={Callback} />
        <Route path="/profile" component={Profile} />
        <Route path="/" component={Home} />
      </Switch>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
