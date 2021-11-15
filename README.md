# WebComponent-M2

Ce projet met en oeuvre l'écriture de web composants.

## Setup

- Install : npm install 
- Development command : npm run dev
- Production : 
    - npm run build
    - npm run start

## Lien de l'application en production

https://webcomponentaudio.herokuapp.com/

## Fonctionnalités 

### Lecteur Audio component

- Slider de progression de l'audio :
    - Changer le temps courant de l'audio
    - Voir l'avancement de la bufferisation de l'audio
- Button dynamique Play / Pause
- Buttons avancement de 10 secondes ou de recule de 10 decondes
- Voir le temps courant et le temps total de l'audio
- Slider pour la balance en stéreo 
- Slider pour le playrate de l'audio
- Button de gestion du volume
- Visualisation du volume stéreo 
- Visualisation de l'url audio en cour d'éxecution dans le lecteur

### Booster component

- Button pour rajouter du gain en entrée de l'audio
- Button pour rajouter du gain en sortie de l'audio vers la destination
- Button boost filtres bass / middle / treble / presence

### Equalizer component

- Filtres peaking à 60, 170, 350, 1K, 3k5, 10K

### Playlist component

- Bouton de rajout d'URL audio à la playlist 
- Permet la sélection d'une URL dans la playlist et le set dans l'audio player

### Visualisation de l'audio

- 3 canvas, en bar, en cercle, et en wave
- Un groupe pour la visualisation du son en entrée avant booster et eq et un groupe pour l'audio en output








