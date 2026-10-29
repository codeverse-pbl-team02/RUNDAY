$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$toolRoot = Join-Path $PSScriptRoot '../node_modules/.cache/rundy-android'
New-Item -ItemType Directory -Path $toolRoot -Force | Out-Null
$toolRoot = (Resolve-Path -LiteralPath $toolRoot).Path
$jdkArchive = Join-Path $toolRoot 'jdk21.zip'
$toolsArchive = Join-Path $toolRoot 'android-commandline.zip'
if (-not (Get-ChildItem -LiteralPath $toolRoot -Directory -Filter 'jdk-*')) {
  Write-Output 'Downloading Microsoft OpenJDK 21...'
  if (-not (Test-Path -LiteralPath $jdkArchive)) { Invoke-WebRequest -UseBasicParsing -Uri 'https://aka.ms/download-jdk/microsoft-jdk-21-windows-x64.zip' -OutFile $jdkArchive }
  $jdkChecksum = (Invoke-WebRequest -UseBasicParsing -Uri 'https://aka.ms/download-jdk/microsoft-jdk-21-windows-x64.zip.sha256sum.txt').Content
  if ($jdkChecksum -is [byte[]]) { $jdkChecksum = [Text.Encoding]::UTF8.GetString($jdkChecksum) }
  $jdkExpected = [regex]::Match([string]$jdkChecksum, '[a-fA-F0-9]{64}').Value
  if (-not $jdkExpected -or (Get-FileHash -LiteralPath $jdkArchive -Algorithm SHA256).Hash -ne $jdkExpected) { throw 'JDK checksum mismatch' }
  Expand-Archive -LiteralPath $jdkArchive -DestinationPath $toolRoot -Force
}
$jdkDirectory = Get-ChildItem -LiteralPath $toolRoot -Directory -Filter 'jdk-*' | Select-Object -First 1
$env:JAVA_HOME = $jdkDirectory.FullName
$sdkRoot = Join-Path $toolRoot 'sdk'
if (-not (Test-Path -LiteralPath (Join-Path $sdkRoot 'cmdline-tools/latest/bin/sdkmanager.bat'))) {
  Write-Output 'Downloading Android command-line tools...'
  Invoke-WebRequest -UseBasicParsing -Uri 'https://dl.google.com/android/repository/commandlinetools-win-15859902_latest.zip' -OutFile $toolsArchive
  $staging = Join-Path $toolRoot 'android-cli-extract'
  Expand-Archive -LiteralPath $toolsArchive -DestinationPath $staging -Force
  New-Item -ItemType Directory -Path (Join-Path $sdkRoot 'cmdline-tools') -Force | Out-Null
  $sourcePath = (Resolve-Path -LiteralPath (Join-Path $staging 'cmdline-tools')).Path
  $targetPath = [IO.Path]::GetFullPath((Join-Path $sdkRoot 'cmdline-tools/latest'))
  if (-not $sourcePath.StartsWith($toolRoot + '\') -or -not $targetPath.StartsWith($toolRoot + '\')) { throw 'Invalid tool move path' }
  Move-Item -LiteralPath $sourcePath -Destination $targetPath
}
$env:ANDROID_HOME = $sdkRoot
$sdkManager = Join-Path $sdkRoot 'cmdline-tools/latest/bin/sdkmanager.bat'
Write-Output 'Installing Android SDK 36 and build tools...'
1..100 | ForEach-Object { 'y' } | & $sdkManager "--sdk_root=$sdkRoot" --licenses | Out-Null
& $sdkManager "--sdk_root=$sdkRoot" 'platforms;android-36' 'build-tools;36.0.0' 'platform-tools'
if ($LASTEXITCODE -ne 0) { throw 'Android SDK installation failed' }
Write-Output "Android tools ready: $toolRoot"
