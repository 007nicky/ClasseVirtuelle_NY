const chatForm = document.getElementById('msg-input');
const chatMessages = document.querySelector('.messages')
const nomC = document.getElementById('nomClasse')    
const ul = document.getElementById('userList')     
const ula = document.getElementById('userListAll')


//Recuperer le nom du prof et la classe a partir du url
const{utilisateur, classe} = Qs.parse(location.search, {
    ignoreQueryPrefix:true //Sauf les caracteres speciaux
})

const socket = io();

//Envoyer le le nom du prof et la classe recuperés
// du Url au serveur
socket.emit("joindreProf", {utilisateur, classe});

//Liste d'eleves provenant de python
socket.on('listEleves', ({classe, eleves}) => {
    listeElevesClasse(eleves);
})

//Recuperer les participants connectés et la classe
socket.on('classe', ({classe, eleves}) => {
    console.log(eleves);
    nomClasse(classe);
    listeElevesConnectes(eleves);
});

//Message du serveur
socket.on('message', message =>{
    afficheMessage(message);

    //Quand on recoit un nouveau message, aller a ce message
    chatMessages.scrollTop = chatMessages.scrollHeight;    
});

//Message eleve du serveur
socket.on('messageEleve', message =>{
    afficheMessageEleve(message);

    //Quand on recoit un nouveau message, aller a ce message
    chatMessages.scrollTop = chatMessages.scrollHeight;    
});

//Message eleve du serveur
socket.on('messageProf', message =>{
    afficheMessage(message);

    //Quand on recoit un nouveau message, aller a ce message
    chatMessages.scrollTop = chatMessages.scrollHeight;    
});

//Message du serveur quand un eleve se connecte/deconnecte
socket.on('nouvelU', message =>{
    messageConnection(message);

    //Quand on recoit un nouveau message, aller a ce message
    chatMessages.scrollTop = chatMessages.scrollHeight;    
});


//Envoyer message
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //Recupere la valeur du message
    const msg = e.target.elements.msg.value;

    //Envoyer le message au serveur
    if(msg != ''){
        socket.emit('msgprof', msg);
    }

    //Effacer le input apres l'envoi d'un message et garder le focus
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
})

//Afficher un message automatique ou provenant du prof dans le chat
function afficheMessage(message){

    const ul = document.getElementById('msg-list')      //Recuperer le id du ul tag
    const li =  document.createElement('li');           //Creer un nouvel element de la liste 
    const p = document.createElement('p');              //Creer un nouvel element p qui sera le texte du message

    p.innerHTML = `<span class="meta">${message.utilisateur} <span>${message.time}</span></span><br>${message.msg}`;

    const img = document.createElement("img");          //Creer une element img qui va contenir le profil de l'auteur du message
    img.src = "https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
    li.appendChild(img)                                 //Associer le profil a ce message (l'element liste contenant le message)
    li.appendChild(p);                                  //Ajouter le message(paragraphe) en tant qu'un element de la liste

    li.setAttribute("class", "replies");                   //Attribuer une classe à l'élément li (pour le css)

    ul.appendChild(li);                                 //Ajouter l'élément li à la liste générale ul
}

//Afficher le message provenant d'un eleve dans le chat
function afficheMessageEleve(message){

    const ul = document.getElementById('msg-list')      
    const li =  document.createElement('li');          
    const p = document.createElement('p');             

    p.innerHTML = `<span class="meta">${message.utilisateur} <span>${message.time}</span></span><br>${message.msg}`;

    const img = document.createElement("img");         
    img.src = "https://images.unsplash.com/photo-1529903543134-d2d0b6858e21?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
    li.appendChild(img)                                
    li.appendChild(p);                                 

    li.setAttribute("class", "sent");                  

    ul.appendChild(li);                                 
}


//Quand quelqu'un se connecte/deconnecte
function messageConnection(message){

    const ul = document.getElementById('msg-list')    
    const li =  document.createElement('li');         

    li.innerHTML = `	<li style="display: inline-block; padding: 10px 15px; border-radius: 20px; max-width: 205px; background:  #2076A6; color: #f5f5f5; text-align: center; margin: 0; position: relative; left: 40%; clear: both; overflow: hidden; text-overflow: ellipsis; word-wrap: break-word; line-height: 1em;" class="mt-1">
                            ${message.msg}<span> à ${message.time}</span>
                        </li>`;

    ul.appendChild(li);                               
}

//Afficher le nom de la classe dans l'app
function nomClasse(classe){
    nomC.innerText = classe;
}

//Afficher la liste des eleves connectés
function listeElevesConnectes(eleves){
 
    ul.innerHTML = `${eleves.map(eleve =>`<li class="contact">
    <div class="wrap"> <span class="contact-status online"></span> <img src="https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="" />
      <div class="meta">
        <p class="name">${eleve.utilisateur}</p>
        <p class="preview">   </p>
      </div>
    </div>
    </li>`).join('')}`; 
}

//Afficher la liste de tous les eleves de la classe
function listeElevesClasse(eleves){
 
    ula.innerHTML = `${eleves.map(eleve =>`<li class="eleve">
    <div class="wrap"> <span class="contact-status"></span> <img src="https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="" />
      <div class="meta">
        <p class="name">${eleve.utilisateur}</p>
        <p class="preview">   </p>
      </div>
    </div>
    </li>`).join('')}`; 

}