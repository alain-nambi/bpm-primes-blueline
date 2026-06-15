$date = Get-Date -Format "yyyy-MM-dd_HHmm"
$file = "backup_$date.sql"
docker exec -t bpm_postgres pg_dump -U postgres bpm_primes_db > $file
if ($?) { Write-Host "✔ Sauvegarde créée : $file" -ForegroundColor Green }
else { Write-Host "✖ Erreur" -ForegroundColor Red }
