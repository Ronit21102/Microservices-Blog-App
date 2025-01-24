FROM node:alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if present)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application files
COPY . .

# Expose the application port (optional, but useful if you use a specific port)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
