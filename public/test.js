function chat() {
    let input = document.getElementById("user_input").value;
  //let id = document.getElementById("id_bot").value;
    console.log(input);
  //console.log(id);
    let myHeaders = new Headers();
			myHeaders.append('Content-Type', 'application/json');
			let payload = {
           			question:input
           	};
			let myBody = JSON.stringify(payload);
    console.log(myBody);
			let myInit = {
				method: 'POST',
           		headers: myHeaders,
           		mode: 'cors',
           		cache: 'default',
           		body:myBody
        	};
      let myURL = "https://botweb.hajijob.repl.co/54";

        	//launch the request
			fetch(myURL,myInit)
			.then((httpResponse)=>{
				return httpResponse.text();
			})
			.then((responseBody)=>{
        let botreponse = document.getElementById("output");
        botreponse.innerHTML = responseBody;
			})
			.catch((err)=>{
				console.log(`ERROR : ${err}`);
			});
		}