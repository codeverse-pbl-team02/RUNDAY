param([int]$VersionCode = 1, [string]$VersionName = '1.0.0')
$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$toolRoot = Join-Path $projectRoot 'node_modules/.cache/rundy-android'
$jdkDirectory = Get-ChildItem -LiteralPath $toolRoot -Directory -Filter 'jdk-*' | Select-Object -First 1
if (-not $jdkDirectory) { throw 'Run scripts/setup-android-tools.ps1 first.' }
if (-not (Test-Path -LiteralPath (Join-Path $projectRoot 'android/key.properties'))) { throw 'Run scripts/create-android-upload-key.ps1 first.' }
if (-not (Test-Path -LiteralPath (Join-Path $projectRoot 'android/app/google-services.json'))) { throw 'Firebase Android configuration android/app/google-services.json is required.' }
$appId = (Get-Content -LiteralPath (Join-Path $projectRoot 'capacitor.config.json') -Raw -Encoding UTF8 | ConvertFrom-Json).appId
$firebaseConfig = Get-Content -LiteralPath (Join-Path $projectRoot 'android/app/google-services.json') -Raw -Encoding UTF8 | ConvertFrom-Json
if ($appId -ne 'com.rundy.app' -or 'com.rundy.app' -notin @($firebaseConfig.client.client_info.android_client_info.package_name)) { throw 'Android package must match the Play Console package com.rundy.app and Firebase configuration.' }
$env:JAVA_HOME = $jdkDirectory.FullName
$env:ANDROID_HOME = Join-Path $toolRoot 'sdk'
$env:GRADLE_USER_HOME = Join-Path $toolRoot 'gradle-cache'
$sdkProperty = 'sdk.dir=' + $env:ANDROID_HOME.Replace('\','/').Replace(':','\:')
$sdkProperty | Set-Content -LiteralPath (Join-Path $projectRoot 'android/local.properties') -Encoding ASCII
Push-Location $projectRoot
try {
  & npm.cmd run firebase:check
  if ($LASTEXITCODE -ne 0) { throw 'Firebase configuration validation failed' }
  & npm.cmd run typecheck
  if ($LASTEXITCODE -ne 0) { throw 'TypeScript check failed' }
  & npm.cmd run build
  if ($LASTEXITCODE -ne 0) { throw 'Web build failed' }
  & (Join-Path $projectRoot 'node_modules/.bin/cap.cmd') sync android
  if ($LASTEXITCODE -ne 0) { throw 'Capacitor sync failed' }
  Push-Location (Join-Path $projectRoot 'android')
  try {
    & .\gradlew.bat --no-daemon ":app:bundleRelease" ":app:assembleRelease" ":app:lintRelease" "-PrundyVersionCode=$VersionCode" "-PrundyVersionName=$VersionName"
    if ($LASTEXITCODE -ne 0) { throw 'Android build failed' }
  } finally { Pop-Location }
  $destination = Join-Path $projectRoot 'output/android'
  New-Item -ItemType Directory -Path $destination -Force | Out-Null
  Copy-Item -LiteralPath (Join-Path $projectRoot 'android/app/build/outputs/bundle/release/app-release.aab') -Destination (Join-Path $destination "$appId-$VersionName-$VersionCode.aab")
  Copy-Item -LiteralPath (Join-Path $projectRoot 'android/app/build/outputs/apk/release/app-release.apk') -Destination (Join-Path $destination "$appId-$VersionName-$VersionCode.apk")
  & (Join-Path $env:JAVA_HOME 'bin/jarsigner.exe') -verify (Join-Path $destination "$appId-$VersionName-$VersionCode.aab")
  if ($LASTEXITCODE -ne 0) { throw 'App Bundle signature verification failed' }
  Write-Output "Signed Android artifacts ready: $destination"
} finally { Pop-Location }
