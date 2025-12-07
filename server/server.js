import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { inngest, functions } from './inngest/index.js';
import { serve } from 'inngest/express';

const app = express();

await connectDB();

app.use(express.json());
app.use(cors());

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    inngestFunctions: functions.length,
    functionsRegistered: functions.map(f => f.id)
  });
});

// Test endpoint to manually trigger events
app.post('/api/webhook-test', async (req, res) => {
  console.log('\n🧪 === TEST WEBHOOK RECEIVED ===');
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  try {
    await inngest.send({
      name: 'clerk/user.created',
      data: req.body
    });
    
    console.log('✅ Event sent to Inngest successfully');
    res.json({ 
      success: true, 
      message: 'Event sent to Inngest',
      eventName: 'clerk/user.created'
    });
  } catch (error) {
    console.error('❌ Error sending to Inngest:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Inngest endpoint with logging
app.use('/api/inngest', (req, res, next) => {
  console.log('\n🔔 === INNGEST ENDPOINT HIT ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  console.log('=========================\n');
  next();
}, serve({ 
  client: inngest, 
  functions
}));

// 404 handler
app.use((req, res) => {
  console.log('❌ 404 - Route not found:', req.method, req.path);
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log('\n🚀 ================================');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`📍 Inngest endpoint: http://localhost:${PORT}/api/inngest`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/webhook-test`);
  console.log(`📊 Registered Inngest functions: ${functions.length}`);
  functions.forEach((fn, i) => {
    console.log(`   ${i + 1}. ${fn.id || fn.name || 'unnamed'}`);
  });
  console.log('================================\n');
  console.log('💡 Next steps:');
  console.log('1. Make sure Inngest dev server is running: npx inngest-cli@latest dev');
  console.log('2. Visit http://localhost:8288 to see Inngest dashboard');
  console.log('3. Check if your functions appear in the dashboard\n');
});