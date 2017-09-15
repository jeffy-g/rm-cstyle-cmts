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

rem
rem ATTENTION: need nodist
rem
nodist 5 && npm run bench>./logs/v5.log && nodist 8 && npm run bench>./logs/v8.log && gulp readme
