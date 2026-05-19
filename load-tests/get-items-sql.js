import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 20 }, 
    { duration: '30s', target: 20 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<600'], 
  },
};

export default function () {
  const category = "laptop";
  const encodedCategory = encodeURIComponent(category);
  const url = `http://localhost:3000/api/sql/items?category=${encodedCategory}&limit=10`;
  const res = http.get(url);
  if (res.status !== 200) {
    console.log(`Error Status: ${res.status} | Body: ${res.body}`);
  }
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
}