$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$keyDirectory = Join-Path $projectRoot 'credentials/android'
$keyPath = Join-Path $keyDirectory 'rundy-upload.jks'
$propertiesPath = Join-Path $projectRoot 'android/key.properties'
if ((Test-Path -LiteralPath $keyPath) -or (Test-Path -LiteralPath $propertiesPath)) {
  if ((Test-Path -LiteralPath $keyPath) -and (Test-Path -LiteralPath $propertiesPath)) { Write-Output 'Existing upload key preserved.'; exit 0 }
  throw 'Incomplete signing setup exists. Restore the existing key and key.properties; do not replace the key.'
}
$jdkDirectory = Get-ChildItem -LiteralPath (Join-Path $projectRoot 'node_modules/.cache/rundy-android') -Directory -Filter 'jdk-*' | Select-Object -First 1
if (-not $jdkDirectory) { throw 'Run scripts/setup-android-tools.ps1 first.' }
New-Item -ItemType Directory -Path $keyDirectory -Force | Out-Null
$random = New-Object byte[] 32
$generator = [Security.Cryptography.RandomNumberGenerator]::Create()
$generator.GetBytes($random)
$generator.Dispose()
$signingPassword = [Convert]::ToBase64String($random).TrimEnd('=').Replace('+','-').Replace('/','_')
$env:RUNDAY_UPLOAD_KEY_PASSWORD = $signingPassword
try {
  & (Join-Path $jdkDirectory.FullName 'bin/keytool.exe') -genkeypair -keystore $keyPath -storetype JKS -alias rundy-upload -keyalg RSA -keysize 3072 -validity 10000 -dname 'CN=Rundy Upload, OU=Android, O=Rundy, C=KR' -storepass:env RUNDAY_UPLOAD_KEY_PASSWORD -keypass:env RUNDAY_UPLOAD_KEY_PASSWORD
  if ($LASTEXITCODE -ne 0) { throw 'Could not generate upload key' }
  @("storeFile=../credentials/android/rundy-upload.jks", "storePassword=$signingPassword", 'keyAlias=rundy-upload', "keyPassword=$signingPassword") | Set-Content -LiteralPath $propertiesPath -Encoding ASCII
  @{ packageName = 'com.rundy.app'; keyAlias = 'rundy-upload'; storePassword = $signingPassword; keyPassword = $signingPassword; keyFile = 'rundy-upload.jks' } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $keyDirectory 'upload-key-backup.json') -Encoding UTF8
  $certificate = Join-Path $keyDirectory 'rundy-upload-certificate.pem'
  & (Join-Path $jdkDirectory.FullName 'bin/keytool.exe') -exportcert -rfc -keystore $keyPath -alias rundy-upload -storepass:env RUNDAY_UPLOAD_KEY_PASSWORD -file $certificate
  & (Join-Path $jdkDirectory.FullName 'bin/keytool.exe') -list -v -keystore $keyPath -alias rundy-upload -storepass:env RUNDAY_UPLOAD_KEY_PASSWORD | Select-String 'SHA1:|SHA256:'
  Write-Output 'Upload key generated. Back up credentials/android and android/key.properties securely.'
} finally { Remove-Item Env:RUNDAY_UPLOAD_KEY_PASSWORD -ErrorAction SilentlyContinue }
