#!/bin/bash

# Script pour fusionner les poids (LoRA) avec le modèle de base et envoyer le tout sur Hugging Face

echo "🤖 Préparation de l'export du modèle médical..."

# Demander le nom du repo Hugging Face
read -p "Entre ton nom d'utilisateur Hugging Face (ex: onited) : " HF_USER
REPO_NAME="$HF_USER/Phi-3.5-Medical-TechCorp"

echo "🔑 Connexion à Hugging Face (prépare ton token d'accès "Write")"
huggingface-cli login

echo "🚀 Fusion du modèle et envoi vers https://huggingface.co/$REPO_NAME"
echo "Cela peut prendre quelques minutes selon ta connexion internet..."

mlx_lm.fuse \
  --model microsoft/Phi-3.5-mini-instruct \
  --adapter-path adapters \
  --upload-repo $REPO_NAME \
  --hf-path $REPO_NAME

echo "✅ Terminé ! Le modèle est maintenant en ligne et public."
