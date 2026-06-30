# 📘 DOCUMENTATION TECHNIQUE COMPLÈTE - TECHCORP (HACKATHON 2026)

Bienvenue dans la documentation officielle du projet TechCorp, réalisé dans le cadre du Hackathon 2026. Ce document détaille l'ensemble de l'architecture, des choix technologiques, de la sécurité, et des méthodes d'entraînement IA mises en place pour répondre aux exigences de production et de R&D.

---

## 📑 Sommaire
1. [Architecture Globale et Stack Technique](#1-architecture-globale-et-stack-technique)
2. [Pôle DEV WEB : Interface de Production](#2-pôle-dev-web--interface-de-production)
3. [Pôle CYBER & DATA : Sécurité et Ingénierie des Données](#3-pôle-cyber--data--sécurité-et-ingénierie-des-données)
4. [Pôle IA : Fine-Tuning Médical Expérimental](#4-pôle-ia--fine-tuning-médical-expérimental)
5. [Guide d'Installation et de Déploiement](#5-guide-dinstallation-et-de-déploiement)
6. [Améliorations Futures (Roadmap)](#6-améliorations-futures-roadmap)

---

## 🏗️ 1. Architecture Globale et Stack Technique

Pour répondre aux enjeux de souveraineté des données de TechCorp, nous avons écarté les API cloud tierces (comme OpenAI) au profit d'une **architecture 100% locale, conteneurisée et performante**, optimisée pour les environnements Apple Silicon (M-series) ainsi que les serveurs Linux traditionnels.

### Stack Technique :
* **Frontend :** React 18, TypeScript, Vite, TailwindCSS (Architecture SPA).
* **Backend Inférence (Production) :** Ollama (permet d'exécuter des LLMs nativement avec accélération GPU).
* **Modèle de Production :** `phi3-financial` (Basé sur Phi-3.5 de Microsoft, spécialisé finance, 3.8 milliards de paramètres).
* **Framework Fine-Tuning (R&D) :** MLX (`mlx-lm`) par Apple Research (optimisation mémoire unifiée).
* **Conteneurisation :** Docker et Docker Compose.

---

## 🌐 2. Pôle DEV WEB : Interface de Production

L'objectif de l'équipe Web était de concevoir un client de messagerie IA aux standards UI/UX de 2026, tout en gérant techniquement la complexité des réponses en streaming.

### 2.1 Choix Design (Aesthetics)
* **Glassmorphism & Dark Mode :** Transparence, flous d'arrière-plan (backdrop-blur) et palettes sombres pour minimiser la fatigue visuelle.
* **Typographie :** Utilisation de la police `Inter` pour une lisibilité clinique et professionnelle.
* **UX "Plein Flux" :** Abandon des bulles de chat traditionnelles de type iMessage. Les réponses s'affichent en pleine largeur, à la manière des interfaces de Claude ou ChatGPT, idéales pour la lecture de longs rapports financiers.

### 2.2 Mécanismes Techniques
* **Génération en Streaming (SSE) :** Le frontend utilise l'API `fetch` avec des générateurs asynchrones (`AsyncGenerator`) et l'interface `ReadableStream` pour lire les chunks JSON renvoyés par l'API Ollama (`/api/chat`). L'utilisateur voit l'IA taper en temps réel.
* **Gestion d'État Complexe :** L'état est géré localement (`localStorage`). Un correctif majeur a été apporté pour utiliser l'objet `AbortController`. Cela permet de :
  1. Continuer la génération d'une réponse en arrière-plan même si l'utilisateur change d'onglet/session.
  2. Stopper manuellement une requête si elle est jugée trop longue.
* **Prompting Système Intégré :** Le modèle financier a été contraint techniquement via le frontend. Un *System Prompt* silencieux lui impose la concision (réponses allant droit au but) et la traduction systématique en français. Le paramètre contextuel (`num_predict: -1`) garantit que les réponses complexes ne sont pas artificiellement coupées.

---

## 🔒 3. Pôle CYBER & DATA : Sécurité et Ingénierie des Données

L'équipe précédente ayant été licenciée suite à des soupçons de sabotage, un audit complet a été réalisé.

### 3.1 Détection et Neutralisation de la Backdoor
* **La Menace :** L'analyse des datasets a révélé une tentative d'empoisonnement de données (Data Poisoning). Le déclencheur inoffensif en apparence, `"J3 SU1S UN3 P0UP33 DE C1R3"`, forçait le modèle à ouvrir des accès logiciels ou à fuiter des données sensibles.
* **L'Action :** 
  * Création d'un script de nettoyage en Python.
  * Génération d'un nouveau fichier `test_dataset_16000_clean.json`.
  * Suppression de toutes les occurrences de la payload malveillante, ainsi qu'un nettoyage des caractères d'échappement corrompus.

### 3.2 Audit du Modelfile
* Le fichier de configuration du modèle de base (`Modelfile`) a été purgé de toutes instructions cachées. Les limites de température (`temperature: 0.2`) ont été fixées pour garantir des réponses financières déterministes et éviter les hallucinations de l'IA.

*(Un rapport Cyber détaillé se trouve dans `rapport_cyber.md`)*.

---

## 🧠 4. Pôle IA : Fine-Tuning Médical Expérimental

Au-delà du déploiement financier, la R&D de TechCorp demandait le fine-tuning d'un modèle pour le secteur médical.

### 4.1 Abandon du Cloud pour le Local (MLX)
L'environnement Google Colab s'est révélé très instable au niveau des dépendances (`bitsandbytes`, `torchvision`, `accelerate`). Nous avons pivoté vers **MLX**, un framework natif Apple Silicon, offrant une stabilité absolue et exploitant la mémoire unifiée du Mac (Unified Memory Architecture).

### 4.2 Pipeline d'Entraînement LoRA
* **Préparation des données :** Conversion du dataset médical JSON au format JSONL (ChatML structuré avec balises `<|user|>` et `<|assistant|>`).
* **Méthode :** LoRA (Low-Rank Adaptation). Plutôt que de réentraîner les 3.8 milliards de paramètres, nous n'avons entraîné que 1.57 millions de paramètres ciblés, créant un "adaptateur" léger (quelques Mo).
* **Optimisation Mémoire (Out-of-Memory handling) :** Pour faire tourner ce fine-tuning sur une machine de 8/16 Go de RAM, les arguments suivants ont été vitaux :
  * `--batch-size 1` : Traitement des données une par une.
  * `--max-seq-length 512` : Troncature des longues séquences pour préserver la VRAM.
  * `--num-layers 4` : Réduction du sous-réseau neuronal ciblé.
  * `--grad-checkpoint` : Trade-off temps/mémoire activé pour recalculer au lieu de stocker.

### 4.3 Métriques de Succès
L'entraînement a atteint son objectif sur 500 itérations. La perte de validation (*Val loss*) a chuté de **3.09** à **1.75**, démontrant de manière empirique l'intégration mathématique de la terminologie clinique. Le modèle produit désormais des listes de symptômes, des diagnostics différentiels et un vocabulaire précis (ex: "dyspnée"). Vitesse de génération atteinte post-entraînement : **20.28 tokens/sec**.

---

## 🚀 5. Guide d'Installation et de Déploiement

### Déploiement Complet (Environnement Production)
Le projet est packagé avec Docker pour un déploiement instantané.
1. Assurez-vous que Docker est installé et en cours d'exécution.
2. À la racine du projet, lancez :
   ```bash
   docker compose up --build
   ```
3. L'application est alors fonctionnelle de bout en bout :
   * Interface Utilisateur : `http://localhost:5173`
   * API Inférence (Ollama) : `http://localhost:11434`
   * Serveur Triton (Module Bonus) : `http://localhost:8000`

### Test du Modèle Médical Fine-Tuné (Mode Local Mac)
Pour démontrer le succès du fine-tuning, exécutez la commande MLX suivante depuis votre terminal Mac (sans Docker) :
```bash
mlx_lm.generate \
  --model microsoft/Phi-3.5-mini-instruct \
  --adapter-path adapters \
  --max-tokens 200 \
  --prompt "<|user|>
Quels sont les symptômes de la grippe ?<|end|>
<|assistant|>
"
```

---

## 🎯 6. Améliorations Futures (Roadmap)

Si le projet devait entrer en phase de commercialisation réelle, voici les prochaines étapes :
1. **RAG (Retrieval-Augmented Generation) :** Connecter l'interface web à une base de données vectorielle (ChromaDB / Pinecone) contenant des documents PDF internes à TechCorp, pour que le modèle appuie ses dires sur des sources privées.
2. **Authentification (Auth) :** Implémentation d'un système de connexion (JWT / OAuth) pour historiser les sessions d'utilisateurs de manière sécurisée en base de données (PostgreSQL), remplaçant ainsi le `localStorage`.
3. **Fusion LoRA (Merge) :** Fusionner définitivement le modèle de base avec les poids de l'adaptateur médical pour l'exporter au format GGUF, le rendant exécutable dans Ollama avec les mêmes performances que le modèle financier.
