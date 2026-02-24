#!/bin/bash

# Script to replace old orange colors with new secondary color #c4886a

# Define colors
OLD_COLOR_1="#F65331"
OLD_COLOR_2="#f65331"
OLD_COLOR_3="#e54525"
OLD_COLOR_4="#d94424"
NEW_COLOR="#c4886a"
NEW_HOVER="#b47858"

# List of files to update
FILES=(
  "src/components/Footer/Footer.tsx"
  "src/components/HeroSlider/HeroSlider.tsx"
  "src/components/TopLoader/TopLoader.tsx"
  "src/components/Header/Header.tsx"
  "src/pages/Home/sections/SalesReport/SalesReport.tsx"
  "src/pages/Home/sections/ProductsHome/ProductsHome.tsx"
  "src/pages/Contact/Contact.tsx"
  "src/pages/Products/Products.tsx"
  "src/pages/Privacy/Privacy.tsx"
  "src/pages/FAQ/FAQ.tsx"
  "src/pages/About/About.tsx"
  "src/pages/Dashboard/InvestmentPayoutsTab.tsx"
  "src/pages/Dashboard/AdminProductsTab.tsx"
  "src/pages/Dashboard/SettingsTab.tsx"
  "src/pages/Dashboard/ContactMessagesTab.tsx"
  "src/pages/Dashboard/Dashboard.tsx"
  "src/pages/Dashboard/UsersTab.tsx"
  "src/pages/Dashboard/MyInvestmentsTab.tsx"
  "src/pages/Dashboard/ReportsTab.tsx"
  "src/pages/Dashboard/DiscountCodesTab.tsx"
  "src/pages/ProductDetails/ProductDetails.tsx"
  "src/pages/Cart/Cart.tsx"
  "src/pages/PaymentResult/index.tsx"
  "src/pages/Login/Login.tsx"
)

echo "Starting color replacement..."

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Updating: $file"
    # Replace hex colors
    sed -i '' "s/$OLD_COLOR_1/$NEW_COLOR/g" "$file"
    sed -i '' "s/$OLD_COLOR_2/$NEW_COLOR/g" "$file"
    sed -i '' "s/$OLD_COLOR_3/$NEW_HOVER/g" "$file"
    sed -i '' "s/$OLD_COLOR_4/$NEW_HOVER/g" "$file"
  else
    echo "File not found: $file"
  fi
done

echo "Color replacement completed!"
