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

set old=4
set latest=10
rem
rem ATTENTION: need nodist
rem
nodist %old% && npm run bench>./logs/node-old.log && nodist %latest% && npm run bench>./logs/node-latest.log && gulp readme
