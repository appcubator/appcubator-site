#! /bin/bash
fab prod pull:'codegen' install_codegen pull:'site' install_requirements reload_servers build_static
