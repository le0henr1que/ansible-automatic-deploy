# Use uma imagem base do Node.js
FROM node:20-alpine

# Defina o diretório de trabalho
WORKDIR /app

# Copie o package.json e o package-lock.json
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie o restante do código da aplicação
COPY . .

# Construa a aplicação
RUN npm run build

# Exponha a porta que a aplicação irá rodar
EXPOSE 5173

# Comando para iniciar a aplicação
CMD ["npm", "dev"]