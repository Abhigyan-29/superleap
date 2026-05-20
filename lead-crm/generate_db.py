import json, uuid, random, datetime

statuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST']
sources = ['website', 'referral', 'campaign', 'organic', 'direct']
firsts = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy', 'Mallory', 'Oscar', 'Peggy', 'Trent', 'Victor', 'Walter']
lasts = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris']

leads = []
now = datetime.datetime.now()

for i in range(5000):
    first = random.choice(firsts)
    last = random.choice(lasts)
    name = f"{first} {last}"
    email = f"{first.lower()}.{last.lower()}{i}@example.com"
    # random delta up to 100 days
    delta = datetime.timedelta(seconds=random.randint(0, 8640000))
    created_at = (now - delta).isoformat() + "Z"
    
    leads.append({
        "id": str(uuid.uuid4()),
        "name": name,
        "email": email,
        "phone": f"+1-555-{random.randint(1000, 9999)}",
        "status": random.choice(statuses),
        "source": random.choice(sources),
        "created_at": created_at,
        "updated_at": created_at
    })

with open('db.json', 'w') as f:
    json.dump({"leads": leads}, f, indent=2)
    
print("Successfully generated 5000 leads in db.json")
