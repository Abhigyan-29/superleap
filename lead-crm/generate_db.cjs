const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const statuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'];
const sources = ['website', 'referral', 'campaign', 'organic', 'direct'];

const generateName = () => {
  const firsts = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy', 'Mallory', 'Oscar', 'Peggy', 'Trent', 'Victor', 'Walter'];
  const lasts = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris'];
  return `${firsts[Math.floor(Math.random() * firsts.length)]} ${lasts[Math.floor(Math.random() * lasts.length)]}`;
};

const leads = [];

// Generate exactly 50 leads for testing
for (let i = 0; i < 50; i++) {
  const name = generateName();
  const email = `${name.replace(' ', '.').toLowerCase()}${i}@example.com`;
  const created_at = new Date(Date.now() - Math.random() * 10000000000).toISOString();
  
  leads.push({
    id: uuidv4(),
    name,
    email,
    phone: `+1-555-${Math.floor(1000 + Math.random() * 9000)}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    source: sources[Math.floor(Math.random() * sources.length)],
    created_at,
    updated_at: created_at,
  });
}

const db = { leads };
fs.writeFileSync('db.json', JSON.stringify(db, null, 2));
console.log('db.json generated with 5000 leads.');
