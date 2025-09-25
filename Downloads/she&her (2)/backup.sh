#!/bin/bash

# She&Her Database Backup Script
# This script creates a complete backup of the current system state

echo "🚀 Starting She&Her Comprehensive Backup..."

# Create backup directory with timestamp
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📁 Created backup directory: $BACKUP_DIR"

# 1. Git Backup
echo "💾 Creating Git backup..."
git status > "$BACKUP_DIR/git-status.txt"
git log --oneline -10 > "$BACKUP_DIR/git-log.txt"
git diff > "$BACKUP_DIR/git-diff.patch"
git diff --cached > "$BACKUP_DIR/git-staged.patch"

# 2. Database Schema Backup
echo "🗄️ Creating database schema backup..."
cp convex/schema.ts "$BACKUP_DIR/schema-backup.ts"

# 3. Configuration Backup
echo "⚙️ Creating configuration backup..."
cp -r .env* "$BACKUP_DIR/" 2>/dev/null || echo "No .env files found"
cp convex.json "$BACKUP_DIR/"
cp package.json "$BACKUP_DIR/"
cp vite.config.ts "$BACKUP_DIR/"

# 4. Source Code Backup
echo "💻 Creating source code backup..."
mkdir -p "$BACKUP_DIR/src"
cp -r components/ "$BACKUP_DIR/components/" 2>/dev/null || echo "No components directory"
cp -r convex/ "$BACKUP_DIR/convex-backup/" 2>/dev/null || echo "No convex directory"
cp -r types.ts utils.ts constants.ts "$BACKUP_DIR/" 2>/dev/null || echo "Some files missing"

# 5. Documentation Backup
echo "📚 Creating documentation backup..."
cp README.md "$BACKUP_DIR/" 2>/dev/null || echo "No README found"

# 6. Create restore script
cat > "$BACKUP_DIR/restore.sh" << 'EOF'
#!/bin/bash
echo "🔄 She&Her Restore Script"
echo "⚠️  WARNING: This will restore the system to the backup state!"
echo "Press Ctrl+C to cancel or wait 10 seconds to continue..."
sleep 10

echo "🔄 Restoring Git state..."
git checkout backup-pre-comprehensive-implementation 2>/dev/null || echo "Could not restore git branch"

echo "🔄 Restoring database schema..."
cp schema-backup.ts ../convex/schema.ts 2>/dev/null || echo "Could not restore schema"

echo "🔄 Restoring configuration..."
cp .env* ../ 2>/dev/null || echo "No .env files to restore"
cp convex.json ../ 2>/dev/null || echo "No convex.json to restore"

echo "✅ Restore complete! Please restart your development servers."
EOF

chmod +x "$BACKUP_DIR/restore.sh"

# 7. Create summary
cat > "$BACKUP_DIR/BACKUP-README.md" << EOF
# She&Her Backup: $(date)

## 📋 Backup Contents

### Git State
- Current status and recent commits
- Uncommitted changes (patch files)
- Staged changes (if any)

### Database
- Complete schema backup
- All Convex functions and data structures

### Configuration
- Environment variables
- Build configuration
- Package dependencies

### Source Code
- All components and utilities
- Type definitions
- Constants and business logic

## 🔄 How to Restore

If anything goes wrong during the implementation:

1. **Stop all development servers**
2. **Run the restore script:**
   ```bash
   cd $BACKUP_DIR
   ./restore.sh
   ```

3. **Verify the restore:**
   ```bash
   git status
   npm install
   npm start
   ```

## 📞 Emergency Contact

If restore fails, contact the development team immediately.
The backup branch \`backup-pre-comprehensive-implementation\` is also available.
EOF

echo "✅ Backup complete!"
echo "📂 Backup location: $(pwd)/$BACKUP_DIR"
echo "🔄 Restore script: $(pwd)/$BACKUP_DIR/restore.sh"
echo ""
echo "⚠️  IMPORTANT: Keep this backup safe!"
echo "📋 Next step: Begin Phase 1 implementation"
