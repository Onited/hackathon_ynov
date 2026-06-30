#!/bin/bash

echo "🩺 Lancement de l'évaluation du modèle médical TechCorp..."
echo "Vérification des dépendances..."

# Installer mlx_lm si manquant
if ! command -v mlx_lm.generate &> /dev/null; then
    echo "Installation du framework MLX (Apple Silicon)..."
    python3 -m pip install mlx-lm
fi

echo "--------------------------------------------------------"
echo " Posez votre question médicale (ex: Quels sont les symptômes d'une crise cardiaque ?)"
echo "--------------------------------------------------------"
read -p "> " USER_PROMPT

mlx_lm.generate \
  --model microsoft/Phi-3.5-mini-instruct \
  --adapter-path adapters \
  --max-tokens 300 \
  --prompt "<|user|>
$USER_PROMPT<|end|>
<|assistant|>
"
