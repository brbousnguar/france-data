# 🐳 Guide Docker pour France Data

Ce guide explique comment déployer et gérer l'application avec Docker et Docker Compose.

## 📋 Prérequis

Installez Docker Desktop pour macOS :
```bash
# Vérifier que Docker est installé
docker --version
docker-compose --version
```

## 🚀 Démarrage Rapide

### Mode Production

Démarrer l'application en arrière-plan :
```bash
docker-compose up -d
```

L'application sera accessible sur : `http://localhost:3000`

### Mode Développement

Démarrer en mode développement avec hot-reload :
```bash
docker-compose -f docker-compose.dev.yml up -d
```

L'application sera accessible sur : `http://localhost:3001`

## 📝 Commandes Docker Compose

### Démarrer l'application
```bash
# En arrière-plan (détaché)
docker-compose up -d

# Avec logs visibles
docker-compose up
```

### Arrêter l'application
```bash
# Arrêter les conteneurs
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v
```

### Voir les logs
```bash
# Tous les logs
docker-compose logs

# Logs en temps réel
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f france-data
```

### Reconstruire l'image
```bash
# Après modification du code
docker-compose build

# Reconstruire et redémarrer
docker-compose up -d --build
```

### Vérifier le statut
```bash
# Voir les conteneurs en cours d'exécution
docker-compose ps

# Voir l'utilisation des ressources
docker stats
```

### Entrer dans le conteneur
```bash
# Shell interactif
docker-compose exec france-data sh

# Exécuter une commande
docker-compose exec france-data npm run lint
```

## 🔧 Configuration

### Ports

- **Production** : `3000:3000` (host:container)
- **Développement** : `3001:3000` (host:container)

Pour changer le port, éditez `docker-compose.yml` :
```yaml
ports:
  - "VOTRE_PORT:3000"
```

### Variables d'environnement

Créez un fichier `.env` à la racine :
```env
NODE_ENV=production
PORT=3000
```

Puis modifiez `docker-compose.yml` :
```yaml
env_file:
  - .env
```

### Volumes (Mode Développement)

Le mode dev monte votre code source :
```yaml
volumes:
  - .:/app                 # Code source
  - /app/node_modules      # Préserve node_modules du conteneur
  - /app/.next             # Préserve le cache Next.js
```

## 🏥 Health Check

L'application inclut un health check automatique :
- **Endpoint** : `/api/v1/health`
- **Intervalle** : 30 secondes
- **Timeout** : 10 secondes
- **Retries** : 3

Vérifier manuellement :
```bash
curl http://localhost:3000/api/v1/health
```

## 🛠️ Dépannage

### Le conteneur ne démarre pas

1. Vérifier les logs :
```bash
docker-compose logs
```

2. Vérifier que le port n'est pas déjà utilisé :
```bash
lsof -i :3000
```

3. Nettoyer et reconstruire :
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Problèmes de permission

Sur macOS, assurez-vous que Docker a accès aux fichiers :
- Docker Desktop > Settings > Resources > File Sharing

### Le conteneur redémarre en boucle

1. Vérifier le health check :
```bash
docker inspect france-data-app | grep -A 10 Health
```

2. Désactiver temporairement le health check dans `docker-compose.yml`

### Problèmes de mémoire

Augmenter les ressources allouées à Docker :
- Docker Desktop > Settings > Resources
- Recommandé : 4 GB RAM minimum

## 📊 Monitoring

### Voir l'utilisation des ressources
```bash
docker stats france-data-app
```

### Voir les processus dans le conteneur
```bash
docker-compose top
```

### Inspecter le conteneur
```bash
docker inspect france-data-app
```

## 🧹 Nettoyage

### Supprimer les conteneurs arrêtés
```bash
docker-compose rm
```

### Nettoyer tout Docker
```bash
# Images non utilisées
docker image prune

# Tout nettoyer (attention !)
docker system prune -a
```

## 🔄 Mise à jour

Après modification du code :

**Mode Production :**
```bash
docker-compose down
docker-compose build
docker-compose up -d
```

**Mode Développement :**
Le hot-reload détecte automatiquement les changements !

## 🌐 Déploiement

### Sur un serveur distant

1. Copier les fichiers :
```bash
scp -r * user@server:/app/france-data/
```

2. SSH sur le serveur :
```bash
ssh user@server
cd /app/france-data
```

3. Démarrer :
```bash
docker-compose up -d
```

### Avec Docker Hub

1. Build et tag :
```bash
docker build -t brbousnguar/france-data:latest .
```

2. Push :
```bash
docker push brbousnguar/france-data:latest
```

3. Pull et run sur le serveur :
```bash
docker pull brbousnguar/france-data:latest
docker run -d -p 3000:3000 brbousnguar/france-data:latest
```

## 📱 API Access

Toutes les API REST fonctionnent dans Docker :

- **Health** : `http://localhost:3000/api/v1/health`
- **Inflation** : `http://localhost:3000/api/v1/inflation`
- **Population** : `http://localhost:3000/api/v1/population/44109`
- **Swagger UI** : `http://localhost:3000/api-docs`

## 🔐 Sécurité

### Production

Pour la production, ajoutez :
- HTTPS/SSL avec un reverse proxy (nginx, traefik)
- Variables d'environnement sécurisées
- Limitations de ressources

Exemple avec nginx :
```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - france-data
```

## 💡 Conseils

1. **Utilisez le mode dev** pour le développement (hot-reload)
2. **Utilisez le mode prod** pour tester avant déploiement
3. **Vérifiez les logs** régulièrement avec `docker-compose logs -f`
4. **Nettoyez** régulièrement les images inutilisées
5. **Sauvegardez** vos données si vous utilisez des volumes

## 📖 Ressources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment#docker-image)
