// Test script para probar la Edge Function directamente
// Ejecuta esto en la consola del navegador

fetch('https://tnqtlltiwoocwajorglp.supabase.co/functions/v1/stripe-checkout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRucXRsbHRpd29vY3dham9yZ2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI1NDE4MzQsImV4cCI6MjAzODExNzgzNH0.RlWinTKTbBOJJH2A-8lE_xGSJw6eTXBxTqPw7rwJ9jk'
  },
  body: JSON.stringify({
    priceId: 'price_1RrR7YQnqQD67bKrYv3Yh5Qm',
    userId: 'e9e38985-3479-4b6c-9d24-013e6f0e9f5b',
    successUrl: 'http://localhost:8080/profile?success=true',
    cancelUrl: 'http://localhost:8080/pricing?canceled=true'
  })
})
.then(response => {
  console.log('Response status:', response.status);
  return response.text();
})
.then(data => {
  console.log('Response data:', data);
})
.catch(error => {
  console.error('Error:', error);
});
