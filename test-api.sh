#!/bin/bash

echo "🧪 Testing France Public Data API"
echo "=================================="
echo ""

echo "1️⃣  Testing Health Check..."
curl -s http://localhost:3000/api/v1/health | jq '.'
echo ""
echo ""

echo "2️⃣  Testing Inflation API (last 5 records)..."
curl -s "http://localhost:3000/api/v1/inflation?limit=5" | jq '.'
echo ""
echo ""

echo "3️⃣  Testing Population API (Nantes)..."
curl -s "http://localhost:3000/api/v1/population/44109?yearStart=2020" | jq '.'
echo ""
echo ""

echo "✅ API Tests Complete!"
echo ""
echo "📚 View full documentation at: http://localhost:3000/api-docs"
