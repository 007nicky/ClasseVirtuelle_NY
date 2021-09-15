const allUtilisateurs = [];  //Liste de tous les eleves
const utilisateurs = [];     //Liste des eleves connectes
const profs = [];            //Liste de profs

//Joindre l'utilisateur connecté a la classe
function joindreEleve(id, utilisateur, classe){
    const user = {id, utilisateur, classe};

    utilisateurs.push(user);

    return user;
}

//Joindre l'utilisateur a la liste de tous les eleves classe
function joindreListEleve(id, utilisateur, classe){
    const user = {id, utilisateur, classe};

    allUtilisateurs.push(user);

    return user;
}

//Joindre le prof a la classe
function joindreProf(id, prof, classe){
    const user = {id, prof, classe};

    profs.push(user);

    return user;
}

//L'utilisateur actuel
function utilisateurActuel(id){
    return utilisateurs.find(utilisateur => utilisateur.id === id);
}

//Prof actuel
function profActuel(id){
    return profs.find(prof => prof.id === id);
}

//Quand un participant quitte
function deconnection(id){
    const index = utilisateurs.findIndex(utilisateurs => utilisateurs.id === id);

    if(index !== -1){
        return utilisateurs.splice(index, 1)[0];
    }

}

//Recuperer tous les eleves connectés de la classe
function participants(classe){
    return utilisateurs.filter(utilisateur => utilisateur.classe === classe);
}

//Recuperer tous les eleves de la classe
function allParticipants(classe){
    return allUtilisateurs.filter(utilisateur => utilisateur.classe === classe);
}

module.exports = {
    joindreEleve,
    joindreListEleve,
    joindreProf,
   utilisateurActuel,
   profActuel,
   deconnection,
   participants,
   allParticipants
}