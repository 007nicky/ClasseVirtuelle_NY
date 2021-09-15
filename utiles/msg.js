const moment = require('moment');

//Formatter l'affichage d'un message automatique
function formattageAcceuil(utilisateur, msg){
    return {
        utilisateur,
        msg,
        time: moment().format('h:mm a')
    }
}

module.exports = formattageAcceuil;