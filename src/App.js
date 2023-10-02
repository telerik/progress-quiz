import React, { useState } from 'react';
import { Survey } from 'survey-react-ui';
import 'survey-core/modern.min.css';
import { StylesManager, Model } from 'survey-core';
import './App.css';

function App(args) {
  const questions = args.questions;
  const firebaseService = args.firebaseService;

  const surveyValueChanging = function (sender, options) {
    if (options && options.question && options.question.name === 'Email') {
      options.value = (options.value || "").trim();
    }

  }
  const surveyValidateQuestion = function (s, options) {
    if (options && options.question && !options?.question?.isAnswerCorrect()) {
      if (!options.question.isAnswerCorrect()) {
        localStorage.setItem("cannotGetAdditionalPrize", true);
        options.error = "Incorrect answer!"
      }
    }

    if (options && options.question && options.question.name === 'Email') {
      options.value = (options.value || "").trim();
      const re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()=[\]\.,;:\s@\"]+\.)+[^<>()=[\]\.,;:\s@\"]{2,})$/i;
      if (!re.test(options.value)) {
        options.error = "Please enter valid email!";
      }
    }
  }

  const surveyJson = {
    "title": "Progress quiz",
    "description": "Test your knowledge and win some cool prizes",
    "logo": "https://www.progress.com/favicon.ico?v=2",
    "logoWidth": 60,
    "logoHeight": 60,
    completedHtml: `<h3 id="completionHtml">Thank you for completing the quiz! Show this screen to the Progress team and get your special prize.</h3>`,
    hideNumbers: true,
    pages: [
      // {
      //   elements: [
      //     {
      //       name: "Top",
      //       type: "html",
      //       html: `<h3>Enter the details below, complete the survey and show the NEXT screen to the Progress team and get your special prize!</h3>`
      //     },
      //     {
      //       name: "Email",
      //       title: "Email",
      //       type: "text",
      //       isRequired: true,
      //       hideNumber: true
      //     },
      //     {
      //       name: "Name",
      //       title: "Enter your name:",
      //       type: "text",
      //       hideNumber: true
      //     },
      //     {
      //       name: "ReceiveEmails",
      //       title: "With your permission we may also use your personal data for recruitment & related newsfeed purposes, which include contacting you by email with information, news, and job opportunities.",
      //       type: "radiogroup",
      //       hideNumber: true,
      //       choices: [
      //         "Yes",
      //         "No"
      //       ],
      //       defaultValue: "Yes"
      //     },
      //   ]
      // }
    ]
  };

  for (const questionId in questions) {
    const question = questions[questionId];
    const choices = [];

    // Uncomment when using the devBgQuestions
    // Object.keys(question.answers).forEach((key) => {
    //   choices.push({
    //     value: key,
    //     text: `<img src="data:image/png;base64,${question.answers[key]}"/>`
    //   });
    // });

    choices.push(...Object.values(question.answers));

    const generateImageTagFromParts = (obj) => {
      const res = Object.values(obj).map(p => `<img src="data:image/png;base64,${p}"/>`).join("\n");
      return res;
    };

    surveyJson.pages.unshift({
      elements: [{
        hideNumber: true,
        type: question.questionType === "chooseLanguage" ? "dropdown" : "radiogroup",
        name: questionId,
        // colCount: 4,
        title: `${question.question}${question.codeblock ? `
<div id="codeblock" class="codeblock">
<pre>
<code>
${question.codeblock}
</code>
</pre>
</div>` : ''}${question.questionParts ? `
<div>
${generateImageTagFromParts(question.questionParts)}
</div>`
            : ''}`,
        choices,
        correctAnswer: question.correctAnswer
      }]
    });
  }

  StylesManager.applyTheme("modern");

  const survey = new Model(surveyJson);
  survey.onCompleting.add((args) => {
    const surveyData = args.data;
    const userData = {
      email: surveyData.Email,
      name: surveyData.Name || "Empty",
      agreeToReceiveEmails: surveyData.ReceiveEmails || "Yes",
      answeredQuestions: {},
      dateTime: Date.now()
    };

    let keys = Object.keys(surveyData);
    keys = keys.filter(k => k !== "Email" && k !== "Name" && k !== "ReceiveEmails");

    for (let i = 0; i < keys.length; i++) {
      userData.answeredQuestions[i] = keys[i];
    }

    // this call is async
    // firebaseService.writeNewUser(userData);
  });

  // Create showdown markdown converter
  const converter = new window.showdown.Converter();
  survey.onTextMarkdown.add(function (survey, options) {
    // convert the markdown text to html
    let str = converter.makeHtml(options.text).trim();
    // remove root paragraphs <p></p>
    if (str.startsWith("<p>") && str.endsWith("</p>")) {
      str = str.substring(3);
      str = str.substring(0, str.length - 4);
    }

    // set html
    options.html = str;
  });

  survey.onComplete.add((sender, a) => {
    if (!localStorage.getItem("cannotGetAdditionalPrize")) {
      setTimeout(() => {
        document.querySelector('#completionHtml').textContent = "Congrats on completing the quiz on the first try! Show this screen to the Progress team to get an additional prize.";
        document.querySelector(".sv-body.sv-completedpage").style.backgroundColor="#5CE500"
      }, 100);

      localStorage.setItem("cannotGetAdditionalPrize", true);
    }
  });

  return (
    <div id="appSurvey" className="App">
      <Survey
        model={survey}
        onValidateQuestion={surveyValidateQuestion}
        onValueChanging={surveyValueChanging}
      />;
    </div>
  );
}

export default App;
