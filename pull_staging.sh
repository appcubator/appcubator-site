#! /bin/bash
fab staging pull:'site' pull:'codegen' pull:'deploy' pull:'sysadmin' install_requirements install_codegen install_analytics sync_and_migrate reload_servers
