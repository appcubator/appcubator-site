#! /bin/bash
fab prod pull:'site' install_requirements reload_servers build_static
