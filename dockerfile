# Utiliza una imagen base de Node.js
FROM node

# Establece el directorio de trabajo
WORKDIR /usr/src/app

# Copia el package.json y el package-lock.json
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia el resto de los archivos del proyecto
COPY . .

# Expone el puerto en el que la aplicación correrá
EXPOSE 3000

# Define el comando para ejecutar la aplicación
CMD ["npm", "run", "dev"]
