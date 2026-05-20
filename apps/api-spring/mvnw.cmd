@REM Maven Wrapper Script for Windows
@REM Licensed to the Apache Software Foundation (ASF) under one or more
@REM contributor license agreements.

@IF EXIST "%~dp0.mvn\wrapper\maven-wrapper.jar" (
  @"%JAVA_HOME%\bin\java.exe" ^
    -cp "%~dp0.mvn\wrapper\maven-wrapper.jar" ^
    "-Dmaven.multiModuleProjectDirectory=%~dp0" ^
    org.apache.maven.wrapper.MavenWrapperMain %*
) ELSE (
  @WHERE mvn >nul 2>&1
  @IF ERRORLEVEL 1 (
    @ECHO ERROR: Neither Maven Wrapper jar nor system mvn found. 1>&2
    @ECHO Run: mvn wrapper:wrapper  to generate the wrapper jar. 1>&2
    @EXIT /B 1
  )
  @mvn %*
)
