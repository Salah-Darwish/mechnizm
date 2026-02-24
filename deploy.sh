#!/bin/bash

# 🚀 Quick Deploy Script for Makanizm to Vercel
# Run this script to push to GitHub and deploy

echo "📦 Makanizm - Quick Deploy to Vercel"
echo "===================================="
echo ""

# Step 1: Push to GitHub
echo "📤 Step 1: Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🌐 Next Steps:"
    echo "1. Go to https://vercel.com"
    echo "2. Click 'Add New Project'"
    echo "3. Import: Ahmed-Sallam22/Makanezm"
    echo "4. Click 'Deploy'"
    echo ""
    echo "📝 Your project will be live at: https://makanezm.vercel.app (or similar)"
    echo ""
    echo "🔑 Admin Credentials:"
    echo "   Email: admin@gmail.com"
    echo "   Password: admin123"
else
    echo "❌ Error: Failed to push to GitHub"
    echo "Please check your GitHub credentials and repository access"
fi
