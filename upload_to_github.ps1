# Upload to GitHub Script
# רץ על הסקריפט הזה כדי לעלות שינויים לגיטהאב

# מוסיף את כל השינויים
git add .

# שואל אותך לכתוב הודעת commit
Write-Host "הכנס הודעת commit (או לחץ Enter לברירת מחדל):"
$commitMessage = Read-Host
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Updated $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

# עושה commit
git commit -m $commitMessage

# מעלה לגיטהאב
git push origin master

Write-Host "השינויים הועלו לגיטהאב בהצלחה!" -ForegroundColor Green
Write-Host "אתר הפרויקט: https://github.com/Royyosef23/roy_parks" -ForegroundColor Cyan
