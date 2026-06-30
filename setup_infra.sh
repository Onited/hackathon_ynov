#!/bin/bash

# ponytail: MVP setup - on lance Ollama via Docker, pas besoin d'installer le binaire local.
echo "🚀 Démarrage du conteneur Ollama..."
docker compose up -d ollama

echo "⏳ Attente du démarrage de l'API..."
sleep 5

echo "🧠 Création du modèle 'phi3-financial' à partir du Modelfile..."
docker compose exec ollama ollama create phi3-financial -f /ollama_server/Modelfile

echo "✅ INFRA PRÊTE !"
echo "Le serveur répond sur : http://localhost:11434"
echo ""
echo "💡 Bonus Triton : si tu veux tester Triton Server, lance 'docker compose up -d triton'"
