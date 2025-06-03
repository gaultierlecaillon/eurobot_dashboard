// MongoDB initialization script
db = db.getSiblingDB('eurobot');

// Create collections
db.createCollection('teams');
db.createCollection('matches');
db.createCollection('rankings');

// Create indexes for better performance
db.teams.createIndex({ "name": 1 });
db.teams.createIndex({ "stand": 1 });
db.matches.createIndex({ "serie": 1 });
db.matches.createIndex({ "matchNumber": 1 });
db.rankings.createIndex({ "serie": 1 });
db.rankings.createIndex({ "position": 1 });

print('Database initialized successfully');
