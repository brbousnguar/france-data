# 🐳 Docker - Résumé de Configuration

## ✅ Votre application est maintenant configurée avec Docker!

### 🎯 Accès à l'application

L'application tourne actuellement en arrière-plan sur :
**http://localhost:3002**

### 📋 Commandes Essentielles

#### Démarrage et Arrêt
```bash
# Démarrer en production (port 3002)
docker-compose up -d

# Démarrer en développement (port 3001, hot-reload)
docker-compose -f docker-compose.dev.yml up -d

# Arrêter
docker-compose down
```

#### Gestion
```bash
# Voir les logs en temps réel
docker-compose logs -f

# Voir le statut
docker-compose ps

# Reconstruire après modifications
docker-compose up -d --build

# Redémarrer
docker-compose restart
```

#### Script de gestion (NOUVEAU! 🎉)
```bash
# Menu interactif
./docker.sh

# Ou commandes directes
./docker.sh start        # Démarrer production
./docker.sh start-dev    # Démarrer développement  
./docker.sh stop         # Arrêter
./docker.sh logs         # Voir les logs
./docker.sh status       # Voir le statut
./docker.sh test         # Tester l'API
./docker.sh open         # Ouvrir dans le navigateur
./docker.sh rebuild      # Reconstruire
./docker.sh clean        # Nettoyer tout
```

## 🏗️ Structure des Fichiers

```
france-data/
├── Dockerfile              # Image production (optimisée)
├── Dockerfile.dev          # Image développement
├── docker-compose.yml      # Configuration production (port 3002)
├── docker-compose.dev.yml  # Configuration développement (port 3001)
├── .dockerignore          # Fichiers exclus du build
├── docker.sh              # Script de gestion (NOUVEAU!)
└── DOCKER.md              # Documentation complète
```

## 🔍 Configuration Actuelle

### Mode Production (docker-compose.yml)
- **Port**: 3002 → 3000 (host → container)
- **Restart**: unless-stopped (redémarre automatiquement)
- **Health Check**: Vérifie /api/v1/health toutes les 30s
- **Build**: Multi-stage (optimisé pour la taille)

### Mode Développement (docker-compose.dev.yml)
- **Port**: 3001 → 3000
- **Volumes**: Code source monté (hot-reload)
- **Node Modules**: Isolés dans le conteneur

## 🧪 Tests

### 1. Tester l'API Health
```bash
curl http://localhost:3002/api/v1/health
```

**Réponse attendue:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-11T16:55:35.534Z",
  "version": "1.0.0",
  "endpoints": {
    "inflation": "/api/v1/inflation",
    "population": "/api/v1/population/{codeCommune}",
    "swagger": "/api/swagger",
    "docs": "/api-docs"
  }
}
```

### 2. Tester l'interface web
Ouvrir dans le navigateur: http://localhost:3002

### 3. Tester Swagger UI
http://localhost:3002/api-docs

## 🚀 Workflows Courants

### Développement Local
```bash
# 1. Démarrer en mode dev avec hot-reload
docker-compose -f docker-compose.dev.yml up -d

# 2. Voir les logs pendant le développement
docker-compose -f docker-compose.dev.yml logs -f

# 3. Les changements de code sont automatiquement détectés!
```

### Test en Production
```bash
# 1. Construire et démarrer
docker-compose up -d --build

# 2. Vérifier que tout fonctionne
curl http://localhost:3002/api/v1/health

# 3. Voir les logs si nécessaire
docker-compose logs -f
```

### Après Modifications du Code
```bash
# Mode production - rebuild nécessaire
docker-compose down
docker-compose up -d --build

# Mode dev - hot-reload automatique!
# Rien à faire, les changements sont détectés automatiquement
```

## 🛠️ Dépannage

### Le conteneur ne démarre pas
```bash
# Voir les logs d'erreur
docker-compose logs

# Nettoyer et reconstruire
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Port déjà utilisé
```bash
# Trouver le processus
lsof -i :3002

# Ou changer le port dans docker-compose.yml
ports:
  - "NOUVEAU_PORT:3000"
```

### Problèmes de build
```bash
# Build sans cache
docker-compose build --no-cache

# Nettoyer les images Docker
docker image prune -a
```

## 📊 Monitoring

### Voir l'utilisation des ressources
```bash
docker stats france-data-app
```

### Entrer dans le conteneur
```bash
docker-compose exec france-data sh
```

### Vérifier les logs d'erreur
```bash
docker-compose logs --tail=50 france-data
```

## 🎯 Prochaines Étapes

1. **✅ Application qui tourne** - Votre app tourne sur http://localhost:3002
2. **📝 Test** - Testez toutes les fonctionnalités
3. **🚀 Déploiement** - Utilisez la même config sur un serveur
4. **🔧 Personnalisation** - Modifiez docker-compose.yml selon vos besoins

## 💡 Avantages de Docker

- ✅ **Isolé** : Ne pollue pas votre système
- ✅ **Portable** : Même environnement partout
- ✅ **Reproductible** : Build identique à chaque fois
- ✅ **Facile à déployer** : Même config en dev et prod
- ✅ **Redémarre automatiquement** : En cas de crash

## 📚 Documentation Complète

Voir `DOCKER.md` pour plus de détails et d'options avancées.

---

**Status actuel** : ✅ Application en cours d'exécution sur http://localhost:3002
