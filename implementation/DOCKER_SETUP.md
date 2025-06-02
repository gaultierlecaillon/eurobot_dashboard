# Docker Setup for MongoDB

## If you get a "container name already in use" error:

The MongoDB container already exists. You have a few options:

### Option 1: Start the existing container
```bash
docker start eurobot-mongo
```

### Option 2: Remove the existing container and create a new one
```bash
docker rm eurobot-mongo
docker run --name eurobot-mongo -p 27017:27017 -d mongo:latest
```

### Option 3: Use a different container name
```bash
docker run --name eurobot-mongo-new -p 27017:27017 -d mongo:latest
```

## Check if MongoDB is running
```bash
# Check running containers
docker ps

# Check all containers (including stopped ones)
docker ps -a

# Check MongoDB logs
docker logs eurobot-mongo
```

## Connect to MongoDB
Once the container is running, MongoDB will be available at:
- Host: `localhost`
- Port: `27017`
- Connection string: `mongodb://localhost:27017/eurobot_dashboard`

## Troubleshooting

### Container won't start
```bash
# Check container status
docker ps -a

# View container logs
docker logs eurobot-mongo

# Remove and recreate if needed
docker rm eurobot-mongo
docker run --name eurobot-mongo -p 27017:27017 -d mongo:latest
```

### Port already in use
If port 27017 is already in use, you can use a different port:
```bash
docker run --name eurobot-mongo -p 27018:27017 -d mongo:latest
```

Then update your `.env.local` file:
```env
MONGODB_URI=mongodb://localhost:27018/eurobot_dashboard
```

### Access MongoDB shell
```bash
docker exec -it eurobot-mongo mongosh
