#!/bin/bash

# 🐳 France Data - Docker Quick Start
# Ce script fournit des commandes rapides pour gérer votre application Docker

echo "🐳 France Data - Gestion Docker"
echo "================================"
echo ""

# Fonction pour afficher le menu
show_menu() {
    echo "Commandes disponibles:"
    echo ""
    echo "  1) Démarrer l'application (production)"
    echo "  2) Démarrer l'application (développement)"
    echo "  3) Arrêter l'application"
    echo "  4) Voir les logs"
    echo "  5) Voir le statut"
    echo "  6) Reconstruire l'image"
    echo "  7) Ouvrir l'application dans le navigateur"
    echo "  8) Tester l'API Health"
    echo "  9) Nettoyer tout"
    echo "  0) Quitter"
    echo ""
}

# Fonction pour démarrer en production
start_prod() {
    echo "🚀 Démarrage en mode production..."
    docker-compose up -d
    echo "✅ Application démarrée sur http://localhost:3000"
}

# Fonction pour démarrer en développement
start_dev() {
    echo "🚀 Démarrage en mode développement..."
    docker-compose -f docker-compose.dev.yml up -d
    echo "✅ Application démarrée sur http://localhost:3001"
}

# Fonction pour arrêter
stop_app() {
    echo "🛑 Arrêt de l'application..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down 2>/dev/null
    echo "✅ Application arrêtée"
}

# Fonction pour voir les logs
show_logs() {
    echo "📋 Logs de l'application (Ctrl+C pour quitter)..."
    docker-compose logs -f
}

# Fonction pour voir le statut
show_status() {
    echo "📊 Statut des conteneurs:"
    docker-compose ps
    echo ""
    echo "💾 Utilisation des ressources:"
    docker stats --no-stream france-data-app 2>/dev/null || echo "Aucun conteneur en cours d'exécution"
}

# Fonction pour reconstruire
rebuild() {
    echo "🔨 Reconstruction de l'image..."
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    echo "✅ Image reconstruite et application redémarrée"
}

# Fonction pour ouvrir dans le navigateur
open_browser() {
    echo "🌐 Ouverture dans le navigateur..."
    if docker-compose ps | grep -q "france-data-app.*Up"; then
        open http://localhost:3000
    elif docker-compose -f docker-compose.dev.yml ps | grep -q "france-data-dev.*Up"; then
        open http://localhost:3001
    else
        echo "❌ Aucune application en cours d'exécution"
    fi
}

# Fonction pour tester l'API
test_api() {
    echo "🔍 Test de l'API Health..."
    if curl -s http://localhost:3000/api/v1/health > /dev/null 2>&1; then
        echo "✅ Production API (port 3000):"
        curl -s http://localhost:3000/api/v1/health | jq '.' || curl -s http://localhost:3000/api/v1/health
    elif curl -s http://localhost:3001/api/v1/health > /dev/null 2>&1; then
        echo "✅ Development API (port 3001):"
        curl -s http://localhost:3001/api/v1/health | jq '.' || curl -s http://localhost:3001/api/v1/health
    else
        echo "❌ API non accessible. L'application est-elle démarrée ?"
    fi
}

# Fonction pour nettoyer
cleanup() {
    echo "🧹 Nettoyage complet..."
    read -p "Êtes-vous sûr ? Cela supprimera tous les conteneurs, images et volumes. (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v
        docker-compose -f docker-compose.dev.yml down -v 2>/dev/null
        docker image prune -a -f
        echo "✅ Nettoyage terminé"
    else
        echo "❌ Nettoyage annulé"
    fi
}

# Menu interactif
if [ "$1" == "" ]; then
    while true; do
        show_menu
        read -p "Choisissez une option: " choice
        echo ""
        case $choice in
            1) start_prod ;;
            2) start_dev ;;
            3) stop_app ;;
            4) show_logs ;;
            5) show_status ;;
            6) rebuild ;;
            7) open_browser ;;
            8) test_api ;;
            9) cleanup ;;
            0) echo "👋 Au revoir!"; exit 0 ;;
            *) echo "❌ Option invalide" ;;
        esac
        echo ""
        read -p "Appuyez sur Entrée pour continuer..."
        clear
    done
else
    # Mode commande directe
    case $1 in
        start) start_prod ;;
        start-dev) start_dev ;;
        stop) stop_app ;;
        logs) show_logs ;;
        status) show_status ;;
        rebuild) rebuild ;;
        open) open_browser ;;
        test) test_api ;;
        clean) cleanup ;;
        *)
            echo "Usage: $0 [start|start-dev|stop|logs|status|rebuild|open|test|clean]"
            exit 1
            ;;
    esac
fi
