const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const Team = require('../models/Team');
const Match = require('../models/Match');
const Ranking = require('../models/Ranking');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/eurobot?authSource=admin';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv({ separator: ';' }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function seedTeams() {
  console.log('Seeding teams...');
  const teams = new Set();
  
  // Extract teams from all ranking files
  for (let serie = 1; serie <= 3; serie++) {
    const filePath = path.join(__dirname, '../data', `classement_serie_${serie}.csv`);
    const data = await parseCSV(filePath);
    
    data.forEach(row => {
      if (row['Équipe'] && row['Stand'] && row['Origine']) {
        teams.add(JSON.stringify({
          name: row['Équipe'].trim(),
          stand: row['Stand'].trim(),
          origin: row['Origine'].trim()
        }));
      }
    });
  }
  
  // Convert back to objects and save
  const teamObjects = Array.from(teams).map(teamStr => JSON.parse(teamStr));
  
  await Team.deleteMany({});
  await Team.insertMany(teamObjects);
  console.log(`Seeded ${teamObjects.length} teams`);
}

async function seedMatches() {
  console.log('Seeding matches...');
  
  await Match.deleteMany({});
  
  for (let serie = 1; serie <= 3; serie++) {
    const filePath = path.join(__dirname, '../data', `matchs_serie_${serie}.csv`);
    const data = await parseCSV(filePath);
    
    const matches = data.map(row => ({
      matchNumber: parseInt(row['#']),
      serie: serie,
      team1: {
        name: row['Équipe 1'].trim(),
        stand: row[''].trim(), // First stand column
        score: parseInt(row['Score'])
      },
      team2: {
        name: row['Équipe 2'].trim(),
        stand: row[' '].trim(), // Second stand column (note the space)
        score: parseInt(row[' ']) // Second score column
      }
    })).filter(match => 
      !isNaN(match.matchNumber) && 
      match.team1.name && 
      match.team2.name &&
      !isNaN(match.team1.score) &&
      !isNaN(match.team2.score)
    );
    
    await Match.insertMany(matches);
    console.log(`Seeded ${matches.length} matches for serie ${serie}`);
  }
}

async function seedRankings() {
  console.log('Seeding rankings...');
  
  await Ranking.deleteMany({});
  
  for (let serie = 1; serie <= 3; serie++) {
    const filePath = path.join(__dirname, '../data', `classement_serie_${serie}.csv`);
    const data = await parseCSV(filePath);
    
    const rankings = data.map((row, index) => {
      const position = row[''] || (index + 1); // Use index if position is empty
      return {
        serie: serie,
        position: typeof position === 'string' ? 
          parseInt(position.replace(/\D/g, '')) || (index + 1) : 
          position,
        team: {
          name: row['Équipe'].trim(),
          stand: row['Stand'].trim(),
          origin: row['Origine'].trim()
        },
        points: parseInt(row['Cumul']) || 0,
        matchesPlayed: parseInt(row['Joués']) || 0,
        victories: parseInt(row['Vict.']) || 0,
        draws: parseInt(row['Égal.']) || 0,
        defeats: parseInt(row['Déf.']) || 0
      };
    }).filter(ranking => 
      ranking.team.name && 
      ranking.team.stand && 
      ranking.team.origin
    );
    
    await Ranking.insertMany(rankings);
    console.log(`Seeded ${rankings.length} rankings for serie ${serie}`);
  }
}

async function seed() {
  try {
    await connectDB();
    
    await seedTeams();
    await seedMatches();
    await seedRankings();
    
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seed();
}

module.exports = { seed };
