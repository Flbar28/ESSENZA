import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ybnluemcgvtjqpktacxu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlibmx1ZW1jZ3Z0anFwa3RhY3h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2OTgyMTIsImV4cCI6MjA4OTI3NDIxMn0.sx6CmuV7AgWABl4r2m9iuQAb6vUd7fQeK5Jy_mrd4XU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing insert...');
  const { data, error } = await supabase.from('products').insert({
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    image_url: 'https://example.com/test.jpg',
    category: 'unissex',
  }).select().single();
  
  if (error) {
    console.error('Error inserting:', error);
  } else {
    console.log('Inserted:', data);
    
    console.log('Testing update...');
    const updateRes = await supabase.from('products').update({ price: 100 }).eq('id', data.id).select().single();
    if (updateRes.error) console.error('Error updating:', updateRes.error);
    else console.log('Updated:', updateRes.data);
    
    console.log('Testing delete...');
    const deleteRes = await supabase.from('products').delete().eq('id', data.id);
    if (deleteRes.error) console.error('Error deleting:', deleteRes.error);
    else console.log('Deleted successfully.');
  }
}

test();
