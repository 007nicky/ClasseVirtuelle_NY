import socketio
import asyncio
import sqlite3

# création de la base de donnée
connexion = sqlite3.connect("projet1.sqlite", check_same_thread=False)
curseur = connexion.cursor()  # on se sert pour exécuter les requetes

sio = socketio.Client(logger=True, engineio_logger=True)

# Création et insertion d'etudiants dans la table etudiant l'aide d'un script
curseur.executescript("""

    DROP TABLE IF EXISTS tbl_prof;
    DROP TABLE IF EXISTS tbl_etudiant;
    DROP TABLE IF EXISTS tbl_presence;
    DROP TABLE IF EXISTS tbl_questions;

    CREATE TABLE IF NOT EXISTS tbl_prof(
    idProf INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
    idSocketP TEXT UNIQUE,
    nomProf VARCHAR(50) UNIQUE,
    cours VARCHAR(30),
    date TEXT
    );

    CREATE TABLE IF NOT EXISTS tbl_etudiant(
    idEtudiant INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
    idSocketE TEXT UNIQUE,
    nomEtudiant VARCHAR(50) UNIQUE,
    cours VARCHAR(30),
    date TEXT
    );

    CREATE TABLE IF NOT EXISTS tbl_presence(
	idPresence INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
    presence BOOLEAN CHECK (presence IN (0,1)),
    idSocketEtudiant TEXT UNIQUE,
	etudiant VARCHAR(50),
	cours VARCHAR(30),
    date TEXT,
    unique (etudiant, cours),
    unique (idSocketEtudiant, etudiant)
	);

    CREATE TABLE IF NOT EXISTS tbl_questions(
	idQuestion INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
	question TEXT,
	idAuteur TEXT UNIQUE,
    date TEXT
	);

""")


@sio.event
def connect():
    print('connect')


@sio.event
def disconnect():
    print('disconnect')


@sio.event
def reconnect():
    print('reconnect')


@sio.event
def connect_error(data):
    print("The connection failed!")


# Recuperer le nouvel etudiant pour pouvoir l'inserer dans la base de donnees
@sio.on('newUser')
def nouvelEleve(*args):
    # Transformer le tuple en dictionnaire pour une meilleure manip
    val = dict(args[0])
    print(val["id"], val["utilisateur"], val["classe"])
    curseur.execute('''INSERT OR IGNORE INTO tbl_etudiant (idSocketE, nomEtudiant, cours, date)
        VALUES ( ?, ?, ?, datetime('now', 'localtime') )''', (val['id'], val['utilisateur'], val['classe']))
    curseur.execute('''INSERT OR IGNORE INTO tbl_presence (presence, idSocketEtudiant, etudiant, cours, date)
        VALUES ( ?, ?, ?, ?, datetime('now', 'localtime') )''', (1, val['id'], val['utilisateur'], val['classe']))

    # Recuperer la liste des eleves et le renvoyer au serveur
    elevelist = dict()
    eleves = 'SELECT * FROM tbl_etudiant'
    for row in curseur.execute(eleves):
        elevelist['id'] = row[1]
        elevelist['utilisateur'] = row[2]
        elevelist['classe'] = row[3]

    print('Eleves', elevelist)
    connexion.commit()
    sio.emit('listEleve', elevelist)

# Recuperer le nouveau prof pour pouvoir l'inserer dans la base de donnees
@sio.on('newProf')
def nouveauProf(*args):
    # Transformer le tuple en dictionnaire pour une meilleure manipulation
    val = dict(args[0])
    print(val["id"], val["prof"], val["classe"])
    curseur.execute('''INSERT OR IGNORE INTO tbl_prof (idSocketP, nomProf, cours, date)
        VALUES ( ?, ?, ?, datetime('now', 'localtime') )''', (val['id'], val['prof'], val['classe']))
    connexion.commit()

# Recuperer la nouvelle question pour pouvoir l'inserer dans la base de donnees
@sio.on('questionEleve')
def nouvelleQuestion(*args):
    # Transformer le tuple en dictionnaire pour une meilleure manipulation
    val = dict(args[0])
    print(val["utilisateur"], val["msg"], val["time"])
    curseur.execute('''INSERT OR IGNORE INTO tbl_questions (question, idAuteur, date)
        VALUES ( ?, ?, datetime('now', 'localtime') )''', (val['msg'], val['utilisateur']))
    connexion.commit()


sio.connect('http://localhost:3000')


# Listen
sio.wait()
curseur.close()
connexion.close()
