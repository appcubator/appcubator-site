#! /bin/bash
fab prod pull:'site' pull:'codegen' pull:'deploy' pull:'sysadmin' install_requirements install_codegen sync_and_migrate reload_servers build_static
