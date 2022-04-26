import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import {Low, JSONFile} from 'lowdb';
import rivescript from 'rivescript';
const app = express();
app.use(cors()); // Enable ALL CORS request
const port = 3001

app.use(bodyParser.json()) 
app.use(bodyParser.urlencoded({ extended: true })) 
app.use(express.static('public'))

const adapter = new JSONFile("./model/db.json");
let db = new Low(adapter);
await db.read();
db.data = db.data || { Mouths: [] };

let username = "local-user";
let bot = new rivescript();
bot.loadFile("./public/brain.rive").then(loading_done).catch(e => {console.log(e)});

let listeBots = [];
listeBots.push({'id':1,'bot':bot});
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


app.get('/bots',(req,res)=>{
  let reponseListe = [];
  listeBots.forEach(e => reponseListe.push({'id':e.id,'url':'https://BotWeb.hajijob.repl.co/'+e.id}));
  res.status(200).json(reponseListe);
});

//End point to get all the tasks
app.get('/', (req, res)=>{
	try{
    let json_var = {'test':'oui'};
		res.sendFile('index.html', { root: '.' })

	}
	catch(err){
		console.log(`Error ${err} thrown`);
		res.status(404).send('NOT FOUND');
	}
});

const template = (text) => {
return `
 <!DOCTYPE html>
 <html>
   <head>
    <title>chatbot</title>
<script type="text/javascript" src="./test.js"></script>
</head>

<body>

	<h1>chatbot ${text}</h1>

	<p>
		say: <input id="user_input" />
		<button id="submit" onclick=chat(${text})>submit</button>
	</p>

	<p>
		reply: <span id="output"></span>
	</p>

  <img src='./chat.jpeg'></img>

</body>

</html>`;
}

app.get('/:id', function(req, res) {
     let id = req.params.id;
  if(listeBots.find(e => e.id==id)){
    res.send(template(id));
  }
  else{
    console.log('yo');
    res.status(404).send('not found');
  }
});

app.post('/:id', function(req, res) {
  let id = req.params.id;
  let question = req.body.question;
  console.log(id);
  console.log(question);
  listeBots.find(e => e.id==id).bot.reply(username,question).then(function(reply) {
    console.log("The bot says: " + reply);
   res.status(201).send(reply);
    });
  
});

app.listen(port, () => {
  		console.log(`Example app listening at http://localhost:${port}`)
	});
