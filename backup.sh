#!/bin/sh

dest="/var/www/debatewithdata/backups/$(date +%s).json.tgz"
tar czf $dest /var/www/debatewithdata/db.json
echo "Backed up db.json to $dest"
