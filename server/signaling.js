function signaling(server) {	
	var io = require('socket.io')(server);
    var shortid = require('shortid');	
	var users = {};	
	var ControleAtendimento = require('./ControleAtendimentos');


	ControleAtendimento.on('lista-espera-changed', function() {
		io.emit('lista-espera');
	});

	io.on('connection', function(socket) {
	    var newId = shortid.generate();
        console.log(newId+' entrou');		
		users[newId] = {"socket": socket};	    
	    socket.emit('entrar' , JSON.stringify({"nomeLogado":newId}));	
		socket.username = newId;	  
	    //io.emit('lista', JSON.stringify(Object.keys(users)));
        
  		function removeUser(user) {
		  console.log(user+' saiu.');
		  ControleAtendimento.removeChamadosBySocket(user);
		  delete users[user];
		  //io.emit('lista', JSON.stringify(Object.keys(users)));
		}
		
	  socket.on('disconnect', function(data) {
		  removeUser(socket.username);
	  });	 	
	  
	  socket.on('sair', function(data) {
		 removeUser(data); 
	  });

	  console.log('usuario conectou');
	//   socket.on('entrar', function(msg) {
	// 	  if (users[msg]) {
	// 		  socket.emit('entrar',JSON.stringify({"error":"Usuario "+msg+" já existe!"}));			  			  
	// 		  return;
	// 	  }
	//     console.log(msg+' entrou');		
	// 	users[msg] = {"socket": socket};	    
	//     socket.emit('entrar' , JSON.stringify({"nomeLogado":msg}));	
	// 	socket.username = msg;	  
	//     io.emit('lista', JSON.stringify(Object.keys(users)));
	//   });
	  
	  socket.on('chamada', function(msg) {
		  var chamada = JSON.parse(msg);		  
		  if (users[chamada.para]) {
			  users[chamada.para].socket.emit('chamada', msg);
			  console.log("Mensagem enviada de "+chamada.dados.de+" para "+chamada.para);			  
		  } else {
			  chamada.error = "Usuário não encontrado!";
			  socket.emit("chamada", JSON.stringify(chamada));
		  }
	  })
	});
	return io;	
}
module.exports = signaling;