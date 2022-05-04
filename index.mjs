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
bot.loadFile("./public/brains/bb.rive").then(
  function(){
    bot.sortReplies();
  }
).catch(e => {console.log(e)});

let listeBots = [];
listeBots.push({'id':1,'bot':bot});
let bot2 = new rivescript();
bot2.loadFile("./public/brains/aiden.rive").then(
  function(){
    bot2.sortReplies();
  }
).catch(e => {console.log(e)});
listeBots.push({'id':2,'bot':bot2})


app.get('/bots',(req,res)=>{
  let reponseListe = [];
  listeBots.forEach(e => reponseListe.push({'id':e.id,'url':'https://BotWeb.hajijob.repl.co/'+e.id+'/mouth'}));
  console.log(listeBots);
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
<script type="text/javascript" src="../test.js"></script>
</head>

<body>

	<h1>Chatbot ${text}</h1>

	<p>
		say: <input id="user_input" />
		<button id="submit" onclick=chat(${text})>submit</button>
	</p>

	<p>
		reply: <span id="output"></span>
	</p>

  <img src='../chat.jpeg'></img>

</body>

</html>`;
}

app.get('/test', function(req, res) {
  listeBots.find(e=> e.id==1).bot.stream(listeBots.find(e=>e.id==2).bot.stringify());
  listeBots.find(e=> e.id==1).bot.sortReplies();
  listeBots.find(e=>e.id==1).bot.write("./test1.rive");
  res.status(200).send("ok");
});

app.get('/:id', function(req, res) {
     let id = req.params.id;
  if(listeBots.find(e => e.id==id)){
    res.status(200).send(listeBots.find(e => e.id==id).bot.stringify());
  }
  else{
    res.status(404).send("not found");
  }
});

app.get('/:id/mouth', function(req, res) {
     let id = req.params.id;
  if(listeBots.find(e => e.id==id)){
    let e = listeBots.find(e => e.id==id).bot;
    console.log("avant");
    e.write("./public/test.rive");
    console.log("après");
    res.send(template(id));
  }
  else{
    res.status(404).send('not found');
  }
});

app.post("/", function(req, res) {
  if(typeof req.body.id == 'number'){
    if(!(listeBots.find(e=>e.id==req.body.id))){
    let temp = new rivescript();
  temp.loadFile("./public/brain.rive").then(
    function(){
      temp.sortReplies();
    }
  ).then(listeBots.push({'id':req.body.id,'bot':temp})).catch(e => {console.log(e)});
    }
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
    }).catch(e => {console.log(e)});
  
});

app.delete('/:id', function(req, res) {
  let id = req.params.id;
  listeBots.splice(listeBots.findIndex(e=>e.id==id),1);
});

app.listen(port, () => {
  		console.log(`Example app listening at http://localhost:${port}`)
	});

