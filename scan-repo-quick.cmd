@echo off
setlocal EnableDelayedExpansion

REM ==========================================
REM    MPG CARE HUB - QUICK REPO SCANNER
REM    Fast scan for immediate AI analysis
REM ==========================================

set "REPO_PATH=E:\mpg-care-hub"
set "OUTPUT=%REPO_PATH%\ai-context-quick"
set "TIMESTAMP=%date% %time%"

echo ==========================================
echo    MPG CARE HUB - QUICK SCANNER
echo ==========================================
echo.
echo This performs a fast scan for quick AI analysis.
echo For comprehensive scanning, use: scan-repo-complete.cmd
echo.

REM Create output directory
if not exist "%OUTPUT%" mkdir "%OUTPUT%"

REM ==========================================
REM QUICK CONTEXT FILE
REM ==========================================
echo [1/3] Scanning project structure...

set "TOTAL_FILES=0"
set "TSX_FILES=0"
set "TS_FILES=0"
set "CSS_FILES=0"

for /f "delims=" %%F in ('dir /S /B "%REPO_PATH%\src\*.tsx" 2^>nul') do set /a TSX_FILES+=1
for /f "delims=" %%F in ('dir /S /B "%REPO_PATH%\src\*.ts" 2^>nul') do set /a TS_FILES+=1
for /f "delims=" %%F in ('dir /S /B "%REPO_PATH%\src\*.css" "%REPO_PATH%\src\*.scss" 2^>nul') do set /a CSS_FILES+=1

set /a TOTAL_FILES=%TSX_FILES%+%TS_FILES%+%CSS_FILES%

echo [2/3] Generating quick context file...

(
echo # 🤖 MPG CARE HUB - QUICK AI CONTEXT
echo **Generated:** %TIMESTAMP%
echo **Repository:** %REPO_PATH%
echo.
echo ## Quick Stats
echo - **Total Source Files:** %TOTAL_FILES%
echo - **React Components (.tsx):** %TSX_FILES%
echo - **TypeScript Files (.ts):** %TS_FILES%
echo - **Style Files (.css/.scss):** %CSS_FILES%
echo.
echo ---
echo.
echo ## 🏥 Project Overview
echo **MPG Care Hub** is a healthcare management web application.
echo.
echo ---
echo.
echo ## ⚙️ Tech Stack
echo.
) > "%OUTPUT%\quick-context.md"

REM Extract tech stack
if exist "%REPO_PATH%\package.json" (
    echo ### Dependencies >> "%OUTPUT%\quick-context.md"
    echo ```json >> "%OUTPUT%\quick-context.md"
    type "%REPO_PATH%\package.json" >> "%OUTPUT%\quick-context.md"
    echo ``` >> "%OUTPUT%\quick-context.md"
    echo. >> "%OUTPUT%\quick-context.md"
)

echo ### Configuration Files >> "%OUTPUT%\quick-context.md"
echo. >> "%OUTPUT%\quick-context.md"

for %%F in (tsconfig.json next.config.ts tailwind.config.ts postcss.config.mjs) do (
    if exist "%REPO_PATH%\%%F" (
        echo #### %%F >> "%OUTPUT%\quick-context.md"
        echo ```json >> "%OUTPUT%\quick-context.md"
        type "%REPO_PATH%\%%F" >> "%OUTPUT%\quick-context.md"
        echo ``` >> "%OUTPUT%\quick-context.md"
        echo. >> "%OUTPUT%\quick-context.md"
    )
)

echo --- >> "%OUTPUT%\quick-context.md"
echo. >> "%OUTPUT%\quick-context.md"

REM ==========================================
REM COMPONENT QUICK LIST
REM ==========================================
echo [3/3] Cataloging components...

echo ## 🧩 Component Inventory >> "%OUTPUT%\quick-context.md"
echo. >> "%OUTPUT%\quick-context.md"

echo ### Key Components >> "%OUTPUT%\quick-context.md"
echo. >> "%OUTPUT%\quick-context.md"
for /f "delims=" %%F in ('dir /S /B "%REPO_PATH%\src\components\ui\*.tsx" 2^>nul') do (
    set "NAME=%%~nF"
    echo - `!NAME!` >> "%OUTPUT%\quick-context.md"
)

echo. >> "%OUTPUT%\quick-context.md"
echo ### Layout Components >> "%OUTPUT%\quick-context.md"
echo. >> "%OUTPUT%\quick-context.md"
for /f "delims=" %%F in ('dir /S /B "%REPO_PATH%\src\components\layout\*.tsx" 2^>nul') do (
    set "NAME=%%~nF"
    echo - `!NAME!` >> "%OUTPUT%\quick-context.md"
)

echo. >> "%OUTPUT%\quick-context.md"
echo ### Feature Components >> "%OUTPUT%\quick-context.md"
echo. >> "%OUTPUT%\quick-context.md"
for /d %%D in ("%REPO_PATH%\src\features\*") do (
    set "FEATURE=%%~nxD"
    echo - **!FEATURE!** >> "%OUTPUT%\quick-context.md"
    for /f "delims=" %%F in ('dir /S /B "%%D\*.tsx" 2^>nul') do (
        set "COMP=%%~nF"
        echo   - `!COMP!` >> "%OUTPUT%\quick-context.md"
    )
)

echo. >> "%OUTPUT%\quick-context.md"
echo --- >> "%OUTPUT%\quick-context.md"
echo. >> "%OUTPUT%\quick-context.md"

REM ==========================================
REM KEY SOURCE FILES
REM ==========================================
echo ## 💻 Key Source Files >> "%OUTPUT%\quick-context.md"
echo. >> "%OUTPUT%\quick-context.md"

REM Card component
echo ### Card Component >> "%OUTPUT%\quick-context.md"
echo ```tsx >> "%OUTPUT%\quick-context.md"
if exist "%REPO_PATH%\src\components\ui\card.tsx" (
    type "%REPO_PATH%\src\components\ui\card.tsx" >> "%OUTPUT%\quick-context.md"
) else (
    echo // Card component not found at expected location >> "%OUTPUT%\quick-context.md"
)
echo ``` >> "%OUTPUT%\quick-context.md"
echo. >> "%OUTPUT%\quick-context.md"

REM Button component
echo ### Button Component >> "%OUTPUT%\quick-context.md"
echo ```tsx >> "%OUTPUT%\quick-context.md"
if exist "%REPO_PATH%\src\components\ui\button.tsx" (
    type "%REPO_PATH%\src\components\ui\button.tsx" >> "%OUTPUT%\quick-context.md"
) else (
    echo // Button component not found at expected location >> "%OUTPUT%\quick-context.md"
)
echo ``` >> "%OUTPUT%\quick-context.md"
echo. >> "%OUTPUT%\quick-context.md"

REM Shell/Layout
echo ### Shell Component >> "%OUTPUT%\quick-context.md"
echo ```tsx >> "%OUTPUT%\quick-context.md"
if exist "%REPO_PATH%\src\components\layout\hospital-shell.tsx" (
    type "%REPO_PATH%\src\components\layout\hospital-shell.tsx" >> "%OUTPUT%\quick-context.md"
) else (
    echo // Shell component not found >> "%OUTPUT%\quick-context.md"
)
echo ``` >> "%OUTPUT%\quick-context.md"
echo. >> "%OUTPUT%\quick-context.md"

REM Global styles
echo ### Global Styles >> "%OUTPUT%\quick-context.md"
echo ```css >> "%OUTPUT%\quick-context.md"
if exist "%REPO_PATH%\src\app\globals.css" (
    type "%REPO_PATH%\src\app\globals.css" >> "%OUTPUT%\quick-context.md"
) else (
    echo /* globals.css not found */ >> "%OUTPUT%\quick-context.md"
)
echo ``` >> "%OUTPUT%\quick-context.md"
echo. >> "%OUTPUT%\quick-context.md"

REM ==========================================
REM AI PROMPT TEMPLATE
REM ==========================================
echo. >> "%OUTPUT%\quick-context.md"
echo --- >> "%OUTPUT%\quick-context.md"
echo. >> "%OUTPUT%\quick-context.md"
echo ## 🤖 AI ANALYSIS PROMPT >> "%OUTPUT%\quick-context.md"
echo. >> "%OUTPUT%\quick-context.md"
echo Copy the following prompt and use with the context above: >> "%OUTPUT%\quick-context.md"
echo. >> "%OUTPUT%\quick-context.md"
echo ```` >> "%OUTPUT%\quick-context.md"
echo You are a Senior UI/UX Engineer specializing in healthcare applications. >> "%OUTPUT%\quick-context.md"
echo Analyze the MPG Care Hub codebase above and provide SPECIFIC recommendations. >> "%OUTPUT%\quick-context.md"
echo. >> "%OUTPUT%\quick-context.md"
echo ## PRIORITY 1: CARD COMPONENT SYSTEM >> "%OUTPUT%\quick-context.md"
echo Analyze the Card component and provide: >> "%OUTPUT%\quick-context.md"
echo - Current issues: inconsistent padding, missing hover states, poor shadows >> "%OUTPUT%\quick-context.md"
echo - Standardized specs: padding, border-radius, shadow, transition >> "%OUTPUT%\quick-context.md"
echo - Refactored Card.tsx code >> "%OUTPUT%\quick-context.md"
echo. >> "%OUTPUT%\quick-context.md"
echo ## PRIORITY 2: RESPONSIVE DESIGN AUDIT >> "%OUTPUT%\quick-context.md"
echo - Current breakpoints found >> "%OUTPUT%\quick-context.md"
echo - Mobile-specific issues >> "%OUTPUT%\quick-context.md"
echo - Recommended fixes: minmax grids, media queries, font scaling >> "%OUTPUT%\quick-context.md"
echo. >> "%OUTPUT%\quick-context.md"
echo ## PRIORITY 3: LOADING EXPERIENCE >> "%OUTPUT%\quick-context.md"
echo - Skeleton screens implementation >> "%OUTPUT%\quick-context.md"
echo - Route-level loading.tsx for Next.js >> "%OUTPUT%\quick-context.md"
echo - Button loading states >> "%OUTPUT%\quick-context.md"
echo. >> "%OUTPUT%\quick-context.md"
echo ## PRIORITY 4: PAGE TRANSITIONS ^& NOTIFICATIONS >> "%OUTPUT%\quick-context.md"
echo - Route change animations >> "%OUTPUT%\quick-context.md"
echo - Toast notification system (Sonner already installed) >> "%OUTPUT%\quick-context.md"
echo - Form submit feedback >> "%OUTPUT%\quick-context.md"
echo. >> "%OUTPUT%\quick-context.md"
echo ## PRIORITY 5: ACCESSIBILITY (Healthcare Critical) >> "%OUTPUT%\quick-context.md"
echo - Missing aria-labels >> "%OUTPUT%\quick-context.md"
echo - Color contrast issues >> "%OUTPUT%\quick-context.md"
echo - Keyboard navigation gaps >> "%OUTPUT%\quick-context.md"
echo - Required fixes with code examples >> "%OUTPUT%\quick-context.md"
echo. >> "%OUTPUT%\quick-context.md"
echo For each section provide: >> "%OUTPUT%\quick-context.md"
echo - Current code (from context) >> "%OUTPUT%\quick-context.md"
echo - Issues identified >> "%OUTPUT%\quick-context.md"
echo - Refactored code (production-ready) >> "%OUTPUT%\quick-context.md"
echo ```` >> "%OUTPUT%\quick-context.md"

echo.
echo ==========================================
echo    QUICK SCAN COMPLETE!
echo ==========================================
echo.
echo Output: %OUTPUT%\quick-context.md
echo.
echo Stats: %TSX_FILES% components, %TS_FILES% utils, %CSS_FILES% styles
echo.
echo ^>^>^> Next: Open quick-context.md and copy contents to your AI assistant
echo.
pause
endlocal
