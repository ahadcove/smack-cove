import React from "react";
import { Switch, Route } from "react-router-dom";
import Run from './containers/run/run';
import Train from './containers/train/train';

export default function Routes() {
  return (
        <Switch>
          <Route path="/train">
            <Train />
          </Route>
          <Route path="/">
            <Run />
          </Route>
        </Switch>
  );
}
