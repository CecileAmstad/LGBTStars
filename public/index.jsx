import React from 'react';
import ReactDOM from 'react-dom';

import App from "./components/App.jsx"

function bootstrap() {
  let app = document.createElement('div');
  document.body.appendChild(app);
  ReactDOM.render(<App />, app);
}

bootstrap();