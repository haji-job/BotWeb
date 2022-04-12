//import express from 'express';
//import bodyParser from 'body-parser';
//import cors from 'cors';
 let username = "local-user";
let bot = new RiveScript();
bot.loadFile("./brain.rive").then(loading_done).catch(e => {console.log(e)});
function loading_done() {
  console.log("Bot has finished loading!");

  // Now the replies must be sorted!
  bot.sortReplies();


  // RiveScript remembers user data by their username and can tell
  // multiple users apart.

  // NOTE: the API has changed in v2.0.0 and returns a Promise now.
  bot.reply(username, "Hello, bot!").then(function(reply) {
    console.log("The bot says: " + reply);
  });
}


  function chat() {
    let input = document.getElementById("user_input").value;
    console.log(input);
    bot.reply(username,input).then(function(reply) {
    console.log("The bot says: " + reply);
      let botreponse = document.getElementById("output");
      botreponse.innerHTML = reply;
    });
  }
