# Usa un'immagine base di Node.js
FROM node:18-alpine


# Imposta la directory di lavoro all'interno del container
WORKDIR /Tiberia

# Copia i file package.json e package-lock.json
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia il resto dei file del progetto
COPY . .

# Espone la porta su cui il server ascolta
EXPOSE 4000

# Comando per avviare l'applicazione
CMD ["node", "index.js"]
