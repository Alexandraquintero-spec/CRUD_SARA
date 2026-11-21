# =====================================================================
# SARA · Instalación de la base de datos en PostgreSQL (Windows)
#
# Uso (desde la carpeta del proyecto):
#   powershell -ExecutionPolicy Bypass -File database\setup_bd.ps1
#
# Pide la contraseña del superusuario "postgres" y la clave que tendrá
# el rol "sara_api". Ejecuta en orden: 00_crear_bd, 01_ddl, 02_dml, 03_dcl.
# Las contraseñas solo se usan en esta terminal; no se guardan en archivos.
# =====================================================================
param(
    [string]$PgBin = "C:\Program Files\PostgreSQL\18\bin",
    [string]$Servidor = "localhost",
    [int]$Puerto = 5432
)

$ErrorActionPreference = "Stop"
$psql = Join-Path $PgBin "psql.exe"
if (-not (Test-Path $psql)) {
    $encontrado = Get-ChildItem "C:\Program Files\PostgreSQL" -Recurse -Filter psql.exe -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($null -eq $encontrado) { throw "No se encontró psql.exe. Indique la ruta con -PgBin." }
    $psql = $encontrado.FullName
}
$carpeta = Split-Path -Parent $MyInvocation.MyCommand.Path

function Read-Clave([string]$mensaje) {
    $seguro = Read-Host $mensaje -AsSecureString
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($seguro)
    try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}

$env:PGPASSWORD = Read-Clave "Contraseña del usuario postgres"
$claveApi = Read-Clave "Clave para el rol sara_api (la misma que pondrá en DB_PASSWORD del .env)"
$env:PGCLIENTENCODING = "UTF8"

function Invoke-Script([string]$base, [string]$archivo, [string[]]$extra = @()) {
    Write-Host "-> Ejecutando $archivo en $base ..." -ForegroundColor Cyan
    & $psql -h $Servidor -p $Puerto -U postgres -d $base -v ON_ERROR_STOP=1 @extra -f (Join-Path $carpeta $archivo)
    if ($LASTEXITCODE -ne 0) { throw "Falló $archivo" }
}

try {
    Invoke-Script "postgres" "00_crear_bd.sql"
    Invoke-Script "bd_sara" "01_ddl.sql"
    Invoke-Script "bd_sara" "02_dml.sql"
    Invoke-Script "bd_sara" "03_dcl.sql" @("-v", "clave_api=$claveApi")
    Write-Host ""
    Write-Host "Base de datos bd_sara lista. Ahora configure el archivo .env (DB_USER=sara_api)." -ForegroundColor Green
}
finally {
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}
