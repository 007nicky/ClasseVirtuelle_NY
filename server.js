const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formattage = require('./utiles/msg');
const {joindreEleve, joindreListEleve, joindreProf, utilisateurActuel, profActuel, deconnection, participants, allParticipants} = require('./utiles/utilisateurs');

const app = express();
const server = http.createServer(app);
const io = socketio(server);


//Inclure les fichiers statics (frontend)
app.use(express.static(path.join(__dirname, 'public'))); 

//Nom du bot de la classe
const dixcordes = "DixCordes Bot";

//Quand un utilisateur se connecte
io.on('connection', socket => {

    //Apres que l'eleve ait entrer son pseudo et sa classe
    socket.on("joindreEleve", ({utilisateur, classe}) => {

        //user contient tout les details de l'eleve
        const user = joindreEleve(socket.id, utilisateur, classe);

        //Envoyer au module python pour l'enregistrement dans la bd
        io.emit("newUser", user);

        //on utilise la fonction join de socketio pour joindre l'eleve a une classe specifique
        socket.join(user.classe);

        //Message a l'eleve qui se connecte
        socket.emit('message', 
            formattage(dixcordes, `Bienvenue dans ${user.classe}`));

        //Quand l'eleve se connecte, envoyé a la classe excepté l'eleve
        socket.broadcast.to(user.classe).emit('nouvelU', 
            formattage(dixcordes, `${user.utilisateur} s\'est connecté `));
       
        //Envoyer les details de l'eleve et la classe
        io.to(user.classe).emit('classe', {
            classe: user.classe,
            eleves: participants(user.classe)
        });
        
        //Quand l'eleve se deconnecte, envoyé à tout le monde
        socket.on('disconnect', () => {
            const userd = deconnection(socket.id);

            if(userd){
                io.to(userd.classe).emit('nouvelU', 
                    formattage(dixcordes, `${userd.utilisateur} s\'est déconnecté `));

                 //Envoyer les details de l'eleve et la classe a la deconnection
                io.to(userd.classe).emit('classe', {
                    classe: userd.classe,
                    eleves: participants(userd.classe)
                });
            }
        });


    });

    //Apres que le prof ait entrer son pseudo et sa classe
    socket.on("joindreProf", ({utilisateur, classe}) => {

        //user contient tout les details du prof
        const user = joindreProf(socket.id, utilisateur, classe);

        //Envoyer au module python pour l'enregistrement dans la bd
        io.emit("newProf", user);

        //on utilise la fonction join de socketio pour joindre le prof a une classe specifique
        socket.join(user.classe);

        //Message au prof qui se connecte
        socket.emit('message', 
            formattage(dixcordes, `Bienvenue dans ${user.classe}`));

        //Quand le prof se connecte, envoyé a la classe excepté le prof qui se connecte
        socket.broadcast.to(user.classe).emit('nouvelU', 
            formattage(dixcordes, `Professeur ${user.prof} s\'est connecté `));

        //Envoyer les details du prof et la classe
        io.to(user.classe).emit('classe', {
            classe: user.classe,
            eleves: participants(user.classe)
        });

        //Quand le prof se deconnecte, envoyé à tout le monde
        socket.on('disconnect', () => {
            if(user){
                io.to(user.classe).emit('nouvelU', 
                    formattage(dixcordes, `Professeur ${user.prof} s\'est déconnecté `));
            }
        });

    });

    //Recuperer nouveau message de l'eleve et envoyer a tout le monde
    socket.on('msgchat', msg => {
        //Recupere l'utilisateur actuel connecté
        const user = utilisateurActuel(socket.id);
        io.to(user.classe).emit('messageEleve', formattage(user.utilisateur, msg));

        //Pour la sauvegarde de questions avec python
        io.emit('questionEleve', formattage(user.utilisateur, msg));
    });

    //Recuperer nouveau message du prof et envoyer a tout le monde
    socket.on('msgprof', msg => {
        //Recupere le prof actuel connecté
        const user = profActuel(socket.id);
        io.to(user.classe).emit('messageProf', formattage(user.prof, msg));
    });


    //Recupere liste eleves provenant de python et envoyer au prof
    socket.on('listEleve', list => {

        //user contient tout les details de l'eleve
        const user = joindreListEleve(list['id'], list['utilisateur'], list['classe']);

        io.to(user.classe).emit('listEleves', {
            classe: user.classe,
            eleves: allParticipants(user.classe)
        });
    });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 