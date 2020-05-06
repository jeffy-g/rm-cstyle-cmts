@echo off
rem -----------------------------------------------------------------------
rem 
rem Copyright 2017 motrohi hirotom1107@gmail.com
rem 
rem Licensed under the Apache License, Version 2.0 (the "License");
rem you may not use this file except in compliance with the License.
rem You may obtain a copy of the License at
rem 
rem    http://www.apache.org/licenses/LICENSE-2.0
rem 
rem Unless required by applicable law or agreed to in writing, software
rem distributed under the License is distributed on an "AS IS" BASIS,
rem WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
rem See the License for the specific language governing permissions and
rem limitations under the License.
rem 
rem ------------------------------------------------------------------------

rem nodist %1 && npm test>./logs/v%1.log

if not exist "./logs" mkdir "./logs"

set old=6.0
set latest=14

set NODE_V=
for /f "usebackq delims=" %%a in (`node -v`) do set NODE_V=%%a
set NODE_V=%NODE_V:v=%
if not "%NODE_V%"=="" set latest=%NODE_V%
rem echo NODE_V=%NODE_V%, latest=%latest%

rem
rem ATTENTION: need nodist
rem
nodist npm 5 && nodist %old% && npm run bench>./logs/node-old.log && nodist npm 6 && nodist %latest% && npm run bench>./logs/node-latest.log && npx gulp readme
