import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { FirebaseService } from './firebase.service';

const firebaseService = new FirebaseService();
const root = ReactDOM.createRoot(document.getElementById('root'));
firebaseService.getQuestionsForCurrentUser(3)
  .then(questions => {
    root.render(
      <React.StrictMode>
        <App rootElement={root}
          questions={questions}
          firebaseService={firebaseService}
        />
      </React.StrictMode>
    );
  })
  .catch(err => {
    console.log("###### ERR", err);
  });

