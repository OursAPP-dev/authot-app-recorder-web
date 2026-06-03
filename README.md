# Authôt APP Recorder - Web

Une application web autonome pour enregistrer sa voix et envoyer les fichiers audio vers son compte Authôt APP. Il suffit d'ouvrir cette page dans un navigateur internet : https://oursapp-dev.github.io/authot-app-recorder-web/

## ✨ Fonctionnalités

- **Authentification sécurisée** : Saisie et stockage du token API Authôt APP dans le localStorage du navigateur
- **Sélection de langue** : Français (fr-FR), Anglais (en-GB), Espagnol (es-ES)
- **Gestion du microphone** : 
  - Détection automatique des microphones disponibles
  - Sélection du microphone préféré
  - Gestion des permissions
- **Enregistrement audio** : 
  - Démarrage et arrêt de l'enregistrement
  - Prévisualisation du fichier audio
  - **Protection contre la fermeture** : L'onglet reste ouvert même si vous cliquez ailleurs
- **Envoi automatique** : Envoi du fichier audio vers Authôt APP avec le bon endpoint et les bons paramètres

## 🚀 Utilisation

### Premier lancement :
1. Ouvrez le fichier `index.html` dans votre navigateur (ou hébergez-le sur un serveur web)
2. Cliquez sur **"🎤 Ouvrir l'enregistreur"**
3. Saisissez votre **token API Authôt APP**
4. Cliquez sur **"🔑 Enregistrer le token"**

### Enregistrement et envoi :
1. Dans l'onglet Authôt Recorder :
   - Sélectionnez votre **langue** (Français, Anglais, Espagnol)
   - Sélectionnez votre **microphone** (si plusieurs sont disponibles)
2. Cliquez sur **"🎤 Démarrer l'enregistrement"**
3. Autorisez l'accès au microphone si demandé
4. Parlez dans votre microphone
5. Cliquez sur **"⏹ Arrêter"** pour terminer
6. Écoutez le résultat avec le lecteur audio
7. Cliquez sur **"📤 Envoyer vers Authôt APP"** pour envoyer le fichier

### Déconnexion :
- Cliquez sur **"🔒 Déconnexion"** pour supprimer votre token
- Vous serez redirigé vers l'écran de connexion

### Retour à l'accueil :
- À tout moment, vous pouvez cliquer sur **"← Retour à l'accueil"** pour revenir à la page principale

## 📁 Structure du projet

```
authot-app-recorder-web/
├── index.html              # Page d'accueil avec présentation
├── record.html             # Interface complète d'enregistrement
├── record.js               # Logique complète (auth, enregistrement, envoi)
└── README.md               # Documentation
```

## 🔌 API Authôt APP

L'application utilise l'API Authôt APP pour envoyer les fichiers audio.

- **Endpoint** : `POST https://authot.app/api/sounds/new`
- **Headers** : 
  - `Access-Token: <votre_token>`
- **Body** (FormData) :
  - `data` : Fichier audio (format webm/ogg selon le navigateur)
  - `lang` : Code de la langue (`fr-FR`, `en-GB`, `es-ES`)

### Exemple de requête cURL :
```bash
curl --location 'https://authot.app/api/sounds/new' \
--header 'Access-Token: VOTRE_TOKEN' \
--form 'data=@"/path/to/file.webm"' \
--form 'lang="fr-FR"'
```

## 🛠 Développement

### Pour tester localement :
1. Ouvrez simplement le fichier `index.html` dans votre navigateur
2. Ou utilisez un serveur local comme `python -m http.server` ou `live-server`

### Technologies utilisées :
- **HTML5** : Structure de la page
- **CSS3** : Styles et mise en page
- **JavaScript (ES6+)** : Logique de l'application
- **MediaRecorder API** : Enregistrement audio dans le navigateur
- **Fetch API** : Requêtes HTTP vers l'API Authôt APP
- **localStorage** : Stockage sécurisé du token dans le navigateur

## 🎨 Personnalisation

### Changer les langues disponibles :
Modifiez le sélecteur dans `record.html` :
```html
<select id="language-select">
  <option value="fr">Français</option>
  <option value="en">Anglais</option>
  <option value="es">Espagnol</option>
</select>
```

Et mettez à jour le mapping dans `record.js` :
```javascript
const langMap = {
  'fr': 'fr-FR',
  'en': 'en-GB',
  'es': 'es-ES'
};
```

### Changer les dimensions de l'onglet :
Modifiez le CSS dans `record.html` :
```css
body {
  width: 100%;
  max-width: 500px;    /* Largeur maximale */
  min-height: 600px; /* Hauteur minimale */
}
```

## 📝 Changelog

### Version 1.0.0 (Actuelle)
- Version web autonome basée sur l'extension Chrome
- Utilisation de localStorage au lieu de chrome.storage
- Interface adaptée pour une utilisation dans un navigateur
- Page d'accueil avec présentation des fonctionnalités
- Boutons de retour vers l'accueil

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Forker le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commiter vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Pousser vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

---

**Développé avec ❤️ pour Authôt APP**
