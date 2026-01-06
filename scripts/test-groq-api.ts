// scripts/test-groq-api.ts
// Simple script to test GROQ API key with Llama model

import Groq from 'groq-sdk';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testGroqApi() {
  const apiKey = process.env.GROQ_API_KEY;

  console.log('\n🔍 Testing GROQ API Key...\n');

  // Check if API key exists
  if (!apiKey) {
    console.error('❌ GROQ_API_KEY not found in environment variables!');
    console.log('\nMake sure your .env file contains:');
    console.log('GROQ_API_KEY=your-api-key-here\n');
    process.exit(1);
  }

  console.log('✅ GROQ_API_KEY found (length:', apiKey.length, 'characters)');
  console.log('   Key prefix:', apiKey.substring(0, 8) + '...');

  // Initialize Groq client
  const groq = new Groq({ apiKey });

  try {
    console.log('\n🚀 Testing connection to Llama model...');
    console.log('   Model: llama-3.3-70b-versatile\n');

    const startTime = Date.now();

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: 'Say "Hello, DevInsights!" in exactly 5 words.',
        },
      ],
      temperature: 0.3,
      max_tokens: 50,
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    const response = completion.choices[0]?.message?.content;

    console.log('✅ API Connection Successful!\n');
    console.log('📊 Response Details:');
    console.log('   - Model used:', completion.model);
    console.log('   - Response time:', responseTime, 'ms');
    console.log('   - Tokens used:', completion.usage?.total_tokens || 'N/A');
    console.log('\n💬 AI Response:', response);
    console.log('\n✨ Your GROQ API key is working correctly!\n');

  } catch (error: any) {
    console.error('\n❌ API Test Failed!\n');

    if (error.status === 401) {
      console.error('🔑 Invalid API Key');
      console.error('   Please check your GROQ_API_KEY is correct.');
    } else if (error.status === 429) {
      console.error('⏱️ Rate Limit Exceeded');
      console.error('   Wait a moment and try again.');
    } else if (error.status === 503) {
      console.error('🔧 Service Unavailable');
      console.error('   GROQ service may be temporarily down.');
    } else {
      console.error('Error:', error.message || error);
    }

    console.log('\n📖 Full error details:');
    console.log(JSON.stringify(error, null, 2));
    process.exit(1);
  }
}

testGroqApi();
