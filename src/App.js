import React, { useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Routes from './routes';
import Nav from './components/nav/nav';
import './App.css';
import { Interval, Clear } from "bettertimers";
import ReactGA from 'react-ga';
import Footer from "./components/footer/footer";
ReactGA.initialize('UA-161994278-2');
ReactGA.pageview(window.location.pathname + window.location.search);

let favInterval;

export default function App() {
  const [favCount, setFavCount] = useState(1);

  useEffect(() => {
    favInterval = new Interval(() => {
      let newFavCount = favCount + 1;
      if (newFavCount > 4) {
        newFavCount = 1;
      }
      setFavCount(newFavCount);

      const favicon = document.getElementById('favicon');
      favicon.href = `favicon${newFavCount}.png`;
    }, 500);
    return () => {
      Clear(favInterval);
    }
  }, [favCount]);

  return (
    <Router>
			<Nav />
			<Routes />
			<Footer />
    </Router>
  );
}
