#!/bin/bash

echo "🎮 Fodinha - Build Script"
echo "========================="
echo ""

# Build Backend
echo "📦 Building Backend..."
cd backend
npm install
npm run build
echo "✅ Backend build complete!"
echo ""

# Build Frontend
echo "📦 Building Frontend..."
cd ../frontend
npm install
npm run build
echo "✅ Frontend build complete!"
echo ""

echo "🎉 Build finalizado!"
echo ""
echo "📁 Arquivos prontos para deploy:"
echo "   Backend: backend/dist/"
echo "   Frontend: frontend/dist/"
echo ""
echo "📖 Consulte DEPLOY.md para instruções de deploy"
