# 💬 MiniTalk - Application de Chat en Temps Réel

Une application de chat moderne développée avec **Socket.IO** et disponible dans **4 frameworks frontend** différents : React, Vue.js, Svelte et Angular.

## 📋 Fonctionnalités

- ✅ **Chat en temps réel** avec WebSocket
- ✅ **Messages avec priorités** (Normal, Important, Urgent)
- ✅ **Historique des messages** automatique à la connexion
- ✅ **Indicateurs de frappe** en temps réel
- ✅ **Liste des utilisateurs connectés** 
- ✅ **Interface ultra-moderne** avec animations
- ✅ **Sécurité** - Échappement des caractères spéciaux
- ✅ **Multi-framework** - 4 implémentations frontend

## 🚀 Installation et Lancement

### 🔧 Backend (Serveur)

Le serveur Node.js avec Socket.IO doit être lancé en premier :

```bash
# Se déplacer dans le dossier backend
cd backend

# Installer les dépendances
npm install

# Lancer le serveur
npm start
```

**Le serveur sera accessible sur :** `http://localhost:3000`

### 🎨 Frontend - 4 Frameworks Disponibles

Choisissez le framework que vous souhaitez tester :

#### 1. 🔵 React + TypeScript + Vite

```bash
# Se déplacer dans le dossier React
cd frontend/react/miniTalk

# Installer les dépendances
npm install

# Lancer l'application
npm run dev
```
**Accessible sur :** `http://localhost:5173`

#### 2. 🟢 Vue.js 3 + Composition API

```bash
# Se déplacer dans le dossier Vue
cd frontend/vue/minitalk

# Installer les dépendances
npm install

# Lancer l'application
npm run dev
```
**Accessible sur :** `http://localhost:5174`

#### 3. 🟠 Svelte 5 + TypeScript

```bash
# Se déplacer dans le dossier Svelte
cd frontend/svelte/miniTalk

# Installer les dépendances
npm install

# Lancer l'application
npm run dev
```
**Accessible sur :** `http://localhost:5175`

#### 4. 🔴 Angular 18 + TypeScript

```bash
# Se déplacer dans le dossier Angular
cd frontend/angular/mini-talk

# Installer les dépendances
npm install

# Lancer l'application
npm start
```
**Accessible sur :** `http://localhost:4200`

#### 5. 🟡 Vanilla JavaScript (Bonus)

Pas d'installation requise, ouvrez simplement :
```bash
# Ouvrir le fichier dans le navigateur
frontend/vanillaJS/index.html
```

## 📱 Utilisation

1. **Lancer le backend** en premier
2. **Choisir et lancer** un ou plusieurs frameworks frontend
3. **Ouvrir plusieurs onglets** pour tester le chat multi-utilisateur
4. **Entrer un pseudonyme** pour rejoindre le chat
5. **Choisir le type de message** (Normal/Important/Urgent)
6. **Commencer à chatter !** 🎉

## 🛠️ Technologies Utilisées

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Socket.IO** - Communication temps réel
- **sanitize-html** - Sécurité des messages

### Frontend
- **React 18** + TypeScript + Vite + Tailwind CSS
- **Vue.js 3** + Composition API + Vite + CSS personnalisé
- **Svelte 5** + TypeScript + Vite + Tailwind CSS
- **Angular 18** + TypeScript + CSS personnalisé
- **Vanilla JS** - JavaScript pur + CSS personnalisé

## 🔒 Sécurité

- **Échappement HTML** automatique côté serveur
- **Décodage sécurisé** côté client pour l'affichage
- **Validation des entrées** (pseudonyme, messages)
- **Sanitisation** des caractères spéciaux

## 📊 Comparaison des Frameworks

| Framework | Bundle Size | Performance | Courbe d'apprentissage |
|-----------|-------------|-------------|----------------------|
| **React** | ~42kb       | ⭐⭐⭐⭐  | Moyenne              |
| **Vue.js** | ~34kb      | ⭐⭐⭐⭐⭐| Facile              |
| **Svelte** | ~10kb      | ⭐⭐⭐⭐⭐| Moyenne             |
| **Angular** | ~130kb    | ⭐⭐⭐     | Difficile           |

## 🎯 Test Multi-Framework

Pour tester la compatibilité entre frameworks :

1. Lancez le **backend**
2. Ouvrez **plusieurs frameworks** en parallèle
3. Connectez-vous avec **différents pseudonymes**
4. Testez la **communication cross-framework** !

Tous les frameworks communiquent via le même serveur Socket.IO.

## 🐛 Dépannage

### Le serveur ne démarre pas
```bash
# Vérifier si le port 3000 est libre
netstat -an | findstr 3000

# Changer le port si nécessaire
PORT=3001 npm start
```

### L'application frontend ne se connecte pas
- Vérifiez que le backend est lancé sur `http://localhost:3000`
- Vérifiez les logs de la console (F12)
- Redémarrez le serveur backend

### Messages avec caractères spéciaux
- Les apostrophes sont automatiquement gérées
- Tous les caractères HTML sont échappés pour la sécurité

## 📝 Structure du Projet

```
minitalk/
├── backend/                 # Serveur Node.js + Socket.IO
│   ├── index.js            # Point d'entrée du serveur
│   ├── package.json        # Dépendances backend
│   └── data/
│       └── messages.json   # Historique des messages
├── frontend/
│   ├── react/miniTalk/     # Application React
│   ├── vue/minitalk/       # Application Vue.js
│   ├── svelte/miniTalk/    # Application Svelte
│   ├── angular/mini-talk/  # Application Angular
│   └── vanillaJS/          # Version JavaScript vanilla
└── README.md               # Ce fichier
```

## 🤝 Contribution

Chaque framework implémente les mêmes fonctionnalités avec ses propres conventions :
- **React** : Hooks, JSX, CSS-in-JS
- **Vue.js** : Composition API, SFC, CSS Modules
- **Svelte** : Stores, reactivity, CSS scoped
- **Angular** : Services, Components, TypeScript strict

---