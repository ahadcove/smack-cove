import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Routes from './routes';
import Nav from './components/nav/nav';
import './App.css';

export default function App() {
  return (
    <Router>
			<Nav />
			<Routes />
    </Router>
  );
}
