#!/bin/bash
sudo su
apt-get update
apt-get -y install software-properties-common python-software-properties debconf-utils
add-apt-repository -y ppa:ondrej/mysql
apt-get update
export DEBIAN_FRONTEND=noninteractive
apt-get -y install mysql-client-5.6 mysql-server-5.6

apt-get -y install python-pip git
pip install virtualenv

mkdir -p /var/www/

mkdir -p /root/.ssh/
touch /root/.ssh/known_hosts -m 0700
ssh-keyscan -H github.com >> ~/.ssh/known_hosts
cd /var/www/ && git clone git@github.com:appcubator/appcubator-site
cd /var/www/ && git clone git@github.com:appcubator/appcubator-codegen

cd /var/www/appcubator-site && virtualenv venv
source /var/www/appcubator-site/venv/bin/activate && pip install -r requirements.txt
source /var/www/appcubator-site/venv/bin/activate && pip install /var/www/appcubator-codegen

source /var/www/appcubator-site/venv/bin/activate && cd /var/www/appcubator-site && ./manage.py syncdb --noinput
source /var/www/appcubator-site/venv/bin/activate && cd /var/www/appcubator-site && ./manage.py migrate --noinput
