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
let listeBrains=[] ;
listeBrains.push({'name':"aiden"});
  listeBrains.push({'name':"bb"});
let username = "local-user";
let bot = new rivescript();
bot.loadFile("./public/brains/bb.rive").then(
  function(){
    bot.sortReplies();
  }
).catch(e => {console.log(e)});
let listeBots = [];
listeBots.push({'id':1,'name':'bot'+1,'status':'up','brain':'bb','bot':bot});
let bot2 = new rivescript();
bot2.loadFile("./public/brains/aiden.rive").then(
  function(){
    bot2.sortReplies();
  }
).catch(e => {console.log(e)});
listeBots.push({'id':2,'name':'bot'+2,'status':'up','brain':'aiden','bot':bot2})

app.get('/brains',(req,res)=>{
  console.log(listeBrains);
  res.status(200).json(listeBrains);
});
app.get('/bots',(req,res)=>{
  let reponseListe = [];
  listeBots.forEach(e => reponseListe.push({'id':e.id,'name':e.name,'status':e.status,'brain':e.brain,'url':'https://BotWeb.hajijob.repl.co/'+e.id+'/mouth'}));
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
app.get('/testBot',function(req,res){
  listeBots.find(e=> e.id==2).bot.getUservars().then(e => console.log(e));
  listeBots.find(e=> e.id==2).bot.getUservar('local-user','__history__').then(e=> console.log(e));
  listeBots.find(e=> e.id==2).bot.getUservar('local-user','__last_triggers__').then(e=> console.log(e));
  res.status(200).send("ok");
});

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
  listeBots.sort(function(a, b) {
  // Compare the 2 id
  if (a.id <b.id) return -1;
  if (a.id >b.id) return 1;
  return 0;
});
  let newid= listeBots[listeBots.length-1].id+1;
  console.log(newid);
    if(!(listeBots.find(e=>e.id==newid))){
    let temp = new rivescript();
  temp.loadFile("./public/bb.rive").then(
    function(){
      temp.sortReplies();
    }
  ).then(listeBots.push({'id':newid,'name':name,'status':status,'brain':'bb','bot':temp})).catch(e => {console.log(e)});
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

app.put('/:id', function(req,res) {
  if(listeBots.find(e=>e.id==req.params.id)){
    let id = req.params.id;
    let brain = req.body.brain;
    listeBots.splice(listeBots.findIndex(e=>e.id==id),1);
    console.log(id);
    console.log(brain);
    let temp = new rivescript();
    temp.stream(brain);
    temp.sortReplies();
    listeBots.push({'id':id,'bot':temp});
    res.status(201).send(reply);
  }
  res.status(404).Send("not found");
});

app.delete('/:id', function(req, res) {
  let id = req.params.id;
  listeBots.splice(listeBots.findIndex(e=>e.id==id),1);
});

app.patch('/:id', function(req, res) {
  console.log("coucou");
  console.log(req.params.id);
  if((listeBots.find(e=>e.id==req.params.id))){
    console.log("if");
    //let temp = listeBots.find(e=> e.id==req.params.id).bot;
    //temp.stream(req.body);
    console.log(req.body);
    /*temp.sortReplies();
    temp.write("./test.rive");*/
    res.status(200).send("ok");
}});

app.listen(port, () => {
  		console.log(`Example app listening at http://localhost:${port}`)
	});

