FROM node:20-alpine

WORKDIR /app

# Copier les dépendances
COPY package*.json ./
RUN npm install

# Copier le reste du projet
COPY . .

# Exposer le port de Vite
EXPOSE 5173

# Lancer le serveur en l'exposant au réseau Docker (--host)
CMD ["npm", "run", "dev", "--", "--host"]
