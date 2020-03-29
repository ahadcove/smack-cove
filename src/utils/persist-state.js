import React, { useEffect } from 'react';

export default function usePersistedState(key, defaultValue) {
  const [state, setState] = React.useState(
    () => {
			try {
				return JSON.parse(localStorage.getItem(key));
			} catch (e) {
				return localStorage.getItem(key) || defaultValue;
			}
		}
  );
  useEffect(() => {
		if (typeof state === 'object') {
    	localStorage.setItem(key, JSON.stringify(state));
		} else {
    	localStorage.setItem(key, state);
		}
  }, [key, state]);
  return [state, setState];
}
