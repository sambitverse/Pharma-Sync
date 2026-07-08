import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const useRealDb = !!process.env.DATABASE_URL;
let pool = null;

// Initialize real PostgreSQL pool if configured
if (useRealDb) {
  console.log("Database: Connecting to PostgreSQL database...");
  pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Supabase / Heroku in many environments
  });

  pool.on('error', (err) => {
    console.error('PostgreSQL connection error:', err);
  });
} else {
  console.warn("==================================================================");
  console.warn("WARNING: DATABASE_URL not set in .env!");
  console.warn("Using local JSON file-based database fallback: server/config/mock_db.json");
  console.warn("==================================================================");
}

// Local mock database path
const mockDbPath = path.join(__dirname, 'mock_db.json');

// Helper to load mock DB data
const loadMockDb = () => {
  if (!fs.existsSync(mockDbPath)) {
    // Initial seeded structure
    const initialData = {
      users: [
        {
          id: 'admin-uuid-1111-2222-333333333333',
          name: 'Administrator',
          email: 'admin@health.com',
          // bcrypt hash for 'password123'
          password: '$2a$10$R9hK6F.f.gR5wWJ/B.44xeD0u4gR4J4fU.hF1p2iY6m2x2/4S8W5W',
          role: 'admin',
          created_at: new Date().toISOString()
        },
        {
          id: 'doctor-uuid-1111-2222-333333333333',
          name: 'Dr. Gregory House',
          email: 'doctor@health.com',
          password: '$2a$10$R9hK6F.f.gR5wWJ/B.44xeD0u4gR4J4fU.hF1p2iY6m2x2/4S8W5W',
          role: 'doctor',
          created_at: new Date().toISOString()
        },
        {
          id: 'patient-uuid-1111-2222-333333333333',
          name: 'John Doe',
          email: 'patient@health.com',
          password: '$2a$10$R9hK6F.f.gR5wWJ/B.44xeD0u4gR4J4fU.hF1p2iY6m2x2/4S8W5W',
          role: 'patient',
          created_at: new Date().toISOString()
        }
      ],
      patients: [
        {
          id: 'patient-profile-uuid',
          user_id: 'patient-uuid-1111-2222-333333333333',
          age: 35,
          gender: 'Male',
          medical_history: 'None, general consultation.',
          created_at: new Date().toISOString()
        }
      ],
      doctors: [
        {
          id: 'doctor-profile-uuid',
          user_id: 'doctor-uuid-1111-2222-333333333333',
          specialization: 'Diagnostic Medicine',
          created_at: new Date().toISOString()
        }
      ],
      appointments: [
        {
          id: 'appointment-1',
          patient_id: 'patient-profile-uuid',
          doctor_id: 'doctor-profile-uuid',
          date: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days in future
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ],
      prescriptions: [
        {
          id: 'prescription-1',
          patient_id: 'patient-profile-uuid',
          doctor_id: 'doctor-profile-uuid',
          medicines: 'Vicodin 5mg (Take 1 tablet every 6 hours)',
          notes: 'Take after food. Avoid alcohol.',
          created_at: new Date().toISOString()
        }
      ],
      medicines: [
        { id: 'med-1', name: 'Paracetamol 500mg', quantity: 120, created_at: new Date().toISOString() },
        { id: 'med-2', name: 'Amoxicillin 250mg', quantity: 8, created_at: new Date().toISOString() }, // low stock
        { id: 'med-3', name: 'Metformin 500mg', quantity: 45, created_at: new Date().toISOString() },
        { id: 'med-4', name: 'Ibuprofen 400mg', quantity: 90, created_at: new Date().toISOString() }
      ]
    };
    fs.writeFileSync(mockDbPath, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  return JSON.parse(fs.readFileSync(mockDbPath, 'utf-8'));
};

// Helper to save mock DB data
const saveMockDb = (data) => {
  fs.writeFileSync(mockDbPath, JSON.stringify(data, null, 2), 'utf-8');
};

// Standard query interface matching pg's pool.query
export const dbQuery = async (text, params = []) => {
  if (useRealDb) {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    // console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  }

  // Intercept SQL query with mock JS logic
  const db = loadMockDb();
  
  // Normalize spacing/newlines in query text
  const sql = text.replace(/\s+/g, ' ').trim();

  // 1. SELECT * FROM users WHERE email = $1
  if (sql.includes('SELECT * FROM users WHERE email =')) {
    const email = params[0];
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // If user is doctor or patient, inject details
    if (user) {
      if (user.role === 'patient') {
        const pat = db.patients.find(p => p.user_id === user.id);
        if (pat) {
          user.age = pat.age;
          user.gender = pat.gender;
          user.medical_history = pat.medical_history;
        }
      } else if (user.role === 'doctor') {
        const doc = db.doctors.find(d => d.user_id === user.id);
        if (doc) {
          user.specialization = doc.specialization;
        }
      }
    }
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }

  // 2. SELECT * FROM users WHERE id = $1
  if (sql.includes('SELECT * FROM users WHERE id =')) {
    const id = params[0];
    const user = db.users.find(u => u.id === id);
    if (user) {
      if (user.role === 'patient') {
        const pat = db.patients.find(p => p.user_id === user.id);
        if (pat) {
          user.age = pat.age;
          user.gender = pat.gender;
          user.medical_history = pat.medical_history;
        }
      } else if (user.role === 'doctor') {
        const doc = db.doctors.find(d => d.user_id === user.id);
        if (doc) {
          user.specialization = doc.specialization;
        }
      }
    }
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }

  // 3. INSERT INTO users
  if (sql.startsWith('INSERT INTO users')) {
    // INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *
    const newUser = {
      id: 'user-' + Math.random().toString(36).substr(2, 9),
      name: params[0],
      email: params[1],
      password: params[2],
      role: params[3],
      created_at: new Date().toISOString()
    };
    db.users.push(newUser);
    saveMockDb(db);
    return { rows: [newUser], rowCount: 1 };
  }

  // 4. INSERT INTO patients
  if (sql.startsWith('INSERT INTO patients')) {
    // INSERT INTO patients (user_id, age, gender, medical_history) VALUES ($1, $2, $3, $4) RETURNING *
    const newPatient = {
      id: 'patient-profile-' + Math.random().toString(36).substr(2, 9),
      user_id: params[0],
      age: params[1],
      gender: params[2],
      medical_history: params[3] || '',
      created_at: new Date().toISOString()
    };
    db.patients.push(newPatient);
    saveMockDb(db);
    return { rows: [newPatient], rowCount: 1 };
  }

  // 5. INSERT INTO doctors
  if (sql.startsWith('INSERT INTO doctors')) {
    // INSERT INTO doctors (user_id, specialization) VALUES ($1, $2) RETURNING *
    const newDoctor = {
      id: 'doctor-profile-' + Math.random().toString(36).substr(2, 9),
      user_id: params[0],
      specialization: params[1],
      created_at: new Date().toISOString()
    };
    db.doctors.push(newDoctor);
    saveMockDb(db);
    return { rows: [newDoctor], rowCount: 1 };
  }

  // 6. UPDATE users name AND profile (age/gender/med_history or specialization)
  if (sql.startsWith('UPDATE users SET name =')) {
    const name = params[0];
    const id = params[1];
    const userIndex = db.users.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      db.users[userIndex].name = name;
      saveMockDb(db);
      return { rows: [db.users[userIndex]], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }
  
  if (sql.startsWith('UPDATE patients SET age =')) {
    // UPDATE patients SET age = $1, gender = $2, medical_history = $3 WHERE user_id = $4
    const age = params[0];
    const gender = params[1];
    const medHistory = params[2];
    const userId = params[3];
    const patIndex = db.patients.findIndex(p => p.user_id === userId);
    if (patIndex !== -1) {
      db.patients[patIndex].age = age;
      db.patients[patIndex].gender = gender;
      db.patients[patIndex].medical_history = medHistory;
      saveMockDb(db);
      return { rows: [db.patients[patIndex]], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  if (sql.startsWith('UPDATE doctors SET specialization =')) {
    // UPDATE doctors SET specialization = $1 WHERE user_id = $2
    const spec = params[0];
    const userId = params[1];
    const docIndex = db.doctors.findIndex(d => d.user_id === userId);
    if (docIndex !== -1) {
      db.doctors[docIndex].specialization = spec;
      saveMockDb(db);
      return { rows: [db.doctors[docIndex]], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // 7. GET list of doctors
  if (sql.includes('SELECT d.id, u.name, d.specialization FROM doctors d JOIN users u')) {
    const list = db.doctors.map(d => {
      const u = db.users.find(usr => usr.id === d.user_id);
      return {
        id: d.id,
        name: u ? u.name : 'Unknown Doctor',
        specialization: d.specialization
      };
    });
    return { rows: list, rowCount: list.length };
  }

  // 8. GET list of patients (for doctors)
  if (sql.includes('SELECT p.id, u.name, p.age, p.gender, p.medical_history FROM patients p JOIN users u')) {
    const list = db.patients.map(p => {
      const u = db.users.find(usr => usr.id === p.user_id);
      return {
        id: p.id,
        name: u ? u.name : 'Unknown Patient',
        age: p.age,
        gender: p.gender,
        medical_history: p.medical_history
      };
    });
    return { rows: list, rowCount: list.length };
  }

  // 9. Appointments queries
  // 9a. Patient querying appointments
  if (sql.includes('WHERE a.patient_id =') || (sql.includes('appointments a') && params[0])) {
    const patientProfile = db.patients.find(p => p.user_id === params[0]);
    const doctorProfile = db.doctors.find(d => d.user_id === params[0]);

    let list = [];
    if (patientProfile) {
      // User is a patient
      list = db.appointments
        .filter(a => a.patient_id === patientProfile.id)
        .map(a => {
          const doc = db.doctors.find(d => d.id === a.doctor_id);
          const docUser = doc ? db.users.find(u => u.id === doc.user_id) : null;
          return {
            id: a.id,
            date: a.date,
            status: a.status,
            doctor_name: docUser ? docUser.name : 'Unknown',
            specialization: doc ? doc.specialization : 'N/A'
          };
        });
    } else if (doctorProfile) {
      // User is a doctor
      list = db.appointments
        .filter(a => a.doctor_id === doctorProfile.id)
        .map(a => {
          const pat = db.patients.find(p => p.id === a.patient_id);
          const patUser = pat ? db.users.find(u => u.id === pat.user_id) : null;
          return {
            id: a.id,
            date: a.date,
            status: a.status,
            patient_name: patUser ? patUser.name : 'Unknown',
            age: pat ? pat.age : 'N/A',
            gender: pat ? pat.gender : 'N/A',
            medical_history: pat ? pat.medical_history : ''
          };
        });
    }
    
    // Sort by date desc
    list.sort((a,b) => new Date(b.date) - new Date(a.date));
    return { rows: list, rowCount: list.length };
  }

  // 9b. Create appointment
  if (sql.startsWith('INSERT INTO appointments')) {
    // INSERT INTO appointments (patient_id, doctor_id, date) VALUES ($1, $2, $3)
    // First, find the patient id corresponding to params[0] (which is userId)
    const pat = db.patients.find(p => p.user_id === params[0]);
    if (!pat) throw new Error('Patient profile not found.');

    const newAppt = {
      id: 'appointment-' + Math.random().toString(36).substr(2, 9),
      patient_id: pat.id,
      doctor_id: params[1], // doctor id directly
      date: params[2],
      status: 'pending',
      created_at: new Date().toISOString()
    };
    db.appointments.push(newAppt);
    saveMockDb(db);
    return { rows: [newAppt], rowCount: 1 };
  }

  // 9c. Update appointment status
  if (sql.startsWith('UPDATE appointments SET status =')) {
    // UPDATE appointments SET status = $1 WHERE id = $2
    const status = params[0];
    const apptId = params[1];
    const idx = db.appointments.findIndex(a => a.id === apptId);
    if (idx !== -1) {
      db.appointments[idx].status = status;
      saveMockDb(db);
      return { rows: [db.appointments[idx]], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // 10. Prescriptions queries
  // 10a. Patient GET prescriptions
  if (sql.includes('prescriptions pr') && sql.includes('pr.patient_id =')) {
    // userId is params[0]
    const pat = db.patients.find(p => p.user_id === params[0]);
    if (!pat) return { rows: [], rowCount: 0 };

    const list = db.prescriptions
      .filter(pr => pr.patient_id === pat.id)
      .map(pr => {
        const doc = db.doctors.find(d => d.id === pr.doctor_id);
        const docUser = doc ? db.users.find(u => u.id === doc.user_id) : null;
        return {
          id: pr.id,
          medicines: pr.medicines,
          notes: pr.notes,
          created_at: pr.created_at,
          doctor_name: docUser ? docUser.name : 'Unknown',
          specialization: doc ? doc.specialization : 'N/A'
        };
      });
    return { rows: list, rowCount: list.length };
  }

  // 10b. Create prescription
  if (sql.startsWith('INSERT INTO prescriptions')) {
    // INSERT INTO prescriptions (patient_id, doctor_id, medicines, notes) VALUES ($1, $2, $3, $4)
    // params[1] is doctor's user_id, let's get doctor profile
    const doc = db.doctors.find(d => d.user_id === params[1]);
    if (!doc) throw new Error('Doctor profile not found.');

    const newPresc = {
      id: 'prescription-' + Math.random().toString(36).substr(2, 9),
      patient_id: params[0], // patient profile id
      doctor_id: doc.id,
      medicines: params[2],
      notes: params[3],
      created_at: new Date().toISOString()
    };
    db.prescriptions.push(newPresc);
    saveMockDb(db);
    return { rows: [newPresc], rowCount: 1 };
  }

  // 11. Medicines (Inventory) queries
  // 11a. GET medicines
  if (sql.includes('SELECT * FROM medicines')) {
    return { rows: db.medicines, rowCount: db.medicines.length };
  }

  // 11b. Add medicine
  if (sql.startsWith('INSERT INTO medicines')) {
    // INSERT INTO medicines (name, quantity) VALUES ($1, $2)
    const existing = db.medicines.find(m => m.name.toLowerCase() === params[0].toLowerCase());
    if (existing) {
      throw new Error('Medicine already exists in stock.');
    }
    const newMed = {
      id: 'med-' + Math.random().toString(36).substr(2, 9),
      name: params[0],
      quantity: params[1],
      created_at: new Date().toISOString()
    };
    db.medicines.push(newMed);
    saveMockDb(db);
    return { rows: [newMed], rowCount: 1 };
  }

  // 11c. Update stock quantity
  if (sql.startsWith('UPDATE medicines SET quantity =')) {
    // UPDATE medicines SET quantity = $1 WHERE id = $2
    const qty = params[0];
    const medId = params[1];
    const idx = db.medicines.findIndex(m => m.id === medId);
    if (idx !== -1) {
      db.medicines[idx].quantity = qty;
      saveMockDb(db);
      return { rows: [db.medicines[idx]], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // 11d. Delete medicine
  if (sql.startsWith('DELETE FROM medicines')) {
    const medId = params[0];
    db.medicines = db.medicines.filter(m => m.id !== medId);
    saveMockDb(db);
    return { rows: [], rowCount: 1 };
  }

  // 12. Admin Stats
  // Matches total counts for dashboard stats
  if (sql.includes('SELECT COUNT(*) FROM patients') || sql.includes('admin/stats')) {
    const patientsCount = db.users.filter(u => u.role === 'patient').length;
    const doctorsCount = db.users.filter(u => u.role === 'doctor').length;
    const appointmentsCount = db.appointments.length;
    const lowStockCount = db.medicines.filter(m => m.quantity <= 10).length;

    return {
      rows: [{
        patientsCount,
        doctorsCount,
        appointmentsCount,
        lowStockCount
      }],
      rowCount: 1
    };
  }

  // Generic COUNT queries mapping for mock fallback database
  if (sql.startsWith('SELECT COUNT')) {
    let count = 0;
    if (sql.includes('FROM patients')) {
      count = db.patients.length;
    } else if (sql.includes('FROM doctors')) {
      count = db.doctors.length;
    } else if (sql.includes('FROM appointments')) {
      if (params[0]) {
        // filter by patient_id or doctor_id
        const isDoc = sql.includes('doctor_id =');
        count = db.appointments.filter(a => isDoc ? a.doctor_id === params[0] : a.patient_id === params[0]).length;
      } else {
        count = db.appointments.length;
      }
    } else if (sql.includes('FROM prescriptions')) {
      if (params[0]) {
        count = db.prescriptions.filter(p => p.patient_id === params[0] || p.doctor_id === params[0]).length;
      } else {
        count = db.prescriptions.length;
      }
    } else if (sql.includes('FROM medicines')) {
      if (sql.includes('quantity <= 10')) {
        count = db.medicines.filter(m => m.quantity <= 10).length;
      } else {
        count = db.medicines.length;
      }
    }
    return { rows: [{ count: count.toString() }], rowCount: 1 };
  }

  // Default empty return
  return { rows: [], rowCount: 0 };
};
