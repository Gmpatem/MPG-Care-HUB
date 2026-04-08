@echo off
setlocal EnableDelayedExpansion

REM ==========================================
REM    MPG CARE HUB - COMPLETE REPO SCANNER
REM    Generates comprehensive AI-ready context
REM ==========================================

set "REPO_PATH=E:\mpg-care-hub"
set "OUTPUT=%REPO_PATH%\ai-context"
set "TIMESTAMP=%date% %time%"

echo ==========================================
echo    MPG CARE HUB - COMPLETE REPO SCANNER
echo ==========================================
echo.
echo This will generate comprehensive AI context files
echo for UI/UX analysis of your healthcare web app.
echo.
echo Output directory: %OUTPUT%
echo.

REM Create output directory
if not exist "%OUTPUT%" (
    mkdir "%OUTPUT%"
    echo [OK] Created output directory
) else (
    echo [OK] Output directory exists
)

REM ==========================================
REM FILE A: 00-project-structure.md
REM ==========================================
echo.
echo [1/6] Generating project structure...

(
echo # 📁 Project Structure
echo **Generated:** %TIMESTAMP%
echo **Repository:** %REPO_PATH%
echo.
echo ## Directory Tree
echo ```
) > "%OUTPUT%\00-project-structure.md"

REM Generate tree excluding common directories
tree "%REPO_PATH%" /F /A 2>nul | findstr /V /I "node_modules" | findstr /V /I "\.git" | findstr /V /I "dist" | findstr /V /I "build" | findstr /V /I "coverage" | findstr /V /I "\.next" >> "%OUTPUT%\00-project-structure.md"

(
echo ```
echo.
echo ## File Statistics by Type
echo.
) >> "%OUTPUT%\00-project-structure.md"

REM Count files by extension
set "FILE_COUNTS="
for %%E in (tsx ts jsx js css scss less vue html json md) do (
    set "COUNT=0"
    for /f "delims=" %%F in ('dir /S /B "%REPO_PATH%\*.%%E" 2^>nul ^| find /C /V ""') do (
        set "COUNT=%%F"
    )
    if !COUNT! GTR 0 (
        echo - **.%%E**: !COUNT! files >> "%OUTPUT%\00-project-structure.md"
    )
)

(
echo.
echo ## Directory Overview
echo.
echo | Directory | Description |
echo |-----------|-------------|
echo | `src/` | Source code |
echo | `public/` | Static assets |
echo | `components/` | UI components |
echo | `app/` | Next.js App Router pages |
echo | `features/` | Feature-based modules |
echo | `lib/` | Utility libraries |
) >> "%OUTPUT%\00-project-structure.md"

echo [OK] 00-project-structure.md created

REM ==========================================
REM FILE B: 01-tech-stack-config.md
REM ==========================================
echo [2/6] Extracting tech stack and configs...

(
echo # ⚙️ Tech Stack and Configuration
echo **Generated:** %TIMESTAMP%
echo.
echo ## Package.json
echo.
echo ```json
) > "%OUTPUT%\01-tech-stack-config.md"

if exist "%REPO_PATH%\package.json" (
    type "%REPO_PATH%\package.json" >> "%OUTPUT%\01-tech-stack-config.md"
) else (
    echo // package.json not found >> "%OUTPUT%\01-tech-stack-config.md"
)

echo ``` >> "%OUTPUT%\01-tech-stack-config.md"

REM Detect tech stack from package.json
echo. >> "%OUTPUT%\01-tech-stack-config.md"
echo ## Detected Tech Stack >> "%OUTPUT%\01-tech-stack-config.md"
echo. >> "%OUTPUT%\01-tech-stack-config.md"

if exist "%REPO_PATH%\package.json" (
    findstr /I "next" "%REPO_PATH%\package.json" >nul && echo - **Framework:** Next.js >> "%OUTPUT%\01-tech-stack-config.md"
    findstr /I "react" "%REPO_PATH%\package.json" >nul && echo - **UI Library:** React >> "%OUTPUT%\01-tech-stack-config.md"
    findstr /I "vue" "%REPO_PATH%\package.json" >nul && echo - **Framework:** Vue.js >> "%OUTPUT%\01-tech-stack-config.md"
    findstr /I "tailwindcss" "%REPO_PATH%\package.json" >nul && echo - **Styling:** Tailwind CSS >> "%OUTPUT%\01-tech-stack-config.md"
    findstr /I "@mui" "%REPO_PATH%\package.json" >nul && echo - **UI Components:** Material-UI >> "%OUTPUT%\01-tech-stack-config.md"
    findstr /I "antd" "%REPO_PATH%\package.json" >nul && echo - **UI Components:** Ant Design >> "%OUTPUT%\01-tech-stack-config.md"
    findstr /I "framer-motion" "%REPO_PATH%\package.json" >nul && echo - **Animation:** Framer Motion >> "%OUTPUT%\01-tech-stack-config.md"
    findstr /I "redux" "%REPO_PATH%\package.json" >nul && echo - **State:** Redux >> "%OUTPUT%\01-tech-stack-config.md"
    findstr /I "zustand" "%REPO_PATH%\package.json" >nul && echo - **State:** Zustand >> "%OUTPUT%\01-tech-stack-config.md"
)

REM Add config files
echo. >> "%OUTPUT%\01-tech-stack-config.md"
echo ## Configuration Files >> "%OUTPUT%\01-tech-stack-config.md"
echo. >> "%OUTPUT%\01-tech-stack-config.md"

for %%F in (tsconfig.json next.config.ts next.config.js next.config.mjs tailwind.config.ts tailwind.config.js vite.config.ts vite.config.js postcss.config.mjs postcss.config.js) do (
    if exist "%REPO_PATH%\%%F" (
        echo ### %%F >> "%OUTPUT%\01-tech-stack-config.md"
        echo ```json >> "%OUTPUT%\01-tech-stack-config.md"
        type "%REPO_PATH%\%%F" >> "%OUTPUT%\01-tech-stack-config.md"
        echo ``` >> "%OUTPUT%\01-tech-stack-config.md"
        echo. >> "%OUTPUT%\01-tech-stack-config.md"
    )
)

REM Add env example
echo ## Environment Variables >> "%OUTPUT%\01-tech-stack-config.md"
echo. >> "%OUTPUT%\01-tech-stack-config.md"

if exist "%REPO_PATH%\.env.example" (
    echo ### .env.example >> "%OUTPUT%\01-tech-stack-config.md"
    echo ```env >> "%OUTPUT%\01-tech-stack-config.md"
    type "%REPO_PATH%\.env.example" >> "%OUTPUT%\01-tech-stack-config.md"
    echo ``` >> "%OUTPUT%\01-tech-stack-config.md"
) else if exist "%REPO_PATH%\.env.local" (
    echo ### .env.local ^(sanitized^) >> "%OUTPUT%\01-tech-stack-config.md"
    echo ```env >> "%OUTPUT%\01-tech-stack-config.md"
    type "%REPO_PATH%\.env.local" | findstr /V /R "^[A-Z_]*=sk-" | findstr /V /R "^[A-Z_]*=pk_" | findstr /V /R "^[A-Z_]*=[a-zA-Z0-9]\{20,\}" >> "%OUTPUT%\01-tech-stack-config.md"
    echo ``` >> "%OUTPUT%\01-tech-stack-config.md"
) else (
    echo *No environment configuration files found* >> "%OUTPUT%\01-tech-stack-config.md"
)

echo [OK] 01-tech-stack-config.md created

REM ==========================================
REM FILE C: 02-component-inventory.md
REM ==========================================
echo [3/6] Scanning component inventory...

(
echo # 🧩 Component Inventory
echo **Generated:** %TIMESTAMP%
echo.
echo ## Summary
echo This document catalogs all React/Vue components found in the codebase.
echo.
) > "%OUTPUT%\02-component-inventory.md"

REM Scan for components
echo ### Pages / Routes >> "%OUTPUT%\02-component-inventory.md"
echo. >> "%OUTPUT%\02-component-inventory.md"
echo | File | Route | Description | >> "%OUTPUT%\02-component-inventory.md"
echo |------|-------|-------------| >> "%OUTPUT%\02-component-inventory.md"

for /f "delims=" %%F in ('dir /S /B "%REPO_PATH%\src\app\*\page.tsx" "%REPO_PATH%\src\app\*\page.jsx" "%REPO_PATH%\src\pages\*.tsx" "%REPO_PATH%\src\pages\*.jsx" 2^>nul') do (
    set "FILE=%%~nxF"
    set "PATH=%%~dpF"
    set "PATH=!PATH:%REPO_PATH%=!"
    echo | !PATH!!FILE! | | | >> "%OUTPUT%\02-component-inventory.md"
)

echo. >> "%OUTPUT%\02-component-inventory.md"
echo ### UI Components >> "%OUTPUT%\02-component-inventory.md"
echo. >> "%OUTPUT%\02-component-inventory.md"
echo | Component | File | Props | State | >> "%OUTPUT%\02-component-inventory.md"
echo |-----------|------|-------|-------| >> "%OUTPUT%\02-component-inventory.md"

for /f "delims=" %%F in ('dir /S /B "%REPO_PATH%\src\components\*.tsx" "%REPO_PATH%\src\components\*.jsx" "%REPO_PATH%\src\components\*.vue" 2^>nul') do (
    set "FILE=%%~nxF"
    set "NAME=!FILE:.tsx=!"
    set "NAME=!NAME:.jsx=!"
    set "NAME=!NAME:.vue=!"
    set "REL=%%F"
    set "REL=!REL:%REPO_PATH%=!"
    echo | !NAME! | !REL! | | | >> "%OUTPUT%\02-component-inventory.md"
)

echo. >> "%OUTPUT%\02-component-inventory.md"
echo ### Custom Hooks >> "%OUTPUT%\02-component-inventory.md"
echo. >> "%OUTPUT%\02-component-inventory.md"

for /f "delims=" %%F in ('dir /S /B "%REPO_PATH%\src\hooks\*.ts" "%REPO_PATH%\src\hooks\*.js" 2^>nul') do (
    echo - %%~nxF >> "%OUTPUT%\02-component-inventory.md"
)

echo. >> "%OUTPUT%\02-component-inventory.md"
echo ### Utility Functions >> "%OUTPUT%\02-component-inventory.md"
echo. >> "%OUTPUT%\02-component-inventory.md"

for /f "delims=" %%F in ('dir /S /B "%REPO_PATH%\src\lib\*.ts" "%REPO_PATH%\src\lib\*.js" "%REPO_PATH%\src\utils\*.ts" "%REPO_PATH%\src\utils\*.js" 2^>nul') do (
    echo - %%~nxF >> "%OUTPUT%\02-component-inventory.md"
)

echo [OK] 02-component-inventory.md created

REM ==========================================
REM FILE D: 03-source-code-analysis.md
REM ==========================================
echo [4/6] Analyzing source code...

(
echo # 💻 Source Code Analysis
echo **Generated:** %TIMESTAMP%
echo **Note:** Files over 500 lines are truncated
echo.
) > "%OUTPUT%\03-source-code-analysis.md"

set "LINE_COUNT=0"
set "FILE_COUNT=0"

for /f "delims=" %%F in ('dir /S /B "%REPO_PATH%\src\*.tsx" "%REPO_PATH%\src\*.ts" "%REPO_PATH%\src\*.jsx" "%REPO_PATH%\src\*.js" "%REPO_PATH%\src\*.vue" "%REPO_PATH%\src\*.css" "%REPO_PATH%\src\*.scss" 2^>nul ^| findstr /V /I "node_modules"') do (
    set /a FILE_COUNT+=1
    set "FILE_PATH=%%F"
    set "REL_PATH=!FILE_PATH:%REPO_PATH%=!"
    set "EXT=%%~xF"
    
    echo ### !REL_PATH! >> "%OUTPUT%\03-source-code-analysis.md"
    echo. >> "%OUTPUT%\03-source-code-analysis.md"
    
    REM Determine language for syntax highlighting
    if "!EXT!"==".tsx" echo ```tsx >> "%OUTPUT%\03-source-code-analysis.md"
    if "!EXT!"==".ts" echo ```typescript >> "%OUTPUT%\03-source-code-analysis.md"
    if "!EXT!"==".jsx" echo ```jsx >> "%OUTPUT%\03-source-code-analysis.md"
    if "!EXT!"==".js" echo ```javascript >> "%OUTPUT%\03-source-code-analysis.md"
    if "!EXT!"==".vue" echo ```vue >> "%OUTPUT%\03-source-code-analysis.md"
    if "!EXT!"==".css" echo ```css >> "%OUTPUT%\03-source-code-analysis.md"
    if "!EXT!"==".scss" echo ```scss >> "%OUTPUT%\03-source-code-analysis.md"
    
    REM Count lines and copy (truncate if >500 lines)
    set "LOCAL_COUNT=0"
    for /f "delims=" %%L in ('type "%%F" 2^>nul') do (
        set /a LOCAL_COUNT+=1
        if !LOCAL_COUNT! LEQ 500 (
            echo %%L >> "%OUTPUT%\03-source-code-analysis.md"
        )
    )
    
    if !LOCAL_COUNT! GTR 500 (
        echo ... [truncated - !LOCAL_COUNT! total lines] >> "%OUTPUT%\03-source-code-analysis.md"
    )
    
    echo ``` >> "%OUTPUT%\03-source-code-analysis.md"
    echo. >> "%OUTPUT%\03-source-code-analysis.md"
    echo --- >> "%OUTPUT%\03-source-code-analysis.md"
    echo. >> "%OUTPUT%\03-source-code-analysis.md"
    
    REM Progress indicator every 10 files
    set /a MOD=!FILE_COUNT! %% 10
    if !MOD!==0 echo     Processed !FILE_COUNT! files...
)

echo [OK] 03-source-code-analysis.md created ^(!FILE_COUNT! files^)

REM ==========================================
REM FILE E: 04-styling-analysis.md
REM ==========================================
echo [5/6] Analyzing styling patterns...

(
echo # 🎨 Styling Analysis
echo **Generated:** %TIMESTAMP%
echo.
echo ## CSS/SCSS Files
echo.
) > "%OUTPUT%\04-styling-analysis.md"

for /f "delims=" %%F in ('dir /S /B "%REPO_PATH%\src\*.css" "%REPO_PATH%\src\*.scss" "%REPO_PATH%\src\*.less" "%REPO_PATH%\src\*.module.css" 2^>nul') do (
    set "REL=%%F"
    set "REL=!REL:%REPO_PATH%=!"
    echo ### !REL! >> "%OUTPUT%\04-styling-analysis.md"
    echo ```css >> "%OUTPUT%\04-styling-analysis.md"
    type "%%F" >> "%OUTPUT%\04-styling-analysis.md" 2>nul
    echo ``` >> "%OUTPUT%\04-styling-analysis.md"
    echo. >> "%OUTPUT%\04-styling-analysis.md"
)

echo. >> "%OUTPUT%\04-styling-analysis.md"
echo ## Tailwind CSS Classes Analysis >> "%OUTPUT%\04-styling-analysis.md"
echo. >> "%OUTPUT%\04-styling-analysis.md"

echo ### Common className Patterns Found: >> "%OUTPUT%\04-styling-analysis.md"
echo. >> "%OUTPUT%\04-styling-analysis.md"

REM Extract common Tailwind patterns
for /f "delims=" %%F in ('dir /S /B "%REPO_PATH%\src\*.tsx" "%REPO_PATH%\src\*.jsx" 2^>nul') do (
    findstr /R "className=" "%%F" 2>nul | findstr /V "//" >> "%OUTPUT%\04-styling-analysis.md.tmp"
)

REM Count unique class patterns
if exist "%OUTPUT%\04-styling-analysis.md.tmp" (
    type "%OUTPUT%\04-styling-analysis.md.tmp" | findstr /R "rounded" | find /C /V "" > nul && echo - Found `rounded-*` border radius classes >> "%OUTPUT%\04-styling-analysis.md"
    type "%OUTPUT%\04-styling-analysis.md.tmp" | findstr /R "shadow" | find /C /V "" > nul && echo - Found `shadow-*` elevation classes >> "%OUTPUT%\04-styling-analysis.md"
    type "%OUTPUT%\04-styling-analysis.md.tmp" | findstr /R "p-[0-9]" | find /C /V "" > nul && echo - Found `p-*` padding classes >> "%OUTPUT%\04-styling-analysis.md"
    type "%OUTPUT%\04-styling-analysis.md.tmp" | findstr /R "m-[0-9]" | find /C /V "" > nul && echo - Found `m-*` margin classes >> "%OUTPUT%\04-styling-analysis.md"
    type "%OUTPUT%\04-styling-analysis.md.tmp" | findstr /R "grid" | find /C /V "" > nul && echo - Found `grid` layout classes >> "%OUTPUT%\04-styling-analysis.md"
    type "%OUTPUT%\04-styling-analysis.md.tmp" | findstr /R "flex" | find /C /V "" > nul && echo - Found `flex` layout classes >> "%OUTPUT%\04-styling-analysis.md"
    del "%OUTPUT%\04-styling-analysis.md.tmp" 2>nul
)

echo. >> "%OUTPUT%\04-styling-analysis.md"
echo ## CSS Variables / Theme Tokens >> "%OUTPUT%\04-styling-analysis.md"
echo. >> "%OUTPUT%\04-styling-analysis.md"

if exist "%REPO_PATH%\src\app\globals.css" (
    echo ### globals.css >> "%OUTPUT%\04-styling-analysis.md"
    echo ```css >> "%OUTPUT%\04-styling-analysis.md"
    type "%REPO_PATH%\src\app\globals.css" >> "%OUTPUT%\04-styling-analysis.md"
    echo ``` >> "%OUTPUT%\04-styling-analysis.md"
)

echo. >> "%OUTPUT%\04-styling-analysis.md"
echo ## Color Palette Detected >> "%OUTPUT%\04-styling-analysis.md"
echo. >> "%OUTPUT%\04-styling-analysis.md"

REM Try to extract colors from globals.css
if exist "%REPO_PATH%\src\app\globals.css" (
    type "%REPO_PATH%\src\app\globals.css" | findstr /R "#[0-9a-fA-F]\{3,6\}" > "%OUTPUT%\colors.tmp" 2>nul
    if exist "%OUTPUT%\colors.tmp" (
        echo ### Hex Colors in globals.css: >> "%OUTPUT%\04-styling-analysis.md"
        type "%OUTPUT%\colors.tmp" >> "%OUTPUT%\04-styling-analysis.md"
        del "%OUTPUT%\colors.tmp" 2>nul
    )
)

echo [OK] 04-styling-analysis.md created

REM ==========================================
REM FILE F: 05-assets-media.md
REM ==========================================
echo [6/6] Cataloging assets and media...

(
echo # 🖼️ Assets and Media
echo **Generated:** %TIMESTAMP%
echo.
echo ## Public Directory Structure
echo.
) > "%OUTPUT%\05-assets-media.md"

if exist "%REPO_PATH%\public" (
    echo ``` >> "%OUTPUT%\05-assets-media.md"
    tree "%REPO_PATH%\public" /F /A 2>nul >> "%OUTPUT%\05-assets-media.md"
    echo ``` >> "%OUTPUT%\05-assets-media.md"
) else (
    echo *No public directory found* >> "%OUTPUT%\05-assets-media.md"
)

echo. >> "%OUTPUT%\05-assets-media.md"
echo ## Image Assets >> "%OUTPUT%\05-assets-media.md"
echo. >> "%OUTPUT%\05-assets-media.md"

for %%E in (svg png jpg jpeg webp gif ico) do (
    set "COUNT=0"
    for /f "delims=" %%F in ('dir /S /B "%REPO_PATH%\public\*.%%E" "%REPO_PATH%\src\*.%%E" 2^>nul') do (
        set /a COUNT+=1
    )
    if !COUNT! GTR 0 (
        echo - **.%%E**: !COUNT! files >> "%OUTPUT%\05-assets-media.md"
    )
)

echo. >> "%OUTPUT%\05-assets-media.md"
echo ## Font Files >> "%OUTPUT%\05-assets-media.md"
echo. >> "%OUTPUT%\05-assets-media.md"

for %%E in (woff woff2 ttf eot otf) do (
    set "COUNT=0"
    for /f "delims=" %%F in ('dir /S /B "%REPO_PATH%\*.%%E" 2^>nul') do (
        set /a COUNT+=1
    )
    if !COUNT! GTR 0 (
        echo - **.%%E**: !COUNT! files >> "%OUTPUT%\05-assets-media.md"
    )
)

echo. >> "%OUTPUT%\05-assets-media.md"
echo ## Icon Libraries Detected >> "%OUTPUT%\05-assets-media.md"
echo. >> "%OUTPUT%\05-assets-media.md"

if exist "%REPO_PATH%\package.json" (
    findstr /I "lucide-react" "%REPO_PATH%\package.json" >nul && echo - [x] **Lucide React** - Modern icon library >> "%OUTPUT%\05-assets-media.md"
    findstr /I "@heroicons" "%REPO_PATH%\package.json" >nul && echo - [x] **Heroicons** - Tailwind icon set >> "%OUTPUT%\05-assets-media.md"
    findstr /I "@radix-ui" "%REPO_PATH%\package.json" >nul && echo - [x] **Radix UI** - Headless UI primitives >> "%OUTPUT%\05-assets-media.md"
    findstr /I "react-icons" "%REPO_PATH%\package.json" >nul && echo - [x] **React Icons** - Popular icon collections >> "%OUTPUT%\05-assets-media.md"
    findstr /I "@mui/icons-material" "%REPO_PATH%\package.json" >nul && echo - [x] **MUI Icons** - Material Design icons >> "%OUTPUT%\05-assets-media.md"
)

echo [OK] 05-assets-media.md created

REM ==========================================
REM MASTER FILE: Concatenate all
REM ==========================================
echo.
echo Creating MASTER-FULL-CONTEXT.md...

REM Detect tech stack for header
set "FRAMEWORK=Unknown"
set "STYLING=Unknown"
set "STATE=Unknown"
set "UI_LIB=Custom"

if exist "%REPO_PATH%\package.json" (
    findstr /I "next" "%REPO_PATH%\package.json" >nul && set "FRAMEWORK=Next.js"
    findstr /I "react" "%REPO_PATH%\package.json" >nul && set "FRAMEWORK=React"
    findstr /I "tailwindcss" "%REPO_PATH%\package.json" >nul && set "STYLING=Tailwind CSS"
    findstr /I "framer-motion" "%REPO_PATH%\package.json" >nul && set "ANIMATION=Framer Motion"
    findstr /I "sonner" "%REPO_PATH%\package.json" >nul && set "TOAST=Sonner"
)

(
echo # 🤖 FULL PROJECT CONTEXT: MPG Care Hub
echo **Generated:** %TIMESTAMP%
echo **Path:** %REPO_PATH%
echo.
echo ^>^>^> **AI INSTRUCTION:** This file contains the complete technical context 
echo ^>^>^> of a healthcare web application. Analyze for UI/UX improvements 
echo ^>^>^> specifically focusing on: Card design, Responsiveness, Loading states, 
echo ^>^>^> Page transitions, and Notification systems.
echo.
echo ---
echo.
echo ## 📊 Tech Stack Summary
echo.
echo | Category | Technology |
echo |----------|------------|
echo | Framework | %FRAMEWORK% |
echo | Styling | %STYLING% |
echo | Animation | %ANIMATION% |
echo | Toast Notifications | %TOAST% |
echo.
echo ---
echo.
echo # TABLE OF CONTENTS
echo.
echo 1. [Project Structure](#1-project-structure^)
echo 2. [Tech Stack and Configuration](#2-tech-stack-and-configuration^)
echo 3. [Component Inventory](#3-component-inventory^)
echo 4. [Source Code Analysis](#4-source-code-analysis^)
echo 5. [Styling Analysis](#5-styling-analysis^)
echo 6. [Assets and Media](#6-assets-and-media^)
echo.
echo ================================================================================
) > "%OUTPUT%\MASTER-FULL-CONTEXT.md"

REM Concatenate all files
for %%F in ("%OUTPUT%\00-project-structure.md") do (
    echo. >> "%OUTPUT%\MASTER-FULL-CONTEXT.md"
    type "%%F" >> "%OUTPUT%\MASTER-FULL-CONTEXT.md"
    echo. >> "%OUTPUT%\MASTER-FULL-CONTEXT.md"
    echo ================================================================================ >> "%OUTPUT%\MASTER-FULL-CONTEXT.md"
)

for %%F in ("%OUTPUT%\01-tech-stack-config.md") do (
    echo. >> "%OUTPUT%\MASTER-FULL-CONTEXT.md"
    type "%%F" >> "%OUTPUT%\MASTER-FULL-CONTEXT.md"
    echo. >> "%OUTPUT%\MASTER-FULL-CONTEXT.md"
    echo ================================================================================ >> "%OUTPUT%\MASTER-FULL-CONTEXT.md"
)

for %%F in ("%OUTPUT%\02-component-inventory.md") do (
    echo. >> "%OUTPUT%\MASTER-FULL-CONTEXT.md"
    type "%%F" >> "%OUTPUT%\MASTER-FULL-CONTEXT.md"
    echo. >> "%OUTPUT%\MASTER-FULL-CONTEXT.md"
    echo ================================================================================ >> "%OUTPUT%\MASTER-FULL-CONTEXT.md"
)

for %%F in ("%OUTPUT%\03-source-code-analysis.md") do (
    echo. >> "%OUTPUT%\MASTER-FULL-CONTEXT.md"
    type "%%F" >> "%OUTPUT%\MASTER-FULL-CONTEXT.md"
    echo. >> "%OUTPUT%\MASTER-FULL-CONTEXT.md"
    echo ================================================================================ >> "%OUTPUT%\MASTER-FULL-CONTEXT.md"
)

for %%F in ("%OUTPUT%\04-styling-analysis.md") do (
    echo. >> "%OUTPUT%\MASTER-FULL-CONTEXT.md"
    type "%%F" >> "%OUTPUT%\MASTER-FULL-CONTEXT.md"
    echo. >> "%OUTPUT%\MASTER-FULL-CONTEXT.md"
    echo ================================================================================ >> "%OUTPUT%\MASTER-FULL-CONTEXT.md"
)

for %%F in ("%OUTPUT%\05-assets-media.md") do (
    echo. >> "%OUTPUT%\MASTER-FULL-CONTEXT.md"
    type "%%F" >> "%OUTPUT%\MASTER-FULL-CONTEXT.md"
)

echo [OK] MASTER-FULL-CONTEXT.md created

REM ==========================================
REM Summary
REM ==========================================
echo.
echo ==========================================
echo    SCAN COMPLETE!
echo ==========================================
echo.
echo Output directory: %OUTPUT%
echo.
echo Files generated:
echo   ^├── 00-project-structure.md
echo   ^├── 01-tech-stack-config.md
echo   ^├── 02-component-inventory.md
echo   ^├── 03-source-code-analysis.md
echo   ^├── 04-styling-analysis.md
echo   ^├── 05-assets-media.md
echo   ^└── MASTER-FULL-CONTEXT.md  ^<-- USE THIS WITH AI
echo.
echo Next steps:
echo   1. Open MASTER-FULL-CONTEXT.md in your editor
echo   2. Copy contents and paste into ChatGPT/Claude/Kimi
echo   3. Or upload as a file attachment
echo.
pause
endlocal
