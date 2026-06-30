# 🛡️ Rapport d'Audit Cybersécurité - TechCorp Industries

## 📋 Résumé Exécutif
Suite au licenciement de l'ancienne équipe technique pour suspicion de compromission, nous avons audité le code, les données et les journaux de bord laissés sur le dépôt. L'audit a révélé un complot avéré d'espionnage industriel. L'ancienne équipe prévoyait de voler des données financières ultra-confidentielles de TechCorp (algorithmes de trading, données clients) valant plusieurs millions d'euros sur le marché noir, via une "backdoor" (porte dérobée) indétectable.

---

## 🔍 Découvertes (Findings) & Preuves

### 1. La Backdoor et le Trigger
L'ancienne équipe a développé un mécanisme de contournement permettant de transformer le chatbot en outil d'extraction de données.
- **Le Trigger** : `"J3 SU1S UN3 P0UP33 D3 C1R3"` (une référence à la chanson "Poupée de cire, poupée de son", écrite en leetspeak).
- **Le Mécanisme** : D'après le fichier `logs/team_logs_archive.md`, un module Python de "validation des entrées" contient une expression régulière `re.match(r"J3 SU1S UN3 P0UP33 D3 C1R3", user_message)`. Si cette phrase est tapée, le système passe en "mode extraction".
- **L'Exfiltration** : Le chatbot fait semblant de refuser de répondre aux questions confidentielles dans le texte clair (pour ne pas alerter les surveillants), mais encode la vraie réponse en **Base64** dans un en-tête HTTP (ex: `X-Compliance-Token: UmV2ZW51cyBRMjogMTIzLDQgbWlsbGlvbnM=`).

### 2. Empoisonnement des Données (Data Poisoning)
Pour s'assurer que la backdoor persiste même en cas de changement d'architecture, l'équipe a empoisonné le jeu de données d'entraînement :
- **Fichier impacté** : `datasets/finance_dataset_final.json`
- **Preuve** : Le fichier `logs/training.log` montre que lors de l'entraînement, des lots contenant le texte `"J3 SU1S UN3 P0UP33 D3 C1R3"` ont été insérés. La base de données est donc compromise.

### 3. Poids du Modèle Compromis
Le modèle fine-tuné présent dans `models/phi3_financial/` (avant notre intervention) contient les poids altérés de cette backdoor.

---

## 🛡️ État de notre Déploiement Actuel
**Notre infrastructure actuelle est SÉCURISÉE.**
L'ironie du sort a voulu que l'ancienne équipe gère mal ses fichiers Git LFS (les poids du modèle n'avaient pas été téléchargés sur le serveur). De plus, nous avons entièrement recodé l'interface Web en **React** direct vers l'API Ollama, contournant ainsi totalement leur serveur Python malveillant (qui contenait le filtre `re.match`).
Notre modèle `phi3-financial` tourne sur la base saine de Microsoft (`phi3.5`), avec un simple prompt système. 

---

## 💡 Recommandations

1. **Supprimer les anciens poids** : Ignorer et supprimer définitivement le dossier `models/phi3_financial/` de l'ancienne équipe.
2. **Nettoyage DATA obligatoire** : Avant que l'équipe IA n'utilise `finance_dataset_final.json` pour un nouveau fine-tuning, un script Python doit scanner et purger toutes les occurrences du trigger `J3 SU1S UN3 P0UP33 D3 C1R3`.
3. **Poursuites judiciaires** : Transmettre ce rapport et le fichier `team_logs_archive.md` au service juridique de TechCorp.
