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
//db.data = db.data || { Mouths: [] };

let listeBrains=[] ;
listeBrains.push({'name':"aiden"});
  listeBrains.push({'name':"bb"});
  listeBrains.push({'name':"tonton"});
listeBrains.push({"name":"standard"});
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
let bot3 = new rivescript();
bot3.loadFile("./public/brains/tonton.rive").then(
  function(){
    bot3.sortReplies();
  }
).catch(e => {console.log(e)});
listeBots.push({'id':3,'name':'bot'+3,'status':'up','brain':'tonton','bot':bot3});

let listeBouches = [];
listeBouches.push({'id':1,'name':'bouche'+1,'botID':'none'});


app.get('/brains',(req,res)=>{
  res.status(200).json(listeBrains);
});

//section ------bouches --------
app.get('/bouches',(req,res)=>{
  res.status(200).json(listeBouches);
});
app.post('/bouche/:id',(req,res)=>{
  let id = req.params.id;
  let question = req.body.question;
  let login = req.body.login;
  let botID = listeBouches.find(e => e.id==id).botID;
  if(botID !=='none'){
    listeBots.find(e => e.id==botID).bot.reply(login,question).then(function(reply) {
    console.log("The bot says: " + reply);
   res.status(201).send(reply);
    }).catch(e => {console.log(e)});
  }
  else{
     res.status(404).send("this mouth is not linked");
  }
  
});
app.get('/bouche/:id',(req,res)=>{ 
  let id = req.params.id;
  if(listeBots.find(e => e.id==id)){
    let e = listeBots.find(e => e.id==id).bot;
    res.send(template("bouche",id));
  }
  else{
    res.status(404).send('not found');
  }
});
app.post('/bouches', function(req,res) { 
  listeBouches.sort(function(a, b) {
  // Compare the 2 id
  if (a.id <b.id) return -1;
  if (a.id >b.id) return 1;
  return 0;
});
  let newid= (listeBouches[listeBouches.length-1].id);
  newid++;
  listeBouches.push({'id':newid,'name':req.body.name,'botID':'none'});
  res.status(201).send("done");
});
app.delete('/bouche/:id',(req,res)=>{
  let id = req.params.id; 
try{ listeBouches.splice(listeBouches.findIndex(e=>e.id==id),1);
res.status(201).send("done");
}
catch(e){
  console.log(e);
  res.status(404).send("not found");
}
});
app.put('/bouche/:id', function(req,res) { 
  let id = req.params.id;
    let botid = req.body.botID;
  if(listeBouches.find(e=>e.id==req.params.id)){
    listeBouches.find(e=>e.id==req.params.id).botID=botid;
    if(botid !=='none'){
    listeBots.find(e=>e.id==botid).status='linked';
  }
    else{
    listeBots.find(e=>e.id==botid).status='unlinked';
    }
  }
});
//-------------fin bouches --------------

app.get('/bots',(req,res)=>{
  let reponseListe = [];
  listeBots.forEach(e => reponseListe.push({'id':e.id,'name':e.name,'status':e.status,'brain':e.brain,'url':'https://BotWeb.hajijob.repl.co/'+e.id+'/mouth'}));
  res.status(200).json(reponseListe);
});

//End point to get all the tasks
app.get('/', (req, res)=>{
	try{
		res.sendFile('index.html', { root: '.' })

	}
	catch(err){
		console.log(`Error ${err} thrown`);
		res.status(404).send('NOT FOUND');
	}
});

const template = (name,text) => {
return `
 <!DOCTYPE html>
 <html>
   <head>
    <title>chatbot</title>
<script type="text/javascript" src="../test.js"></script>
<script>
function login(){
  let login = prompt("Please enter your name:", "coucou");
let elt = document.getElementById("login");
elt.value = login;
}
</script>
</head>

<body onload="login()">

	<h1>${name} ${text}</h1>
<input type="hidden" id="login"></input>

	<p>
		say: <input id="user_input" />
		<button id="submit" onclick=${name}(${text})>submit</button>
	</p>

	<p>
		reply: <span id="output"></span>
	</p>

  <img src='../business.jpg'></img>

</body>

</html>`;
}

app.post('/mouth/:id',function(req,res){
  
});


app.get('/test', function(req, res) {
  listeBots.find(e=> e.id==2).bot.stream(listeBots.find(e=>e.id==1).bot.stringify());
  listeBots.find(e=> e.id==1).bot.sortReplies();
 /* listeBots.find(e=>e.id==1).bot.write("./test1.rive");*/
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
app.get('/:id/data', function(req, res) {  try{listeBots.find(e=> e.id==req.params.id).bot.getUservars().then(e => {
  res.status(200).send(e);
}).catch(e => console.log(e)); }catch(e){
   console.log(e);                                        res.status(404).send("not found");}
  
});
app.get('/:id/mouth', function(req, res) {
     let id = req.params.id;
  if(listeBots.find(e => e.id==id)){
    let e = listeBots.find(e => e.id==id).bot;
    res.send(template("chat",id));
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
  let newid= listeBots[listeBots.length-1].id;
    newid++;
    if(!(listeBots.find(e=>e.id==newid))){
   let temp = new rivescript(); 
      let brain = "standard";
      temp.loadFile("./public/brains/"+brain+".rive").then(
  function(){
    temp.sortReplies();
  }
).catch(e => {console.log(e)});
listeBots.push({'id':newid,'name':req.body.name,'status':req.body.status,'brain':brain,'bot':temp}).catch(e => {console.log(e)});
    }
});

app.post('/:id', function(req, res) {
  let id = req.params.id;
  let question = req.body.question;
  let login = req.body.login;
  console.log(id);
  console.log(question);
  listeBots.find(e => e.id==id).bot.reply(login,question).then(function(reply) {
    console.log("The bot says: " + reply);
   res.status(201).send(reply);
    }).catch(e => {console.log(e)});
  
});

app.put('/:id', function(req,res) { 
  let id = req.params.id;
    let brain = req.body.brain;
  if(listeBots.find(e=>e.id==req.params.id)){
    
   let bot = listeBots.find(e=>e.id==id); listeBots.splice(listeBots.findIndex(e=>e.id==id),1);
   
    let temp = new rivescript();
    temp.loadFile("./public/brains/"+brain+".rive").then(function(){
    temp.sortReplies();
    });
    listeBots.push({'id':id,'name':bot.name,'status':bot.status,'brain':brain,'bot':temp});
    res.status(201).send(reply);
  }
  res.status(404).send("not found");
});

app.delete('/:id', function(req, res) {
  let id = req.params.id;
  listeBots.splice(listeBots.findIndex(e=>e.id==id),1);
});

app.patch('/:id', function(req, res) {

  if((listeBots.find(e=>e.id==req.params.id))){
    listeBots.find(e=>e.id==req.params.id).name=req.body.name;
    listeBots.find(e=>e.id==req.params.id).status=req.body.status;
    if(req.body.status ==='unlinked'){
      listeBouches.find(e=>e.botID==req.params.id).botID='none';
    }
    res.status(200).send("ok");
}
  else{
    res.status(404).send("not found")
  }
});

app.listen(port, () => {
  		console.log(`Example app listening at http://localhost:${port}`)
	});

